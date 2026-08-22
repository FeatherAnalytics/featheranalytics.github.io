/**
 * Client-side mounting for OpenChart figures and scroll-driven chart stories.
 *
 * Two custom elements, both of which hydrate from a `<script type="application/json">`
 * payload their Astro component rendered at build time:
 *
 *   <oc-figure>  a single chart
 *   <oc-story>   a base chart plus cumulative patch steps, driven by scroll
 *
 * Serializing the spec into the DOM rather than importing it here is what keeps
 * the chart data out of this bundle: the spec ships as inert JSON in the page
 * that needs it, and this module stays one shared chunk across every post.
 */
import { createChart, type ChartInstance } from '@opendata-ai/openchart-vanilla';
import { createChartStory, createScrollDriver, type ChartStoryInstance, type ScrollDriver } from '@opendata-ai/openchart-vanilla/story';
import type { ChartSpec, LayerSpec } from '@opendata-ai/openchart-core';
import { themeForMode } from '../lib/charts/theme';
import { sentenceFor, windowQualitySpec } from '../lib/charts/equivalence';

type Mode = 'light' | 'dark';

const currentMode = (): Mode =>
  document.documentElement.classList.contains('dark') ? 'dark' : 'light';

/**
 * Run `onChange` whenever the site's theme class flips, and return a teardown.
 *
 * OpenChart's own `darkMode: 'auto'` reads `prefers-color-scheme`, which this
 * site deliberately does not use — `Base.astro` resolves the OS preference once
 * before paint and writes `html.dark`, so a reader who overrides the OS setting
 * would otherwise get a chart that disagrees with the page around it.
 */
