/**
 * Every figure the token-economics post cites, with the document it came from.
 *
 * Source strings name a research document and section rather than a URL: the
 * corpus is a local collection, and the post's own Sources section carries the
 * outward links. The point of the citation here is that a reader of this file
 * can trace any number back to where it was argued.
 *
 * Headline figures in FIGURES are DERIVED from the series below, not typed.
 * That is what stops the prose from drifting: the post interpolates
 * FIGURES.deflationFactor rather than writing "750x", so editing the series
 * edits the sentence.
 */

// ---------------------------------------------------------------- price decline

/**
 * `datePrecision` distinguishes a month the corpus actually states from one
 * this module inferred so the series would have a sortable date. Doc 01 §5's
 * table gives "Late 2023" and "2026" for two rows with no month named — those
 * two are `'inferred'`. Every chart or caption that plots these points must
 * disclose the inferred ones rather than presenting them as measured to the
 * month.
 */
export const PRICE_DECLINE = {
  source: 'Research doc 01 "Tokens as a Scarce Resource", section 5 — deflation table',
  note: 'Cheapest input price per million tokens at or above GPT-4-class capability.',
  points: [
    { date: '2023-03', label: 'GPT-4', usd: 30.0, datePrecision: 'stated' },
    { date: '2023-11', label: 'GPT-4 Turbo', usd: 10.0, datePrecision: 'inferred' },
    { date: '2024-05', label: 'GPT-4o', usd: 5.0, datePrecision: 'stated' },
    { date: '2024-07', label: 'GPT-4o Mini', usd: 0.15, datePrecision: 'stated' },
    { date: '2024-12', label: 'DeepSeek V3', usd: 0.27, datePrecision: 'stated' },
    { date: '2025-01', label: 'DeepSeek R1', usd: 0.55, datePrecision: 'stated' },
    { date: '2026-01', label: 'DeepSeek V3.2', usd: 0.14, datePrecision: 'inferred' },
    { date: '2026-06', label: 'Ministral 3B', usd: 0.04, datePrecision: 'stated' },
  ],
} as const;

export const DECLINE_COMPARISON = {
  source: 'Research doc 04 "Budget Constraints", section 2 — decline comparison table',
  points: [
    { name: "Transistors (Moore's Law)", annualPct: 23, range: '16–30%', years: '~50 years' },
    { name: 'AWS EC2 compute', annualPct: 8, range: '~8%', years: '~18 years' },
    { name: 'AWS S3 storage', annualPct: 15, range: '~15%', years: '~10 years' },
    { name: 'Internet bandwidth', annualPct: 30, range: '~30%', years: '~25 years' },
    { name: 'LLM tokens (frontier)', annualPct: 85, range: '80–90%', years: '~3 years' },
  ],
} as const;

// -------------------------------------------------------------- context windows

/**
 * The corpus's own headline for this table is "roughly 1,000x growth... from
 * 2K tokens to 2M" (doc 05 §1), so the endpoints here are chosen to reproduce
 * that framing rather than an arbitrary pair: GPT-3's row is stated as
 * "2K-4K tokens" and takes the 2K lower bound; Gemini 3.1 Pro closes the
 * series at the 2M doc 05 §5 says it advertises (MODEL_TIERS agrees, at
 * `contextK: 2_000`).
 *
 * Doc 05 §5 also names a model that "claims" a 10M window (Gemini 3), but
 * never states it shipped generally available — only "advertises" / "claims"
 * language, versus "GA" for the other rows. Excluded on that basis: plotting
 * it would put growth at 5,000x and overstate what a developer could use in
 * mid-2026.
 */
export const WINDOW_TIMELINE = {
  source: 'Research doc 05 "The Window-Quality Equilibrium", section 1 — window expansion table',
  points: [
    { date: '2020-06', model: 'GPT-3', tokens: 2_000 },
    { date: '2022-11', model: 'ChatGPT', tokens: 8_000 },
    { date: '2023-03', model: 'GPT-4', tokens: 32_000 },
    { date: '2023-05', model: 'Claude 2', tokens: 100_000 },
    { date: '2023-11', model: 'GPT-4 Turbo', tokens: 128_000 },
    { date: '2024-02', model: 'Gemini 1.5 Pro', tokens: 1_000_000 },
    { date: '2024-03', model: 'Claude 3', tokens: 200_000 },
    { date: '2026-02', model: 'Claude Opus 4', tokens: 1_000_000 },
    { date: '2026-06', model: 'Gemini 3.1 Pro', tokens: 2_000_000 },
  ],
} as const;

