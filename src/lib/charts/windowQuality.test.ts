import { describe, expect, it } from 'vitest';
import { PLOT } from './geometry';
import { layout, recompute } from './windowQuality';

describe('layout', () => {
  it('draws the offered-window envelope as monotonically non-decreasing', () => {
    const ys = layout().envelope.map((p) => p.y);
    for (let i = 1; i < ys.length; i++) expect(ys[i]).toBeLessThanOrEqual(ys[i - 1]);
  });

  it('keeps every mark inside the plot area', () => {
    const { offered, envelope, usedLine } = layout();
    for (const p of [...offered, ...envelope]) {
      expect(p.x).toBeGreaterThanOrEqual(PLOT.x0);
      expect(p.x).toBeLessThanOrEqual(PLOT.x1);
      expect(p.y).toBeGreaterThanOrEqual(PLOT.y0);
      expect(p.y).toBeLessThanOrEqual(PLOT.y1);
    }
    expect(usedLine.y).toBeGreaterThan(PLOT.y0);
    expect(usedLine.y).toBeLessThan(PLOT.y1);
  });

  it('carries all three utilization rows for the hidden table', () => {
    expect(layout().utilization).toHaveLength(3);
  });
});

describe('recompute', () => {
  it('reports retention at the chosen depth and flags it as interpolated', () => {
    const { readout } = recompute(50_000);
    expect(readout).toMatch(/%/);
    expect(readout.toLowerCase()).toContain('interpolated');
  });

  it('names the measured span rather than implying a point measurement', () => {
    expect(recompute(50_000).readout).toContain('10K');
    expect(recompute(50_000).readout).toContain('100K');
  });

  it('produces no NaN at either end of the slider', () => {
    for (const v of [4_000, 1_000_000]) {
      expect(recompute(v).readout).not.toMatch(/NaN/);
    }
  });

  it('refuses a utilization percentage when the window is smaller than a typical session', () => {
    const { readout } = recompute(4_000);
    expect(readout).not.toContain('% of it'); // no utilization figure at all, over or under 100
    expect(readout.toLowerCase()).toMatch(/not fit|overflow/);
  });

  it('still reports utilization once the window reaches or exceeds a typical session', () => {
    for (const tokens of [8_000, 2_000_000]) {
      const { readout } = recompute(tokens);
      expect(readout).toMatch(/uses \d/);
    }
  });
});
