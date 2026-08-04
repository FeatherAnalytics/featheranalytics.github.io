/**
 * Chart 3 — the budget constraint.
 *
 * The measured deflation series on a log price axis, against the annual decline
 * rate of every other metered resource in computing. The comparison lines are
 * drawn from real annual percentages, compounded over the same span, so they
 * are measured rates rendered as trajectories rather than invented curves.
 */

import { DECLINE_COMPARISON, PRICE_DECLINE } from '../../data/tokenomics';
import { PLOT, type Pt, envelope, polyline } from './geometry';
import { log10 } from './scale';

const PRICE_DOMAIN = [0.03, 40] as const;
const DATE_DOMAIN = [2023 + 2 / 12, 2026 + 5 / 12] as const;

const toYear = (yyyymm: string): number => {
  const [y, m] = yyyymm.split('-').map(Number);
  return y + (m - 1) / 12;
};

const x = (d: string) => {
  const t = (toYear(d) - DATE_DOMAIN[0]) / (DATE_DOMAIN[1] - DATE_DOMAIN[0]);
  return PLOT.x0 + t * (PLOT.x1 - PLOT.x0);
};
const y = log10(PRICE_DOMAIN, [PLOT.y1, PLOT.y0]);

export function layout() {
  const scatter = PRICE_DECLINE.points.map((p) => ({ ...p, x: x(p.date), y: y(p.usd) }));
  const envelopeValues = envelope(PRICE_DECLINE.points.map((p) => p.usd), 'min');
  const envelopePts: Pt[] = PRICE_DECLINE.points.map((p, i) => ({
    x: x(p.date),
    y: y(envelopeValues[i]),
  }));

  return {
    scatter,
    envelopeValues,
    envelopePath: polyline(envelopePts),
    comparisons: DECLINE_COMPARISON.points.filter((c) => !c.name.startsWith('LLM')),
    tokenRow: DECLINE_COMPARISON.points.at(-1)!,
    priceDomain: PRICE_DOMAIN,
  };
}

/**
 * A comparison technology's trajectory from the same $30 start.
 *
 * Compounds its real annual decline over the series span, which answers the
 * question the chart asks: had GPT-4's price fallen at Moore's Law's pace
 * instead, where would it be now?
 */
export function comparisonPath(annualPct: number): string {
  const years = DATE_DOMAIN[1] - DATE_DOMAIN[0];
  const start = PRICE_DECLINE.points[0].usd;
  const steps = 24;
  const pts: Pt[] = Array.from({ length: steps + 1 }, (_, i) => {
    const t = (i / steps) * years;
    const value = start * (1 - annualPct / 100) ** t;
    const px = PLOT.x0 + (i / steps) * (PLOT.x1 - PLOT.x0);
    return { x: px, y: y(Math.max(value, PRICE_DOMAIN[0])) };
  });
  return polyline(pts);
}

export function recompute(annualPct: number): { path: string; readout: string } {
  const match = DECLINE_COMPARISON.points.find((c) => c.annualPct === annualPct);
  const token = DECLINE_COMPARISON.points.at(-1)!;
  const years = DATE_DOMAIN[1] - DATE_DOMAIN[0];
  const start = PRICE_DECLINE.points[0].usd;
  const would = start * (1 - annualPct / 100) ** years;
  return {
    path: comparisonPath(annualPct),
    readout:
      `${match?.name ?? 'Comparison'} falls ${match?.range ?? `${annualPct}%`} a year. ` +
      `At that pace GPT-4's $30 would be $${would.toFixed(2)} today, not ` +
      `$${Math.min(...PRICE_DECLINE.points.map((p) => p.usd)).toFixed(2)}. ` +
      `Tokens fell ${token.range} a year.`,
  };
}
