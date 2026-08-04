import { describe, expect, it } from 'vitest';
import { PLOT } from './geometry';
import { frontierPath, layout, recompute } from './ppf';

describe('layout', () => {
  it('places every model inside the plot area', () => {
    for (const p of layout().models) {
      expect(p.x).toBeGreaterThanOrEqual(PLOT.x0);
      expect(p.x).toBeLessThanOrEqual(PLOT.x1);
      expect(p.y).toBeGreaterThanOrEqual(PLOT.y0);
      expect(p.y).toBeLessThanOrEqual(PLOT.y1);
    }
  });

  it('orders the tier bands so frontier sits above budget on screen', () => {
    const { tierBands } = layout();
    expect(tierBands[2].y).toBeLessThan(tierBands[0].y);
  });

  it('emits one label per model, naming its provider', () => {
    const { models } = layout();
    expect(models).toHaveLength(5);
    for (const m of models) expect(m.label).toMatch(/\$/);
  });
});

describe('frontierPath', () => {
  it('produces a path with no NaN at both budget extremes', () => {
    for (const budget of [1, 2]) {
      expect(frontierPath(budget)).not.toMatch(/NaN/);
      expect(frontierPath(budget).startsWith('M')).toBe(true);
    }
  });

  it('moves the frontier outward as the budget rises', () => {
    const low = frontierPath(1);
    const high = frontierPath(2);
    expect(low).not.toBe(high);
  });
});

describe('recompute', () => {
  it('returns a path and a readout naming the budget multiple', () => {
    const { path, readout } = recompute(150);
    expect(path).toBeTruthy();
    expect(path).not.toMatch(/NaN/);
    expect(readout).toMatch(/1\.5/);
  });

  it('states that only the stylized curve moves', () => {
    expect(recompute(100).readout.toLowerCase()).toContain('rate card');
  });
});
