/**
 * The window-quality model: what a context window is worth once per-token
 * quality is priced in.
 *
 * One parameter, `decay` — the share of retrieval quality lost per tenfold
 * increase in window size. Everything else follows:
 *
 *     retention(W) = (1 - decay) ^ log10(W / BASE)
 *     effective(W) = W · retention(W)
 *
 * So a window's *effective* size is what it holds multiplied by the share of it
 * the model still retrieves accurately. Plotting effective against nominal is
 * the whole point: the two lines start together and separate, and the gap is
 * the quality the extra tokens cost you.
 *
 * The default decay is DERIVED from the measurement, not chosen: the Chroma
 * study puts retention at 1.0 at 10K and 0.65 at 100K, one decade apart, so the
 * measured loss is 35% per decade. Moving the slider is the reader asking "what
 * if it were worse, or better" — a what-if on their own input, which needs no
 * evidence caveat. The default is the only value on the slider that is evidence.
 *
 * WHERE THE UNTESTED ASSUMPTION ACTUALLY IS. Not "above 100K", which is the
 * intuitive place to put it and the wrong one — the curve is no better founded
 * between the anchors than beyond them. It is the `^log10` itself: the model
 * assumes decay is a CONSTANT SHARE PER DECADE, and that shape was fitted to
 * exactly one decade. Two measurements fix one rate; they cannot distinguish a
 * power law from a straight line, a cliff, or a plateau. Every point on the
 * curve inherits that assumption equally.
 *
 * One thing the assumption does NOT contaminate: `sessionsWorth` is independent
 * of `BASE_TOKENS`, because the base cancels —
 *
 *     sessionsWorth(L, S, y) = (L/S) · (1-y)^log10(L/S)
 *
 * so the headline comparison does not depend on where retention is anchored at
 * 1.0. Only the absolute token values on the y-axis do.
 */
import type { ChartSpec } from '@opendata-ai/openchart-core';
import { DEGRADATION, WINDOW_TIMELINE } from '../../data/tokenomics';

const [anchorLow, anchorHigh] = DEGRADATION.points;

/** Where retention is 1.0 by definition — the smaller measured anchor. */
export const BASE_TOKENS = anchorLow.tokens;


/**
 * Quality lost per tenfold window increase, derived from the two anchors.
 *
 * Written as a general fit rather than `1 - 0.65` so that a third anchor, or a
 * revision that moves the anchors off a clean decade apart, changes this number
 * instead of silently disagreeing with it.
 */
export const MEASURED_DECAY =
  1 - (anchorHigh.retention / anchorLow.retention) ** (1 / Math.log10(anchorHigh.tokens / anchorLow.tokens));

/** Slider bounds, as a share lost per decade. */
export const DECAY_MIN = 0;
export const DECAY_MAX = 0.6;

/**
 * The scroll sequence: three fixed rates, then the reader takes the control.
 *
 * Ordered mild → measured → severe so the measured rate is met in context
 * rather than as an isolated assertion, and so the reader has already watched
 * the gap widen twice before being handed the slider. The last step carries no
 * `decay` — that is what marks it as the interactive one, and the element hands
 * it whatever the slider says.
 */
export const QUALITY_STEPS: { decay?: number; label: string }[] = [
  { decay: 0.1, label: 'A mild reading: 10% per tenfold' },
  { decay: MEASURED_DECAY, label: 'The measured rate: 35% per tenfold' },
  { decay: 0.5, label: 'A severe reading: 50% per tenfold' },
  { label: 'Set the rate yourself' },
];

/** The two windows the readout sentence compares. Both are real shipped sizes. */
export const COMPARE_SMALL = 200_000;
export const COMPARE_LARGE = 1_000_000;

/**
 * Formatted forms of every figure this model puts on screen.
 *
 * Exists so the post's prose can interpolate them rather than typing them.
 * `publishedFigures.test.ts` fails the build on a measurement-shaped literal in
 * the prose, which is what stops a sentence from quietly disagreeing with the
 * chart beside it once one of these values is edited.
 */
export const LABELS = {
  mildPct: `${Math.round((QUALITY_STEPS[0].decay ?? 0) * 100)}%`,
  measuredPct: `${Math.round(MEASURED_DECAY * 100)}%`,
  severePct: `${Math.round((QUALITY_STEPS[2].decay ?? 0) * 100)}%`,
  minPct: `${Math.round(DECAY_MIN * 100)}%`,
  maxPct: `${Math.round(DECAY_MAX * 100)}%`,
  large: `${COMPARE_LARGE / 1_000_000}M`,
  small: `${COMPARE_SMALL / 1_000}K`,
  naiveRatio: `${COMPARE_LARGE / COMPARE_SMALL}`,
} as const;

