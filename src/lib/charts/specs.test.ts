/**
 * Every chart spec the post renders has to compile.
 *
 * `validateSpec` checks encoding shapes and, crucially, resolves each `field`
 * against the columns actually present in `data` — the failure this test exists
 * to catch is a spec that references a field the data module renamed, which
 * renders as an empty chart with no build error and no console message.
 *
 * Story steps are validated as their accumulated spec rather than as isolated
 * patches, because a patch is a deep-partial and is meaningless on its own: it
 * is the merged result the reader actually sees.
 */
import { describe, expect, it } from 'vitest';
import { validateSpec } from '@opendata-ai/openchart-engine';
import { deepMergeSpec } from '@opendata-ai/openchart-core';
import { agentLadder, budgetStory, jevonsStory, ppfStory, windowStory, type Story } from './specs';

const stories: [string, Story][] = [
  ['ppf', ppfStory],
  ['window', windowStory],
  ['budget', budgetStory],
  ['jevons', jevonsStory],
];

/** Rebuild the spec a reader sees at step `index`: base plus patches 0..index. */
function specAtStep(story: Story, index: number): unknown {
  let accumulated: unknown = structuredClone(story.spec);
  for (let i = 0; i <= index; i += 1) {
    const step = story.steps[i];
    if (step.spec) accumulated = deepMergeSpec(accumulated, structuredClone(step.spec));
    if (step.highlight !== undefined) {
      accumulated = deepMergeSpec(accumulated, {
        encoding: { color: { highlight: step.highlight } },
      });
    }
  }
  return accumulated;
}

describe.each(stories)('%s story', (_name, story) => {
  it('has a base spec that validates', () => {
    const result = validateSpec(story.spec as never);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('validates at every accumulated step', () => {
    story.steps.forEach((step, i) => {
      const result = validateSpec(specAtStep(story, i) as never);
      expect(result.errors, `step ${i} (${step.label})`).toEqual([]);
    });
  });

  it('gives every step a rail label', () => {
    for (const step of story.steps) {
      expect(step.label.trim().length).toBeGreaterThan(0);
    }
  });

  it('states the finding in its alt text, not just the shape', () => {
    // A number in the alt text is the cheap proxy for "this says what the chart
    // means". Alt text that only names the axes would pass a length check.
    expect(story.alt).toMatch(/\d/);
    expect(story.alt.length).toBeGreaterThan(120);
  });

  it('cites a source', () => {
    expect(story.source.trim().length).toBeGreaterThan(0);
  });
});

describe('agent ladder figure', () => {
  it('validates', () => {
    const result = validateSpec(agentLadder.spec as never);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('states the finding in its alt text', () => {
    expect(agentLadder.alt).toMatch(/\d/);
    expect(agentLadder.source.trim().length).toBeGreaterThan(0);
  });
});

describe('data honesty', () => {
  it('never renders a missing context window as a number', () => {
    // MODEL_TIERS carries `contextK: null` for Ministral 3B because no document
    // in the corpus states a window for it. A spec that coerced that to 0 would
    // plot a claim the corpus does not make.
    const rows = (ppfStory.spec as unknown as { data: { window: string }[] }).data;
    const windows = rows.map((r) => r.window);
    expect(windows).toContain('not stated');
    expect(windows).not.toContain('0K');
  });

  it('keeps provider tier off a quantitative scale', () => {
    // The tier is the provider's own ranking, not a measured quality score.
    // Plotting it quantitatively would imply the distance between Budget and Mid
    // is a measured quantity.
    const encoding = (ppfStory.spec as { encoding: { y: { type: string } } }).encoding;
    expect(encoding.y.type).toBe('ordinal');
  });
});
