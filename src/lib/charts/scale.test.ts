import { describe, expect, it } from 'vitest';
import { decadeTicks, linear, linearTicks, log10 } from './scale';

describe('linear', () => {
  it('maps the domain ends onto the range ends', () => {
    const s = linear([0, 10], [100, 900]);
    expect(s(0)).toBe(100);
    expect(s(10)).toBe(900);
    expect(s(5)).toBe(500);
  });

  it('supports an inverted range, which is how SVG y-axes work', () => {
    const s = linear([0, 100], [548, 32]);
    expect(s(0)).toBe(548);
    expect(s(100)).toBe(32);
  });

  it('rejects a zero-width domain rather than dividing by zero', () => {
    expect(() => linear([5, 5], [0, 100])).toThrow(/zero-width domain/);
  });
});

describe('log10', () => {
  it('places each decade an equal distance apart', () => {
    const s = log10([0.01, 100], [0, 400]);
    expect(s(0.01)).toBeCloseTo(0, 6);
    expect(s(0.1)).toBeCloseTo(100, 6);
    expect(s(1)).toBeCloseTo(200, 6);
    expect(s(10)).toBeCloseTo(300, 6);
    expect(s(100)).toBeCloseTo(400, 6);
  });

  it('rejects a non-positive domain, which has no logarithm', () => {
    expect(() => log10([0, 10], [0, 100])).toThrow(/positive/);
    expect(() => log10([-1, 10], [0, 100])).toThrow(/positive/);
  });
});

describe('linearTicks', () => {
  it('returns round values covering the domain', () => {
    expect(linearTicks([0, 100], 5)).toEqual([0, 25, 50, 75, 100]);
  });

  it('rejects a count below two, which has no spacing to compute', () => {
    expect(() => linearTicks([0, 100], 1)).toThrow(/count/);
    expect(() => linearTicks([0, 100], 0)).toThrow(/count/);
  });
});

describe('decadeTicks', () => {
  it('returns every power of ten inside the domain, inclusive', () => {
    expect(decadeTicks([0.04, 30])).toEqual([0.1, 1, 10]);
    expect(decadeTicks([1, 1_000_000])).toEqual([1, 10, 100, 1000, 10_000, 100_000, 1_000_000]);
  });

  it('rejects a non-positive domain, which has no logarithm', () => {
    expect(() => decadeTicks([0, 10])).toThrow(/positive/);
    expect(() => decadeTicks([-1, 10])).toThrow(/positive/);
  });
});
