/**
 * Chart 2 — window against quality.
 *
 * Two measured series on one log y-axis: the context window providers offer,
 * dated, and the roughly 6K tokens readers actually use. The gap between them
 * is the finding, and it widens because only one of the two lines moves.
 */

import { DEGRADATION, UTILIZATION, WINDOW_TIMELINE, interpolateRetention } from '../../data/tokenomics';
import { PLOT, type Pt, envelope, polyline } from './geometry';
import { log10 } from './scale';

/**
 * WINDOW_TIMELINE spans 2,000 (GPT-3) to 2,000,000 (Gemini 3.1 Pro) tokens.
 * Half a decade of headroom on each side keeps both endpoints off the axis
 * edge: 1,000 is half of 2,000, 4,000,000 is double 2,000,000.
 */
const TOKEN_DOMAIN = [1_000, 4_000_000] as const;
const DATE_DOMAIN = [2020 + 5 / 12, 2026 + 5 / 12] as const;

const toYear = (yyyymm: string): number => {
  const [y, m] = yyyymm.split('-').map(Number);
  return y + (m - 1) / 12;
};

const x = (d: string) => {
  const t = (toYear(d) - DATE_DOMAIN[0]) / (DATE_DOMAIN[1] - DATE_DOMAIN[0]);
  return PLOT.x0 + t * (PLOT.x1 - PLOT.x0);
};
const y = log10(TOKEN_DOMAIN, [PLOT.y1, PLOT.y0]);

export function layout() {
  const offered: (Pt & { model: string; tokens: number; date: string })[] =
    WINDOW_TIMELINE.points.map((p) => ({ ...p, x: x(p.date), y: y(p.tokens) }));

  // "Largest window available to date". Claude 3's 200K follows Gemini's 1M, so
  // joining the raw points would draw a shrinking frontier that never happened.
  const maxToDate = envelope(WINDOW_TIMELINE.points.map((p) => p.tokens), 'max');
  const envelopePts: Pt[] = WINDOW_TIMELINE.points.map((p, i) => ({
    x: x(p.date),
    y: y(maxToDate[i]),
  }));

  const used = UTILIZATION.points[0].used;

  return {
    offered,
    envelope: envelopePts,
    envelopePath: polyline(envelopePts),
    usedLine: { y: y(used), tokens: used },
    utilization: UTILIZATION.points,
    degradation: DEGRADATION,
    tokenDomain: TOKEN_DOMAIN,
  };
}

export function recompute(tokens: number): { readout: string } {
  const retention = interpolateRetention(tokens);
  const pct = Math.round(retention * 100);
  const k = tokens >= 1_000_000 ? `${(tokens / 1_000_000).toFixed(1)}M` : `${Math.round(tokens / 1000)}K`;
  const used = UTILIZATION.points[0].used;

  // "Utilization" is the ratio of two independently measured quantities, and
  // that ratio is only meaningful in one direction: a typical session using
  // less of a larger window. Below `used`, the honest statement is that the
  // session does not fit — not a percentage over 100, and not one clamped
  // down to hide that it doesn't.
  if (tokens < used) {
    const usedK = Math.round(used / 1000);
    return {
      readout:
        `At a ${k} window: about ${pct}% accuracy retained, interpolated between the ` +
        `measured 10K and 100K anchors. A typical ${usedK}K session would not fit in a ` +
        `window this small.`,
    };
  }

  const util = ((used / tokens) * 100).toFixed(1);
  return {
    readout:
      `At a ${k} window: about ${pct}% accuracy retained, interpolated between the ` +
      `measured 10K and 100K anchors. A typical 6K session uses ${util}% of it.`,
  };
}
