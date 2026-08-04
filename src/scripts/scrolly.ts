/**
 * Scroll-driven step state for a chart section.
 *
 * Does two things and nothing else: set one integer on the host element as the
 * reader scrolls, and hand a control's value to the chart module that owns the
 * section. Every step's geometry is already in the DOM from the build, so
 * stepping is a CSS attribute change, not a redraw.
 */

import { recompute as ppf } from '../lib/charts/ppf';
import { recompute as windowQuality } from '../lib/charts/windowQuality';
import { recompute as budget } from '../lib/charts/budget';
import { recompute as jevons } from '../lib/charts/jevons';

export type Recompute = (value: number) => { path?: string; readout: string };

const CHARTS: Record<string, Recompute> = {
  ppf,
  'window-quality': windowQuality,
  budget,
  jevons,
};

/**
 * Position-to-real-value mapping for a log-scale slider.
 *
 * A linear range over 8K–2M tokens stepping by 1,000 gives 1,992 positions,
 * of which 1,800 (90.4%) fall in the single top decade (200K–2M) — where a
 * thousand-token step is invisible against a log axis. Mapping the input's
 * position log-uniformly instead spreads perceptible change evenly across
 * the whole control. `Math.log10`/`10 **` directly, not `scale.ts`'s
 * `log10` — that helper maps onto a pixel range and throws on non-positive
 * domains, which is chart geometry, not UI position mapping.
 */
function mapLogPosition(position: number, posMin: number, posMax: number, realMin: number, realMax: number): number {
  const t = (position - posMin) / (posMax - posMin);
  if (t <= 0) return realMin;
  if (t >= 1) return realMax;
  const value = 10 ** (Math.log10(realMin) + t * (Math.log10(realMax) - Math.log10(realMin)));
  return Math.round(value);
}

class ScrollySection extends HTMLElement {
  private steps: HTMLElement[] = [];
  private observer?: IntersectionObserver;

  connectedCallback() {
    this.steps = [...this.querySelectorAll<HTMLElement>('[data-step]')];
    if (!this.steps.length) return;

    // Marks that JS is driving. Until this lands, CSS shows every layer, which
    // is the finished chart — the correct no-JS rendering.
    this.dataset.js = '';
    this.setStep(0);

    // A band across the middle of the viewport. A step becomes active when it
    // enters; the last one to enter wins. No scroll listener, and nothing runs
    // while the section is off screen.
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = Number((e.target as HTMLElement).dataset.step);
          if (Number.isFinite(i)) this.setStep(i);
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    for (const s of this.steps) this.observer.observe(s);

    this.wireControl();
  }

  disconnectedCallback() {
    this.observer?.disconnect();
  }

  private setStep(i: number) {
    this.dataset.activeStep = String(i);
    for (const s of this.steps) {
      if (Number(s.dataset.step) === i) s.setAttribute('data-active', '');
      else s.removeAttribute('data-active');
    }
  }

  /**
   * The control is always operable, never gated on scroll position.
   *
   * Disabling a focusable input until the reader has screened past it is a
   * keyboard trap: a tab-key user reaches a slider that silently does nothing.
   * Using it early instead jumps the section to its final step and hands over.
   */
  private wireControl() {
    const input = this.querySelector<HTMLInputElement>('[data-control]');
    const key = this.dataset.chart ?? '';
    const fn = CHARTS[key];
    if (!fn) return;

    const target = this.querySelector<SVGPathElement>('[data-live-path]');
    const readout = this.querySelector<HTMLElement>('[data-readout]');
    const last = this.steps.length - 1;

    if (input) {
      const isLog = input.dataset.logScale !== undefined;
      const logMin = Number(input.dataset.logMin);
      const logMax = Number(input.dataset.logMax);
      const apply = () => {
        const raw = Number(input.value);
        const chartValue = isLog
          ? mapLogPosition(raw, Number(input.min), Number(input.max), logMin, logMax)
          : raw;
        const { path, readout: text } = fn(chartValue);
        if (path && target) target.setAttribute('d', path);
        if (readout) readout.textContent = text;
      };
      input.addEventListener('input', () => {
        this.setStep(last);
        apply();
      });
    }

    // Radio groups fire change, not input.
    for (const radio of this.querySelectorAll<HTMLInputElement>('[data-control-radio]')) {
      radio.addEventListener('change', () => {
        this.setStep(last);
        const { readout: text } = fn(Number(radio.value));
        if (readout) readout.textContent = text;
        for (const layer of this.querySelectorAll<SVGElement>('[data-compare]')) {
          layer.toggleAttribute('data-compare-active', layer.dataset.compare === radio.value);
        }
      });
    }
  }
}

if (!customElements.get('scrolly-section')) {
  customElements.define('scrolly-section', ScrollySection);
}
