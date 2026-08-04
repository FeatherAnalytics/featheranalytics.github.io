/**
 * Chart 4 — Jevons paradox.
 *
 * The measured scissors: a 95% price fall against 20-30x revenue growth on one
 * log index axis, with the agent multiplier ladder beneath it explaining where
 * the volume went.
 *
 * The control is the economics itself. Price elasticity of demand decides
 * whether cheaper tokens reduce total spending, and the threshold is exactly
 * -1. The measured series implies about -2.1, computed rather than asserted.
 */

import { AGENT_MULTIPLIER, JEVONS, impliedElasticity } from '../../data/tokenomics';
import { PLOT, type Pt, polyline, smooth } from './geometry';
import { log10 } from './scale';

const INDEX_DOMAIN = [0.03, 40] as const;
/** The scissors occupy the upper two-thirds; the ladder sits below. */
const SPLIT = PLOT.y0 + (PLOT.y1 - PLOT.y0) * 0.62;

const y = log10(INDEX_DOMAIN, [SPLIT, PLOT.y0]);
const xAt = (t: number) => PLOT.x0 + t * (PLOT.x1 - PLOT.x0);

const STEPS = 20;
const series = (endValue: number, curve = 1): Pt[] =>
  Array.from({ length: STEPS + 1 }, (_, i) => {
    const t = i / STEPS;
    return { x: xAt(t), y: y(Math.exp(Math.log(endValue) * t ** curve)) };
  });

export function layout() {
  const { priceIndex, revenueIndex } = JEVONS.points[0];
  const revenueMid = (JEVONS.revenueGrowthMin + JEVONS.revenueGrowthMax) / 2;

  const maxMult = Math.max(...AGENT_MULTIPLIER.points.map((p) => p.mult));
  const ladderTop = SPLIT + 46;
  const rowH = (PLOT.y1 - ladderTop) / AGENT_MULTIPLIER.points.length;
  const ladder = AGENT_MULTIPLIER.points.map((p, i) => ({
    ...p,
    x: PLOT.x0,
    y: ladderTop + i * rowH,
    h: Math.max(6, rowH * 0.5),
    // Log width: a linear bar for 1x against 3,500x would be invisible.
    w: ((Math.log10(p.mult) + 1) / (Math.log10(maxMult) + 1)) * (PLOT.x1 - PLOT.x0),
  }));

  return {
    pricePath: smooth(series(priceIndex)),
    revenuePath: smooth(series(revenueIndex)),
    ladder,
    impliedElasticity: impliedElasticity(JEVONS.priceDropFraction, revenueMid),
    indexDomain: INDEX_DOMAIN,
    revenueIndex,
    priceIndex,
  };
}

/** Total spending under a reader-chosen elasticity, against the measured price fall. */
export function spendPath(elasticity: number): string {
  const priceRatio = 1 - JEVONS.priceDropFraction;
  const pts: Pt[] = Array.from({ length: STEPS + 1 }, (_, i) => {
    const t = i / STEPS;
    const p = Math.exp(Math.log(priceRatio) * t);
    // Q = P^e, so revenue = P * P^e = P^(1+e).
    const spend = p ** (1 + elasticity);
    const clamped = Math.min(INDEX_DOMAIN[1], Math.max(INDEX_DOMAIN[0], spend));
    return { x: xAt(t), y: y(clamped) };
  });
  return polyline(pts);
}

/** `sliderValue` is elasticity times ten, so the range input can step in tenths. */
export function recompute(sliderValue: number): { path: string; readout: string } {
  const e = sliderValue / 10;
  const implied = impliedElasticity(
    JEVONS.priceDropFraction,
    (JEVONS.revenueGrowthMin + JEVONS.revenueGrowthMax) / 2,
  );
  let verdict: string;
  if (e > -1) verdict = 'Total spending falls — efficiency saves money.';
  else if (e === -1) verdict = 'Total spending holds flat — the break-even case.';
  else verdict = 'Total spending rises — this is the Jevons condition.';
  return {
    path: spendPath(e),
    readout:
      `Elasticity ${e.toFixed(1)}. ${verdict} ` +
      `The measured series implies ${implied.toFixed(1)}.`,
  };
}
