import { readFileSync } from 'node:fs';
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
  SUPPLY_SIDE,
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

  it('carries the August 2026 rate card alongside the earlier record', () => {
    // The chart's value is the change over time, so a revision that shifted the
    // window forward instead of extending it would destroy the record.
    const august = PRICE_DECLINE.points.filter((p) => p.date === '2026-08');
    expect(august.length).toBeGreaterThan(0);
    expect(PRICE_DECLINE.points.some((p) => p.date === '2023-03')).toBe(true);
  });

  it('labels the two rates that are not standing list prices', () => {
    // This series has no field for a price qualifier, so the label carries it.
    // A promotional rate with a published expiry and a rate that doubles at peak
    // hours are both things a reader has to be told.
    const qualified = PRICE_DECLINE.points.filter((p) => /\(/.test(p.label)).map((p) => p.label);
    expect(qualified).toEqual(['GPT-5.6 Sol (promotional)', 'DeepSeek V4 Pro (off-peak)']);
  });

  it('holds one price basis, so the chain stays comparable end to end', () => {
    // Doc 01 §5's cheapest row is a blended input-and-output figure and is
    // deliberately absent: including it would move the headline deflation
    // factor to 1,500x on a basis no other point shares.
    // Widened from the `as const` literal union: TS can prove the comparison
    // always false against today's values and flags it. The guard is for a
    // future edit that appends the blended row, which the literal type cannot
    // represent.
    const prices = PRICE_DECLINE.points as readonly { usd: number }[];
    expect(PRICE_DECLINE.note).toMatch(/input prices/);
    expect(prices.some((p) => p.usd === 0.02)).toBe(false);
  });
});

describe('decline comparison', () => {
  it('labels the token row with the tier it actually measures', () => {
    // One rate cannot stand for both curves. The cheapest capable tier fell at
    // roughly 85% a year; the frontier flagship at roughly 45%. A "frontier" row
    // carrying the cheap tier's rate is the conflation this guards against.
    const frontier = DECLINE_COMPARISON.points.find((p) => p.name === 'LLM tokens (frontier)')!;
    expect(frontier.annualPct).toBe(45);
    expect(frontier.range).toBe('~45%');
  });

  it('still puts tokens ahead of every historical curve in the table', () => {
    const tokens = DECLINE_COMPARISON.points.find((p) => p.name.startsWith('LLM tokens'))!;
    const others = DECLINE_COMPARISON.points.filter((p) => !p.name.startsWith('LLM tokens'));
    for (const o of others) expect(o.annualPct).toBeLessThan(tokens.annualPct);
  });
});

describe('context windows', () => {
  it('tops out at the one-million-token baseline the market consolidated on', () => {
    // The 2M reached once in May 2024 and the 10M advertised since April 2025
    // are both absent on purpose: neither became a standard, and plotting the
    // 10M would put growth at 4,883x and describe capacity nobody can rely on.
    expect(Math.max(...WINDOW_TIMELINE.points.map((p) => p.tokens))).toBe(1_000_000);
  });

  it('starts at the window GPT-3 actually shipped', () => {
    expect(WINDOW_TIMELINE.points[0]).toMatchObject({ model: 'GPT-3', tokens: 2_048 });
  });

  it("puts Anthropic's million-token Opus window at Opus 4.6, after a 200K Opus 4.5", () => {
    const opus45 = WINDOW_TIMELINE.points.find((p) => p.model === 'Claude Opus 4.5')!;
    const opus46 = WINDOW_TIMELINE.points.find((p) => p.model === 'Claude Opus 4.6')!;
    expect(opus45.tokens).toBe(200_000);
    expect(opus46.tokens).toBe(1_000_000);
    expect(opus45.date < opus46.date).toBe(true);
  });

  it('holds Gemini 3.1 Pro at 1M and GPT-5.6 at its exact window', () => {
    expect(WINDOW_TIMELINE.points.find((p) => p.model === 'Gemini 3.1 Pro')!.tokens).toBe(1_000_000);
    expect(WINDOW_TIMELINE.points.find((p) => p.model === 'GPT-5.6 Sol')!.tokens).toBe(921_600);
  });

  it('carries the August 2026 releases alongside the earlier record', () => {
    expect(WINDOW_TIMELINE.points.filter((p) => p.date.startsWith('2026-08')).length).toBeGreaterThan(0);
    expect(WINDOW_TIMELINE.points[0].date).toBe('2020-06');
  });
});

describe('model names', () => {
  // The last fabricated SKU in this file lived in a docstring, not in data, so
  // this reads the module source rather than the exports. A model that does not
  // exist misleads a reader wherever it appears.
  const source = readFileSync(new URL('./tokenomics.ts', import.meta.url), 'utf8');

  it('names no model the SKU register says does not exist', () => {
    for (const bad of ['Haiku 4 ', "Haiku 4'", 'DeepSeek V4 Pro Max', 'DeepSeek-V4-Pro-Max', 'DeepSeek-V4-Flash-Max']) {
      expect(source, `${bad} does not exist`).not.toContain(bad);
    }
  });
});

describe('quality cost', () => {
  it('runs from the cheapest model within a point of 80% to the only 95% model', () => {
    expect(QUALITY_COST.points[0]).toMatchObject({ swePct: 79, usdPerMTok: 0.66 });
    expect(QUALITY_COST.points[1]).toMatchObject({ swePct: 95, usdPerMTok: 50 });
  });

  it('rises in both score and price, since it is a cost schedule', () => {
    const [low, high] = QUALITY_COST.points;
    expect(high.swePct).toBeGreaterThan(low.swePct);
    expect(high.usdPerMTok).toBeGreaterThan(low.usdPerMTok);
  });
});

