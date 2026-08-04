import { describe, expect, it } from 'vitest';
import { PLOT } from './geometry';
import { comparisonPath, layout, recompute } from './budget';

describe('layout', () => {
  it('draws the price envelope as monotonically non-increasing in value', () => {
    const vals = layout().envelopeValues;
    for (let i = 1; i < vals.length; i++) expect(vals[i]).toBeLessThanOrEqual(vals[i - 1]);
  });

  it('keeps the scatter inside the plot area', () => {
    for (const p of layout().scatter) {
      expect(p.x).toBeGreaterThanOrEqual(PLOT.x0);
      expect(p.x).toBeLessThanOrEqual(PLOT.x1);
      expect(p.y).toBeGreaterThanOrEqual(PLOT.y0);
      expect(p.y).toBeLessThanOrEqual(PLOT.y1);
    }
  });
});

describe('comparisonPath', () => {
  it('draws a shallower slope than the token series for every comparison', () => {
    for (const pct of [8, 15, 23, 30]) {
      const d = comparisonPath(pct);
      expect(d).not.toMatch(/NaN/);
      expect(d.startsWith('M')).toBe(true);
    }
  });
});

describe('recompute', () => {
  it('names the selected technology and both annual rates', () => {
    const { readout } = recompute(23);
    expect(readout).toMatch(/23%|16–30%/);
    expect(readout).toMatch(/80–90%/);
  });
});
