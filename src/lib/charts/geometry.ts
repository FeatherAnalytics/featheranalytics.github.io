/**
 * Path building and the shared plot frame.
 *
 * Pure and dependency-free for the same reason as scale.ts: it runs in the
 * build and again in the browser.
 */

export type Pt = { x: number; y: number };

/**
 * The coordinate space every chart draws in.
 *
 * A fixed viewBox rather than the rendered pixel width, because these charts are
 * emitted at build time and no width is known then. The chart wrapper carries a
 * matching `aspect-ratio`, and all text is HTML positioned over the SVG in
 * percentage terms, so nothing about the type depends on this space. Strokes
 * carry `vector-effect="non-scaling-stroke"` so line weight stays constant in
 * device pixels no matter how wide the SVG lands.
 */
export const VB = { w: 1000, h: 620 } as const;

/** The drawable area. Left margin is wide enough for a rotated axis title. */
export const PLOT = { x0: 96, x1: 956, y0: 32, y1: 548 } as const;

/** Two decimals is finer than a device pixel at any width these charts render. */
const r = (n: number): number => Math.round(n * 100) / 100;

export function polyline(pts: readonly Pt[]): string {
  if (pts.length < 2) return '';
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${r(p.x)} ${r(p.y)}`).join(' ');
}

/**
 * A Catmull-Rom spline converted to cubic beziers.
 *
 * Used only for curves the post labels as stylized — the PPF frontier and the
 * Jevons index lines. Measured series are drawn with `polyline`: smoothing a
 * measured series invents values between its points, which is the one thing
 * these charts must not do.
 */
export function smooth(pts: readonly Pt[], tension = 0.5): string {
  if (pts.length < 2) return '';
  if (pts.length === 2) return polyline(pts);
  const k = (tension * 2) / 6;
  let d = `M ${r(pts[0].x)} ${r(pts[0].y)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) * k;
    const c1y = p1.y + (p2.y - p0.y) * k;
    const c2x = p2.x - (p3.x - p1.x) * k;
    const c2y = p2.y - (p3.y - p1.y) * k;
    d += ` C ${r(c1x)} ${r(c1y)}, ${r(c2x)} ${r(c2y)}, ${r(p2.x)} ${r(p2.y)}`;
  }
  return d;
}

/**
 * A running minimum or maximum.
 *
 * The price series is not monotonic — Jul 2024's $0.15 model is followed by
 * Dec 2024's $0.27 one — because the points are different models, not one
 * product's price history. Plotting them joined would draw a price rise that
 * never happened to any buyer. The envelope is "cheapest available to date",
 * which is the claim the post actually makes, and the individual points stay on
 * the chart as a scatter so nothing is hidden.
 */
export function envelope(values: readonly number[], mode: 'min' | 'max'): number[] {
  const pick = mode === 'min' ? Math.min : Math.max;
  let acc = values[0];
  return values.map((v) => (acc = pick(acc, v)));
}

/**
 * A coordinate as a percentage of its axis, for absolutely positioned HTML labels.
 *
 * Rounds to three decimals directly rather than through `r` (which rounds to
 * two): `r` would collapse 33.333% to 33.33%, losing the precision this needs
 * for sub-pixel label placement.
 */
export function pct(value: number, total: number): string {
  return `${Math.round((value / total) * 100000) / 1000}%`;
}
