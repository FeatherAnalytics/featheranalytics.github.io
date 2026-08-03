import { describe, expect, it } from 'vitest';
import { PLOT, VB, envelope, pct, polyline, smooth } from './geometry';

describe('plot frame', () => {
  it('keeps the plot area inside the viewBox', () => {
    expect(PLOT.x0).toBeGreaterThan(0);
    expect(PLOT.x1).toBeLessThan(VB.w);
    expect(PLOT.y0).toBeGreaterThan(0);
    expect(PLOT.y1).toBeLessThan(VB.h);
    expect(PLOT.x1).toBeGreaterThan(PLOT.x0);
    expect(PLOT.y1).toBeGreaterThan(PLOT.y0);
  });
});

describe('polyline', () => {
  it('builds an SVG path through the points', () => {
    expect(polyline([{ x: 0, y: 1 }, { x: 2, y: 3 }])).toBe('M 0 1 L 2 3');
  });

  it('returns empty for fewer than two points, rather than a broken path', () => {
    expect(polyline([])).toBe('');
    expect(polyline([{ x: 1, y: 1 }])).toBe('');
  });
});

describe('smooth', () => {
  it('starts at the first point and ends at the last', () => {
    const d = smooth([{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 20, y: 0 }]);
    expect(d.startsWith('M 0 0')).toBe(true);
    expect(d.endsWith('20 0')).toBe(true);
  });

  it('emits no NaN, which would silently void the whole path attribute', () => {
    const d = smooth([
      { x: 0, y: 0 }, { x: 5, y: 8 }, { x: 12, y: 3 }, { x: 30, y: 25 },
    ]);
    expect(d).not.toMatch(/NaN/);
  });

  it('falls back to a straight segment for exactly two points', () => {
    expect(smooth([{ x: 0, y: 0 }, { x: 4, y: 4 }])).toBe('M 0 0 L 4 4');
  });
});

describe('envelope', () => {
  it('takes a running minimum, so a later dearer model cannot raise the floor', () => {
    expect(envelope([30, 10, 5, 0.15, 0.27, 0.55, 0.14], 'min'))
      .toEqual([30, 10, 5, 0.15, 0.15, 0.15, 0.14]);
  });

  it('takes a running maximum for the window timeline', () => {
    expect(envelope([4, 8, 32, 100, 128, 1000, 200], 'max'))
      .toEqual([4, 8, 32, 100, 128, 1000, 1000]);
  });
});

describe('pct', () => {
  it('formats a coordinate as a percentage of its axis, for HTML overlay labels', () => {
    expect(pct(500, 1000)).toBe('50%');
    expect(pct(310, 620)).toBe('50%');
    expect(pct(1, 3)).toBe('33.333%');
  });
});