export const UTILIZATION = {
  source: 'Research doc 05 "The Window-Quality Equilibrium", section 6 — context slack table',
  note: 'Average usage is roughly 6K tokens regardless of the window offered.',
  points: [
    { window: 128_000, used: 6_000, pct: 4.7 },
    { window: 200_000, used: 6_000, pct: 3.0 },
    { window: 1_000_000, used: 6_000, pct: 0.6 },
  ],
} as const;

/**
 * Measured accuracy retention at two context depths.
 *
 * Chroma's 2025 study of 18 frontier models found a 20-50% accuracy drop from
 * 10K to 100K tokens. `retention` is 1 minus the midpoint of that range, and
 * `dropRange` keeps the span so the chart can state it rather than implying the
 * midpoint is the finding.
 */
export const DEGRADATION = {
  source: 'Research doc 05 "The Window-Quality Equilibrium", section 3 — Chroma 2025 (18 models); Liu et al. 2023',
  dropRange: '20–50%',
  liuDropPoints: '15–25 percentage points',
  points: [
    { tokens: 10_000, retention: 1.0 },
    { tokens: 100_000, retention: 0.65 },
  ],
} as const;

// -------------------------------------------------------------------- the PPF

/**
 * June 2026 rate card, with each provider's own tier ranking.
 *
 * `tier` is ORDINAL and belongs to the provider that ships the model: 1 budget,
 * 2 mid, 3 frontier. It is not a quality score and must never be plotted as
 * one. No per-model quality metric exists in the corpus, so inventing y-values
 * and drawing them as a measured scatter would misrepresent the data. The
 * chart's y-axis is labeled "provider tier" and carries no numeric ticks.
 */
export const MODEL_TIERS = {
  source:
    'Research doc 01 "Tokens as a Scarce Resource", section 4 — rate cards; doc 03 "The Production Possibility Frontier", section 4 — tiers as PPF positions',
  points: [
    // contextK: null — no document in the corpus states a context window for
    // Ministral 3B (doc 01 §4's budget rate card gives price only; doc 03 §4's
    // tier tables cover Anthropic, OpenAI and Google only). The gap is
    // deliberate: a table or chart rendering this field must show something
    // like "not stated" here, never a number.
    { model: 'Ministral 3B', provider: 'Mistral', usdIn: 0.04, contextK: null, tier: 1 },
    { model: 'Haiku 4', provider: 'Anthropic', usdIn: 1.0, contextK: 200, tier: 1 },
    { model: 'Gemini 3.1 Pro', provider: 'Google', usdIn: 2.0, contextK: 2_000, tier: 3 },
    { model: 'Sonnet 4', provider: 'Anthropic', usdIn: 3.0, contextK: 1_000, tier: 2 },
    { model: 'Opus 4', provider: 'Anthropic', usdIn: 5.0, contextK: 1_000, tier: 3 },
  ],
} as const;

/**
 * The two real points that establish the frontier's concavity.
 *
 * Doc 03 §4 separately reports per-model SWE-bench figures on the same output-
 * token basis — Opus 4 at 88.6% for $25/M output, DeepSeek V4 Pro Max at 80.6%
 * for $0.87/M — but those are a different, specific model pair at different
 * quality thresholds. They are not a contradiction of the pair below; the two
 * sets should not be plotted together as one curve.
 */
export const QUALITY_COST = {
  source: 'Research doc 00 "LLM Token Economics: Consolidated Summary", section 3, finding 3 — SWE-bench cost curve',
  points: [
    { swePct: 80, usdPerMTok: 1 },
    { swePct: 95, usdPerMTok: 50 },
  ],
} as const;

// ------------------------------------------------------------------- Jevons

export const AGENT_MULTIPLIER = {
  source: 'Research doc 06 "Jevons Paradox and the Token Demand Spiral", section 4 — agent consumption table',
  points: [
    { pattern: 'Single prompt', tokens: '1K–3K', mult: 1 },
    { pattern: '5-step agent loop', tokens: '10K–15K', mult: 5 },
    { pattern: '50-step agentic session', tokens: '300K–500K', mult: 125 },
    { pattern: '200-step autonomous debug', tokens: '1M–3M', mult: 750 },
    { pattern: 'Multi-agent team session', tokens: '5M–15M', mult: 3_500 },
  ],
} as const;