export function retentionAt(window: number, decay: number): number {
  if (!Number.isFinite(window) || window <= 0) {
    throw new Error(`retentionAt: window must be positive, got ${window}`);
  }
  if (!Number.isFinite(decay) || decay < 0 || decay >= 1) {
    throw new Error(`retentionAt: decay must be in [0, 1), got ${decay}`);
  }
  return (1 - decay) ** Math.log10(window / BASE_TOKENS);
}

/** Tokens the window is actually worth: size times retained quality. */
export function effectiveTokens(window: number, decay: number): number {
  return window * retentionAt(window, decay);
}

/**
 * How many `small` sessions one `large` session is worth.
 *
 * The naive answer is `large / small`. This is that number after quality, and
 * the difference between the two is what the section is arguing.
 */
export function sessionsWorth(large: number, small: number, decay: number): number {
  return effectiveTokens(large, decay) / effectiveTokens(small, decay);
}

const tokens = (n: number): string =>
  n >= 1_000_000 ? `${Number((n / 1_000_000).toFixed(2))}M` : `${Math.round(n / 1000)}K`;

const round1 = (n: number): string => String(Number(n.toFixed(1)));

/** The sentence under the chart. This is where the finding actually lands. */
export function sentenceFor(decay: number): string {
  const naive = COMPARE_LARGE / COMPARE_SMALL;
  const real = sessionsWorth(COMPARE_LARGE, COMPARE_SMALL, decay);
  const pct = Math.round(decay * 100);

  if (decay === 0) {
    return (
      `With no quality decay, a ${tokens(COMPARE_LARGE)} window does exactly the work of ${round1(naive)} ` +
      `sessions at ${tokens(COMPARE_SMALL)} — the two lines sit on top of each other. Drag the control up to price in quality.`
    );
  }

  // Two different caveats, and only one applies at a time. On the default the
  // rate is evidence and the open question is whether it holds shape across
  // further decades. Off the default the rate is the reader's own what-if, and
  // saying "unmeasured" about a number they just chose would be noise.
  const provenance =
    Math.abs(decay - MEASURED_DECAY) < 0.005
      ? ` That rate is measured — retention fell ${anchorLow.retention * 100}% → ${anchorHigh.retention * 100}% between ${tokens(anchorLow.tokens)} and ${tokens(anchorHigh.tokens)} — but over one decade only, so whether it stays constant across the next one is an assumption, not a finding.`
      : ` That rate is yours, not a measurement; the measured one is ${Math.round(MEASURED_DECAY * 100)}%.`;

  return (
    `At ${pct}% quality lost per tenfold window increase, a ${tokens(COMPARE_LARGE)} window does the work of ` +
    `${round1(real)} sessions at ${tokens(COMPARE_SMALL)} — not the ${round1(naive)} its size implies.` +
    provenance
  );
}

/**
 * Nominal window against effective window, over time.
 *
 * Both series are token counts on one log axis, so the vertical gap between
 * them is the quality loss and nothing else. Replacing the old usage series
 * with this one is the difference between a chart about how much of the window
 * people use and a chart about what the window is worth.
 */
export function windowQualitySpec(decay: number): ChartSpec {
  const rows = WINDOW_TIMELINE.points.flatMap((p) => [
    { date: p.date, tokens: p.tokens, series: 'Window offered', model: p.model },
    {
      date: p.date,
      tokens: effectiveTokens(p.tokens, decay),
      series: 'Effective window, after quality',
      model: p.model,
    },
  ]);

  const pct = Math.round(decay * 100);
  const real = sessionsWorth(COMPARE_LARGE, COMPARE_SMALL, decay);

  return {
    mark: { type: 'line', interpolate: 'monotone', strokeWidth: 2.5, point: true },
    data: rows,
    encoding: {
      x: { field: 'date', type: 'temporal', axis: { title: null, format: '%Y' } },
      y: {
        field: 'tokens',
        type: 'quantitative',
        scale: { type: 'log', domain: [500, 4_000_000], nice: false },
        axis: { title: 'Tokens', format: '~s' },
      },
      color: { field: 'series', type: 'nominal' },
      tooltip: [
        { field: 'model', type: 'nominal', title: 'Model' },
        { field: 'series', type: 'nominal', title: 'Series' },
        { field: 'tokens', type: 'quantitative', title: 'Tokens', format: ',.0f' },
      ],
    },
    seriesStyles: {
      'Effective window, after quality': { strokeDash: [6, 4] },
    },
    chrome: {
      eyebrow: 'Window × quality',
      title:
        decay === 0
          ? 'Set a decay rate to price in quality'
          : `A ${tokens(COMPARE_LARGE)} window is worth ${round1(real)} sessions at ${tokens(COMPARE_SMALL)}, not ${round1(COMPARE_LARGE / COMPARE_SMALL)}`,
      subtitle: `${pct}% of retrieval quality lost per tenfold increase in window size`,
    },
  };
}