function watchMode(onChange: (mode: Mode) => void): () => void {
  let last = currentMode();
  const observer = new MutationObserver(() => {
    const next = currentMode();
    if (next !== last) {
      last = next;
      onChange(next);
    }
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

/** Mount options for a mode. Watermark off: the figure's own source line credits the data. */
const mountOptions = (mode: Mode) => ({
  theme: themeForMode(mode),
  darkMode: (mode === 'dark' ? 'force' : 'off') as 'force' | 'off',
  responsive: true,
  watermark: false,
});

/**
 * Read and parse a JSON payload a component embedded in an element.
 *
 * Returns null rather than throwing on a missing or malformed payload: one
 * broken figure should degrade to its static fallback (the caption, the source
 * line, and the accessible data table all render server-side) instead of
 * throwing inside a custom-element callback, where the exception would abort
 * upgrading of every later element on the page.
 */
function readPayload<T>(host: Element, selector: string): T | null {
  const node = host.querySelector(selector);
  if (!node?.textContent) {
    console.error('openchart: no payload matching', selector, 'in', host);
    return null;
  }
  try {
    return JSON.parse(node.textContent) as T;
  } catch (error) {
    console.error('openchart: malformed payload in', host, error);
    return null;
  }
}

/**
 * Signal that a chart has mounted so its container can release the reserved
 * height. The server-rendered `min-height` prevents the page from reflowing
 * under the reader while the chart bundle loads; once real content exists the
 * reservation would only add dead space, and CSS drops it on this class.
 */
function markMounted(el: HTMLElement): void {
  el.classList.add('oc-mounted');
}

class OcFigure extends HTMLElement {
  #chart: ChartInstance | null = null;
  #unwatch: (() => void) | null = null;

  connectedCallback(): void {
    const spec = readPayload<ChartSpec | LayerSpec>(this, 'script[data-oc-spec]');
    const mount = this.querySelector<HTMLElement>('[data-oc-mount]');
    if (!spec || !mount) return;

    const render = (mode: Mode) => {
      this.#chart?.destroy();
      this.#chart = createChart(mount, spec, mountOptions(mode));
      markMounted(mount);
    };

    render(currentMode());
    this.#unwatch = watchMode(render);
  }

  disconnectedCallback(): void {
    this.#unwatch?.();
    this.#unwatch = null;
    this.#chart?.destroy();
    this.#chart = null;
  }
}

interface StoryPayload {
  spec: ChartSpec | LayerSpec;
  steps: { spec?: Record<string, unknown>; highlight?: string[] | null; camera?: unknown }[];
}

class OcStory extends HTMLElement {
  #story: ChartStoryInstance | null = null;
  #unwatch: (() => void) | null = null;
  /** Rail buttons, one per step, kept so `aria-current` can move between them. */
  #rail: HTMLButtonElement[] = [];
  #steps: HTMLElement[] = [];

  connectedCallback(): void {
    const payload = readPayload<StoryPayload>(this, 'script[data-oc-story]');
    const mount = this.querySelector<HTMLElement>('[data-oc-mount]');
    if (!payload || !mount) return;

    this.#steps = Array.from(this.querySelectorAll<HTMLElement>('[data-oc-step]'));
    this.#rail = Array.from(this.querySelectorAll<HTMLButtonElement>('[data-oc-rail-button]'));

    const container = this.querySelector<HTMLElement>('[data-oc-steps]');

    const render = (mode: Mode) => {
      this.#story?.destroy();
      this.#story = createChartStory(
        mount,
        {
          spec: payload.spec,
          steps: payload.steps as never,
          triggerPosition: 0.5,
        },
        mountOptions(mode),
      );
      this.#story.setContainer(container);
      this.#steps.forEach((el, i) => this.#story?.registerStep(i, el));
      markMounted(mount);
    };

    render(currentMode());
    this.#unwatch = watchMode(render);

    // The rail doubles as navigation, not just a progress readout: a reader who
    // can see five ticks and cannot click them is being shown a control that
    // isn't one. `goTo` moves the chart, and scrolling the step into view keeps
    // the prose and the chart describing the same thing.
    this.#rail.forEach((button, i) => {
      button.addEventListener('click', () => {
        this.#story?.goTo(i);
        this.#steps[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    // Reflect the active step onto the rail. The story instance exposes
    // `currentStep` but emits no event, so the same IntersectionObserver
    // geometry that drives the story drives the rail's own state here rather
    // than polling `currentStep` on a timer.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = this.#steps.indexOf(entry.target as HTMLElement);
          if (index >= 0) this.#setActive(index);
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    this.#steps.forEach((el) => observer.observe(el));
    this.#observer = observer;
  }

  #observer: IntersectionObserver | null = null;

  #setActive(index: number): void {
    this.#rail.forEach((button, i) => {
      const active = i === index;
      button.setAttribute('tabindex', active ? '0' : '-1');
      if (active) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    this.#steps.forEach((el, i) => el.toggleAttribute('data-oc-active', i === index));
  }

  disconnectedCallback(): void {
    this.#unwatch?.();
    this.#unwatch = null;
    this.#observer?.disconnect();
    this.#observer = null;
    this.#story?.destroy();
    this.#story = null;
  }
}

/**
 * Window × Quality: a scroll story that ends by handing over its own control.
 *
 * Each step carries a fixed decay rate, except the last, whose entry in the
 * payload is `null` — that is what marks it as the interactive step, and there
 * the rate comes from the slider instead.
 *
 * Not built on `createChartStory`. That API merges cumulative deep-partial
 * patches, and every step here replaces the entire dataset, so the patches
 * would be whole specs and the accumulation would buy nothing. It uses the same
 * `createScrollDriver` underneath, so step activation, rapid-scroll behavior,
 * and reduced-motion handling match the patch-driven stories exactly.
 */
class OcQualityStory extends HTMLElement {
  #chart: ChartInstance | null = null;
  #driver: ScrollDriver | null = null;
  #unwatch: (() => void) | null = null;
  #unsubscribe: (() => void) | null = null;

  connectedCallback(): void {
    const decays = readPayload<(number | null)[]>(this, 'script[data-oc-decays]');
    const mount = this.querySelector<HTMLElement>('[data-oc-mount]');
    const slider = this.querySelector<HTMLInputElement>('[data-oc-slider]');
    const readout = this.querySelector<HTMLElement>('[data-oc-readout]');
    const sentence = this.querySelector<HTMLElement>('[data-oc-sentence]');
    if (!decays || !mount || !slider || !readout || !sentence) return;

    const steps = Array.from(this.querySelectorAll<HTMLElement>('[data-oc-step]'));
    const rail = Array.from(this.querySelectorAll<HTMLButtonElement>('[data-oc-rail-button]'));

    let mode: Mode = currentMode();
    // -1 until the first step activates, matching the story driver's own
    // sentinel. Until then the server-rendered opening state stands.
    let active = 0;

    const draw = (decay: number): void => {
      readout.textContent = `${Math.round(decay * 100)}%`;
      sentence.textContent = sentenceFor(decay);
      const spec = windowQualitySpec(decay);
      // `update` morphs between states. Destroy-and-recreate would replay the
      // entrance animation on every pixel of slider travel and on every step.
      if (this.#chart) this.#chart.update(spec);
      else this.#chart = createChart(mount, spec, mountOptions(mode));
      markMounted(mount);
    };

    /** The rate in force right now: the step's, or the slider's on the last step. */
    const currentDecay = (): number => {
      const pinned = decays[active];
      return pinned === null || pinned === undefined ? Number(slider.value) / 100 : pinned;
    };

    const setActive = (index: number): void => {
      if (index < 0 || index >= steps.length || index === active) return;
      active = index;

      rail.forEach((button, i) => {
        const isActive = i === index;
        button.setAttribute('tabindex', isActive ? '0' : '-1');
        if (isActive) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
      });
      steps.forEach((el, i) => el.toggleAttribute('data-oc-active', i === index));

      const pinned = decays[index];
      // Carry the last pinned rate onto the slider so arriving at the
      // interactive step continues from what the reader was just looking at
      // rather than jumping to an unrelated value.
      if (pinned !== null && pinned !== undefined) slider.value = String(Math.round(pinned * 100));
      // A pinned step must not accept slider input, or a reader who scrolls
      // back up finds a control that moves a chart the prose says is fixed.
      slider.disabled = pinned !== null && pinned !== undefined;

      draw(currentDecay());
    };

    draw(currentDecay());

    const driver = createScrollDriver({ triggerPosition: 0.5 });
    driver.setContainer(this.querySelector<HTMLElement>('[data-oc-steps]'));
    steps.forEach((el, i) => driver.registerStep(i, el));
    this.#unsubscribe = driver.progress.subscribe((frame) => {
      if (frame.step >= 0) setActive(frame.step);
    });
    this.#driver = driver;

    slider.addEventListener('input', () => draw(currentDecay()));

    rail.forEach((button, i) => {
      button.addEventListener('click', () => {
        setActive(i);
        steps[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    this.#unwatch = watchMode((next) => {
      mode = next;
      this.#chart?.destroy();
      this.#chart = null;
      draw(currentDecay());
    });
  }

  disconnectedCallback(): void {
    this.#unwatch?.();
    this.#unwatch = null;
    this.#unsubscribe?.();
    this.#unsubscribe = null;
    this.#driver?.destroy();
    this.#driver = null;
    this.#chart?.destroy();
    this.#chart = null;
  }
}

if (!customElements.get('oc-figure')) customElements.define('oc-figure', OcFigure);
if (!customElements.get('oc-story')) customElements.define('oc-story', OcStory);
if (!customElements.get('oc-quality-story')) customElements.define('oc-quality-story', OcQualityStory);