export const JEVONS = {
  source:
    'Research doc 06 "Jevons Paradox and the Token Demand Spiral", section 5 — revenue against price; doc 00 "LLM Token Economics: Consolidated Summary", finding 2',
  priceDropFraction: 0.95,
  revenueGrowthMin: 20,
  revenueGrowthMax: 30,
  statedVolumeGrowth: '400–600×',
  enterpriseSpendGrowthPct: 483,
  programmingShareBefore: 11,
  programmingShareAfter: 50,
  perDeveloperGrowth: 18.6,
  uber: 'Uber gave 5,000 engineers Claude Code in December 2025 and exhausted its annual AI budget by April 2026.',
  falsification: [
    'Total enterprise token spending declines year over year by 2028.',
    'Volume growth tracks capability benchmarks rather than price cuts — jumping with each model generation and flat between them.',
    'Agent token consumption peaks and falls as architectures stop re-sending full context on every turn.',
  ],
  newProductProblem:
    'Much of the growth came from capabilities that existed at no price before, which makes it closer to the automobile than to Watt improving the steam engine — descriptive of Jevons, but not caused by it.',
  points: [{ label: 'measured divergence', priceIndex: 0.05, revenueIndex: 25 }],
} as const;

// --------------------------------------------------------- grounding sections

export const COST_FLOOR = {
  source:
    'Research doc 01 "Tokens as a Scarce Resource", section 5 — floor dollar figures; doc 02 "The Cost Structure of a Token", section 9 — the physical framing',
  budgetFloorLow: 0.01,
  budgetFloorHigh: 0.03,
  frontierStableLow: 2,
  frontierStableHigh: 5,
  note: 'A token requires loading weights from memory, multiplying matrices, and writing results back. The floor is thermodynamic, not notional.',
} as const;

// `openWeightLagMonths` is doc 07 §7. `hostingSpreadForIdenticalWeights` (the
// Llama 4 Maverick $0.10-$3.00 spread) is doc 02 §7, not doc 07 — doc 07 §7
// states the lag figure only and carries no hosting-spread number.
export const SUPPLY_SIDE = {
  source:
    'Research doc 07 "Supply-Side Economics of the Token Market", sections 2, 4, 6, 7; doc 02 "The Cost Structure of a Token", section 7',
  capex2026UsdBn: 620,
  anthropicEnterpriseApiSharePct: 32,
  chatgptConsumerSharePct: 74,
  googleRoutingSharePct: 43,
  lockInConcernedPct: 94,
  couldSwitchPct: 6,
  openWeightLagMonths: '6–12 months',
  hostingSpreadForIdenticalWeights: '30×',
} as const;

// ------------------------------------------------------------------- derived

/**
 * Volume growth implied by a price drop and a revenue multiple.
 *
 * Revenue is price times quantity, so quantity is revenue divided by the price
 * ratio. This is the arithmetic the Jevons argument rests on, and it is computed
 * rather than asserted so the post cannot quote a figure the inputs disagree
 * with.
 */
export function impliedVolumeGrowth(priceDropFraction: number, revenueGrowth: number): number {
  if (priceDropFraction >= 1) {
    throw new Error(`impliedVolumeGrowth: priceDropFraction must be less than 1, got ${priceDropFraction}`);
  }
  return revenueGrowth / (1 - priceDropFraction);
}

/**
 * Price elasticity of demand implied by the measured series, log-log.
 *
 * Returns a negative number. Below -1, demand is elastic enough that a price
 * cut raises total spending — the Jevons condition. Exactly -1 is break-even,
 * where revenue holds flat.
 */
export function impliedElasticity(priceDropFraction: number, revenueGrowth: number): number {
  if (priceDropFraction >= 1) {
    throw new Error(`impliedElasticity: priceDropFraction must be less than 1, got ${priceDropFraction}`);
  }
  if (revenueGrowth <= 0) {
    throw new Error(`impliedElasticity: revenueGrowth must be positive, got ${revenueGrowth}`);
  }
  const priceRatio = 1 - priceDropFraction;
  return Math.log(impliedVolumeGrowth(priceDropFraction, revenueGrowth)) / Math.log(priceRatio);
}

