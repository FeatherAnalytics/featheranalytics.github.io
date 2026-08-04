/**
 * Chart 1 — the producer tradeoff.
 *
 * The x-axis is measured: June 2026 input price per million tokens, log scale
 * because the tiers span $0.04 to $5.00. The y-axis is ORDINAL — each
 * provider's own budget/mid/frontier ranking — and carries no numeric ticks,
 * because no per-model quality score exists in the corpus and inventing one
 * would make a drawn chart look like a measured one.
 *
 * The concavity claim rests on the two SWE-bench cost anchors, which ARE
 * measured, and they are drawn as their own annotated pair rather than being
 * folded into the scatter.
 */

import { MODEL_TIERS, QUALITY_COST } from '../../data/tokenomics';
import { PLOT, type Pt, smooth } from './geometry';
import { log10 } from './scale';

const PRICE_DOMAIN = [0.03, 8] as const;
const TIER_NAMES = ['budget', 'mid', 'frontier'] as const;

const x = log10(PRICE_DOMAIN, [PLOT.x0, PLOT.x1]);

/** Three evenly spaced ordinal bands, frontier highest on screen. */
const bandY = (tier: number): number => {
  const inset = 70;
  const top = PLOT.y0 + inset;
  const bottom = PLOT.y1 - inset;
  return bottom - ((tier - 1) / 2) * (bottom - top);
};

export function layout() {
  const models = MODEL_TIERS.points.map((m) => ({
    ...m,
    x: x(m.usdIn),
    y: bandY(m.tier),
    label: `${m.model} ${'$' + m.usdIn.toFixed(2)}`,
  }));

  const tierBands = TIER_NAMES.map((name, i) => ({ name, y: bandY(i + 1) }));

  const anchors = QUALITY_COST.points.map((a) => ({
    ...a,
    x: x(Math.min(a.usdPerMTok, PRICE_DOMAIN[1])),
    y: a.swePct === 80 ? bandY(2) : bandY(3),
    clamped: a.usdPerMTok > PRICE_DOMAIN[1],
  }));

  return { models, tierBands, anchors, priceDomain: PRICE_DOMAIN };
}

/**
 * The stylized frontier.
 *
 * Dashed in the chart and labeled as drawn. `budget` is a multiple of the
 * baseline compute budget; raising it lifts the curve toward the top-left,
 * which is the outward shift consumer theory predicts. The measured points do
 * not move, and the caption says so.
 */
export function frontierPath(budget: number): string {
  const top = PLOT.y0 + 40;
  const bottom = PLOT.y1 - 40;
  const lift = (bottom - top) * 0.18 * (budget - 1);
  const pts: Pt[] = [0, 0.25, 0.5, 0.75, 1].map((t) => {
    const px = PLOT.x0 + (PLOT.x1 - PLOT.x0) * t;
    // Concave: cheap capability is nearly free, the last increment is not.
    const py = bottom - (bottom - top) * t ** 2.1 - lift;
    return { x: px, y: Math.max(PLOT.y0, py) };
  });
  return smooth(pts);
}

export function recompute(sliderValue: number): { path: string; readout: string } {
  const budget = sliderValue / 100;
  return {
    path: frontierPath(budget),
    readout:
      `Compute budget ${budget.toFixed(1)}×. The drawn frontier shifts outward; ` +
      `the rate card points are measured and do not move.`,
  };
}