describe('JEVONS', () => {
  it('reports volume growth as the disclosed figure, not a derived one', () => {
    expect(JEVONS.statedVolumeGrowth).toBe('330×');
  });

  it('takes its price drop from the frontier endpoints of the price series', () => {
    // $30.00 in March 2023 against $4.00 in August 2026.
    const anchor = PRICE_DECLINE.points[0].usd;
    const frontier = PRICE_DECLINE.points.find((p) => p.label === 'GPT-5.6 Sol (promotional)')!.usd;
    expect(JEVONS.priceDropFraction).toBeCloseTo(1 - frontier / anchor, 3);
  });

  it('scores every falsification criterion it states', () => {
    expect(JEVONS.falsification).toHaveLength(4);
    for (const f of JEVONS.falsification) {
      expect(f).toMatch(/met|assessable/);
    }
  });

  it('names the unscoreable fifth condition rather than omitting it', () => {
    expect(JEVONS.falsification.join(' ')).toMatch(/geopolitical bifurcation/i);
  });

  it('records the Uber cap alongside the overrun', () => {
    expect(JEVONS.uber).toMatch(/April 2026/);
    expect(JEVONS.uber).toMatch(/\$1,500/);
  });

  it('keeps the revenue range in the order its own keys imply', () => {
    expect(JEVONS.revenueGrowthMax).toBeGreaterThan(JEVONS.revenueGrowthMin);
  });
});

describe('SUPPLY_SIDE', () => {
  it('carries the August 2026 capex guidance', () => {
    expect(SUPPLY_SIDE.capex2026UsdBn).toBe(725);
  });

  it('reports the hosting spread as the range measured across three models', () => {
    expect(SUPPLY_SIDE.hostingSpreadForIdenticalWeights).toBe('10–20×');
  });

  it('uses the most recent share figure available for each segment', () => {
    expect(SUPPLY_SIDE.anthropicEnterpriseApiSharePct).toBe(40);
    expect(SUPPLY_SIDE.chatgptConsumerSharePct).toBe(53.9);
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

  it('rejects a priceDropFraction of 1 or more, which divides by zero or less', () => {
    expect(() => impliedVolumeGrowth(1, 25)).toThrow(/priceDropFraction/);
    expect(() => impliedVolumeGrowth(1.5, 25)).toThrow(/priceDropFraction/);
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

  it('rejects a priceDropFraction of 1 or more, which has no finite elasticity', () => {
    expect(() => impliedElasticity(1, 25)).toThrow(/priceDropFraction/);
    expect(() => impliedElasticity(1.5, 25)).toThrow(/priceDropFraction/);
  });

  it('rejects a non-positive revenueGrowth, whose log is undefined', () => {
    expect(() => impliedElasticity(0.95, 0)).toThrow(/revenueGrowth/);
    expect(() => impliedElasticity(0.95, -1)).toThrow(/revenueGrowth/);
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

  it('rejects a non-positive tokens argument, which has no logarithm', () => {
    expect(() => interpolateRetention(0)).toThrow(/tokens/);
    expect(() => interpolateRetention(-1)).toThrow(/tokens/);
  });

  it('rejects anchors that share a tokens value, which divides by zero', () => {
    // DEGRADATION is fixed corpus data (10K and 100K, always distinct), so this
    // exercises the guard against a future edit rather than real data. Mutate
    // the shared points array for one assertion, then restore it exactly.
    const points = DEGRADATION.points as unknown as { tokens: number; retention: number }[];
    const originalSecond = points[1];
    points[1] = { tokens: points[0].tokens, retention: originalSecond.retention };
    try {
      expect(() => interpolateRetention(50_000)).toThrow(/distinct/);
    } finally {
      points[1] = originalSecond;
    }
  });

  it('rejects a DEGRADATION series that does not have exactly two anchors', () => {
    // A third anchor added later would otherwise be silently ignored by the
    // `const [a, b] = DEGRADATION.points` destructure this function relies on.
    const points = DEGRADATION.points as unknown as { tokens: number; retention: number }[];
    const originalLength = points.length;
    points.push({ tokens: 1_000_000, retention: 0.4 });
    try {
      expect(() => interpolateRetention(50_000)).toThrow(/two/);
    } finally {
      points.length = originalLength;
    }
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

  it('derives window growth from the consolidated baseline, not an advertised ceiling', () => {
    expect(FIGURES.windowGrowthFactor).toBe('488×');
  });

  it('reports the frontier decline rate, which is the row the series now holds', () => {
    expect(FIGURES.tokenAnnualDecline).toBe('~45%');
    expect(FIGURES.mooreAnnualDecline).toBe('16–30%');
  });

  it('derives the tier bounds from the corrected June rate card', () => {
    expect(FIGURES.cheapestTier).toBe('$0.04');
    expect(FIGURES.dearestTier).toBe('$15.00');
  });

  it('derives the SWE-bench endpoints from the August curve', () => {
    expect(FIGURES.sweCheap).toBe('$0.66');
    expect(FIGURES.sweDear).toBe('$50');
  });

  it('derives the frontier price drop and the disclosed volume move', () => {
    expect(FIGURES.priceDrop).toBe('87%');
    expect(FIGURES.statedVolume).toBe('330×');
    expect(FIGURES.revenueGrowth).toBe('24–40×');
  });

  it('derives capex from the supply-side figure rather than hard-coding it', () => {
    expect(FIGURES.capex).toBe('$725B');
  });

  it('states the degradation drop with the Liu figure the corpus now gives', () => {
    expect(FIGURES.degradationDrop).toBe('20–50%');
    expect(FIGURES.liuDrop).toBe('more than 30 percentage points');
  });
});
