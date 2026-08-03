/**
 * Scale and tick math for the token-economics charts.
 *
 * Pure, and deliberately importing nothing: these functions run twice, once in
 * the Astro build to emit the SVG and once in the browser when a reader moves a
 * control. One implementation means the two can never disagree.
 */

export type Scale = (value: number) => number;
export type Span = readonly [number, number];

export function linear(domain: Span, range: Span): Scale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  if (d0 === d1) throw new Error(`linear: zero-width domain [${d0}, ${d1}]`);
  const k = (r1 - r0) / (d1 - d0);
  return (v) => r0 + (v - d0) * k;
}

/**
 * A base-10 logarithmic scale.
 *
 * Every series this post plots on a log axis spans three or more decades —
 * $30 to $0.04, 2K tokens to 1M — where a linear axis would compress
 * everything below the largest value into the baseline and hide the shape the
 * chart exists to show.
 */
export function log10(domain: Span, range: Span): Scale {
  const [d0, d1] = domain;
  if (d0 <= 0 || d1 <= 0) {
    throw new Error(`log10: domain must be positive, got [${d0}, ${d1}]`);
  }
  const lin = linear([Math.log10(d0), Math.log10(d1)], range);
  return (v) => lin(Math.log10(v));
}

export function linearTicks(domain: Span, count = 5): number[] {
  const [d0, d1] = domain;
  const step = (d1 - d0) / (count - 1);
  return Array.from({ length: count }, (_, i) => d0 + i * step);
}

/** Every power of ten within the domain, inclusive. */
export function decadeTicks(domain: Span): number[] {
  const [d0, d1] = domain;
  if (d0 <= 0 || d1 <= 0) {
    throw new Error(`decadeTicks: domain must be positive, got [${d0}, ${d1}]`);
  }
  const out: number[] = [];
  for (let e = Math.ceil(Math.log10(d0)); e <= Math.floor(Math.log10(d1)); e++) {
    out.push(10 ** e);
  }
  return out;
}
