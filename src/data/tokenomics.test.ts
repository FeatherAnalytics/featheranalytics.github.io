import { describe, expect, it } from 'vitest';
import {
  AGENT_MULTIPLIER,
  DECLINE_COMPARISON,
  DEGRADATION,
  FIGURES,
  JEVONS,
  MODEL_TIERS,
  PRICE_DECLINE,
  QUALITY_COST,
  UTILIZATION,
  WINDOW_TIMELINE,
  impliedElasticity,
  impliedVolumeGrowth,
  interpolateRetention,
} from './tokenomics';

const SERIES = {
  PRICE_DECLINE, WINDOW_TIMELINE, UTILIZATION, DEGRADATION,
  MODEL_TIERS, QUALITY_COST, AGENT_MULTIPLIER, DECLINE_COMPARISON, JEVONS,
};

describe('every series', () => {
  it('carries a non-empty source citation', () => {
    for (const [name, s] of Object.entries(SERIES)) {
      expect(s.source, `${name} is missing a source`).toBeTruthy();
      expect(s.source.length).toBeGreaterThan(10);
    }
  });

  it('has at least one point', () => {
    for (const [name, s] of Object.entries(SERIES)) {
      if ('points' in s) {
        expect((s.points as readonly unknown[]).length, `${name} is empty`).toBeGreaterThan(0);
      }
    }
  });
});

describe('dated series', () => {
  it('are in ascending date order, which the envelope depends on', () => {
    for (const s of [PRICE_DECLINE, WINDOW_TIMELINE]) {
      const dates = s.points.map((p) => p.date);
      expect(dates).toEqual([...dates].sort());
    }
  });

  it('use YYYY-MM throughout, so string sort equals date sort', () => {
    for (const s of [PRICE_DECLINE, WINDOW_TIMELINE]) {
      for (const p of s.points) expect(p.date).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
    }
  });
});

describe('PRICE_DECLINE date precision', () => {
  it('marks only the rows the corpus never gave a month for as inferred', () => {
    // Doc 01 §5's table states "Late 2023" and "2026" with no month for these
    // two rows only. A future edit that silently marks another row inferred
    // (or un-marks one of these) should fail here.
    const inferred = PRICE_DECLINE.points.filter((p) => p.datePrecision === 'inferred').map((p) => p.label);
    expect(inferred).toEqual(['GPT-4 Turbo', 'DeepSeek V3.2']);
  });
});

describe('price decline', () => {
  it('starts at the GPT-4 launch price and reaches the cheapest 2026 model', () => {
    expect(PRICE_DECLINE.points[0]).toMatchObject({ label: 'GPT-4', usd: 30 });
    expect(Math.min(...PRICE_DECLINE.points.map((p) => p.usd))).toBe(0.04);
  });

  it('is positive throughout, since it goes on a log axis', () => {
    for (const p of PRICE_DECLINE.points) expect(p.usd).toBeGreaterThan(0);
  });
});

describe('model tiers', () => {
  it('uses an ordinal tier of 1-3, never an invented quality score', () => {
    for (const m of MODEL_TIERS.points) {
      expect([1, 2, 3]).toContain(m.tier);
    }
  });

  it("names the provider, because the tier is that provider's own ranking", () => {
    for (const m of MODEL_TIERS.points) expect(m.provider.length).toBeGreaterThan(0);
  });
});

describe('impliedVolumeGrowth', () => {
  it('divides revenue growth by the price ratio', () => {
    // Price falls to 5% of its start, revenue grows 25x -> volume grows 500x.
    expect(impliedVolumeGrowth(0.95, 25)).toBeCloseTo(500, 6);
  });
});

describe('impliedElasticity', () => {
  it('derives roughly -2 from the measured price drop and revenue growth', () => {
    const e = impliedElasticity(0.95, 25);
    expect(e).toBeLessThan(-1.9);
    expect(e).toBeGreaterThan(-2.3);
  });

  it('returns exactly -1 when revenue is flat, the break-even case', () => {
    expect(impliedElasticity(0.95, 1)).toBeCloseTo(-1, 6);
  });
});

describe('interpolateRetention', () => {
  it('returns the measured anchors exactly', () => {
    expect(interpolateRetention(10_000)).toBeCloseTo(DEGRADATION.points[0].retention, 6);
    expect(interpolateRetention(100_000)).toBeCloseTo(DEGRADATION.points[1].retention, 6);
  });

  it('interpolates between them on a log scale', () => {
    const mid = interpolateRetention(31_623); // 10^4.5
    expect(mid).toBeLessThan(DEGRADATION.points[0].retention);
    expect(mid).toBeGreaterThan(DEGRADATION.points[1].retention);
  });

  it('clamps outside the measured span rather than extrapolating', () => {
    expect(interpolateRetention(1_000)).toBeCloseTo(DEGRADATION.points[0].retention, 6);
    expect(interpolateRetention(1_000_000)).toBeCloseTo(DEGRADATION.points[1].retention, 6);
  });
});

describe('FIGURES', () => {
  it('are all non-empty strings with no NaN or undefined leaking through', () => {
    for (const [k, v] of Object.entries(FIGURES)) {
      expect(typeof v, k).toBe('string');
      expect(v.length, k).toBeGreaterThan(0);
      expect(v, k).not.toMatch(/NaN|undefined|Infinity/);
    }
  });

  it('derives the deflation factor from the series rather than hard-coding it', () => {
    expect(FIGURES.deflationFactor).toBe('750×');
  });

  it('derives peak utilization and its inverse from the utilization table', () => {
    expect(FIGURES.lowestUtilization).toBe('0.6%');
  });
});
