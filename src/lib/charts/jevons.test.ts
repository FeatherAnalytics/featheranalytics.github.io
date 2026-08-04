import { describe, expect, it } from 'vitest';
import { PLOT } from './geometry';
import { layout, recompute, spendPath } from './jevons';

describe('layout', () => {
  it('separates the price and revenue lines, which is the whole point', () => {
    const { pricePath, revenuePath } = layout();
    expect(pricePath).not.toBe(revenuePath);
    expect(pricePath).not.toMatch(/NaN/);
    expect(revenuePath).not.toMatch(/NaN/);
  });

  it('keeps the agent ladder bars inside the plot area', () => {
    for (const b of layout().ladder) {
      expect(b.x).toBeGreaterThanOrEqual(PLOT.x0);
      expect(b.x + b.w).toBeLessThanOrEqual(PLOT.x1 + 0.01);
      expect(b.w).toBeGreaterThan(0);
    }
  });

  it('marks the elasticity implied by the measured series on the track', () => {
    expect(layout().impliedElasticity).toBeLessThan(-1.9);
    expect(layout().impliedElasticity).toBeGreaterThan(-2.3);
  });
});

describe('spendPath', () => {
  it('produces no NaN across the elasticity range', () => {
    for (const e of [-30, -10, -5, 0]) {
      expect(spendPath(e / 10)).not.toMatch(/NaN/);
    }
  });
});

describe('recompute', () => {
  it('says spending falls when demand is inelastic', () => {
    expect(recompute(-5).readout.toLowerCase()).toContain('falls');
  });

  it('says spending rises when demand is elastic past unity', () => {
    expect(recompute(-20).readout.toLowerCase()).toContain('rises');
  });

  it('identifies -1 as the break-even point', () => {
    expect(recompute(-10).readout.toLowerCase()).toMatch(/break-even|flat/);
  });
});