/**
 * Accuracy retention at a context depth, log-interpolated between the two
 * measured anchors and clamped outside them.
 *
 * Clamped rather than extrapolated on purpose: the study measured 10K and 100K,
 * so a curve continuing past 1M would be this chart inventing evidence.
 *
 * This is called from the browser as a reader drags chart 2's slider, with
 * arbitrary token values — unlike FIGURES, its inputs are not fixed at build
 * time, so a NaN here would silently void an SVG attribute rather than fail
 * a test. It throws instead of returning one.
 */
export function interpolateRetention(tokens: number): number {
  if (tokens <= 0) {
    throw new Error(`interpolateRetention: tokens must be positive, got ${tokens}`);
  }
  // Asserted rather than left as a comment: a third anchor added to
  // DEGRADATION later would otherwise be silently ignored by the destructure
  // below, the same class of silent failure this guard pass exists to close.
  if (DEGRADATION.points.length !== 2) {
    throw new Error(
      `interpolateRetention: expected exactly two DEGRADATION anchors, got ${DEGRADATION.points.length}`,
    );
  }
  // Widened from the `as const` literal pair: DEGRADATION's two token values
  // are 10_000 and 100_000 today, so TS can prove this comparison always
  // false and flags it as an error. The guard exists for a future edit that
  // makes both anchors equal, which the literal type cannot represent.
  const [a, b] = DEGRADATION.points as readonly { tokens: number; retention: number }[];
  if (a.tokens === b.tokens) {
    throw new Error(`interpolateRetention: anchors must have distinct tokens, both are ${a.tokens}`);
  }
  const t = (Math.log10(tokens) - Math.log10(a.tokens)) / (Math.log10(b.tokens) - Math.log10(a.tokens));
  const clamped = Math.min(1, Math.max(0, t));
  return a.retention + (b.retention - a.retention) * clamped;
}

const round = (n: number): string => String(Math.round(n));

/**
 * The headline figures, interpolated directly into the post's prose.
 *
 * Derived at module load from the series above, so a sentence cannot disagree
 * with the chart beside it. Anything the post states numerically and that also
 * appears in a chart belongs here.
 */
export const FIGURES = {
  deflationFactor: `${round(PRICE_DECLINE.points[0].usd / Math.min(...PRICE_DECLINE.points.map((p) => p.usd)))}×`,
  startPrice: `$${PRICE_DECLINE.points[0].usd.toFixed(2)}`,
  endPrice: `$${Math.min(...PRICE_DECLINE.points.map((p) => p.usd)).toFixed(2)}`,
  tokenAnnualDecline: `${DECLINE_COMPARISON.points.at(-1)!.range}`,
  mooreAnnualDecline: `${DECLINE_COMPARISON.points[0].range}`,
  windowGrowthFactor: `${round(Math.max(...WINDOW_TIMELINE.points.map((p) => p.tokens)) / WINDOW_TIMELINE.points[0].tokens)}×`,
  lowestUtilization: `${UTILIZATION.points.at(-1)!.pct}%`,
  typicalUsage: `${round(UTILIZATION.points[0].used / 1000)}K`,
  degradationDrop: DEGRADATION.dropRange,
  liuDrop: DEGRADATION.liuDropPoints,
  cheapestTier: `$${MODEL_TIERS.points[0].usdIn.toFixed(2)}`,
  dearestTier: `$${MODEL_TIERS.points.at(-1)!.usdIn.toFixed(2)}`,
  sweCheap: `$${QUALITY_COST.points[0].usdPerMTok}`,
  sweDear: `$${QUALITY_COST.points[1].usdPerMTok}`,
  agentTopMultiplier: `${AGENT_MULTIPLIER.points.at(-1)!.mult.toLocaleString('en-US')}×`,
  priceDrop: `${round(JEVONS.priceDropFraction * 100)}%`,
  revenueGrowth: `${JEVONS.revenueGrowthMin}–${JEVONS.revenueGrowthMax}×`,
  statedVolume: JEVONS.statedVolumeGrowth,
  impliedElasticity: impliedElasticity(
    JEVONS.priceDropFraction,
    (JEVONS.revenueGrowthMin + JEVONS.revenueGrowthMax) / 2,
  ).toFixed(1),
  capex: `$${SUPPLY_SIDE.capex2026UsdBn}B`,
  couldSwitch: `${SUPPLY_SIDE.couldSwitchPct}%`,
  budgetFloor: `$${COST_FLOOR.budgetFloorLow}–${COST_FLOOR.budgetFloorHigh}`,
} as const;
