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
 *
 * Every row is an input-only rate, which is what makes the chain comparable
 * against the March 2023 anchor. Doc 01 §5 also lists gpt-oss-120b on
 * DeepInfra's Turbo SKU at $0.02 per million, and that row is deliberately
 * absent: the provider table publishes it only as a blended input-and-output
 * figure, so it is not commensurable with anything else here and would move the
 * headline deflation factor onto a basis no other point shares. The blended
 * floor is $0.02, and against the $30.00 anchor that is 1,500x rather than the
 * 750x this series derives.
 *
 * Two labels carry a parenthetical because the rate is not a standing list
 * price. GPT-5.6 Sol's $4.00 is promotional with a published floor date of
 * 2026-11-21, after which list pricing of $5.00 applies. DeepSeek bills peak
 * hours — 01:00-04:00 and 06:00-10:00 UTC on weekdays — at exactly 2x the
 * off-peak rate shown, so V4 Pro is $1.32 for part of every working day.
 */
export const PRICE_DECLINE = {
  source: 'Research doc 01 "Tokens as a Scarce Resource", section 5 — deflation table',
  note: 'Cheapest-available-SKU chain of input prices per million tokens. Capability is held fixed at neither end, so this records what the cheapest token cost rather than the cost of a constant level of capability.',
  points: [
    { date: '2023-03', label: 'GPT-4', usd: 30.0, datePrecision: 'stated' },
    { date: '2023-11', label: 'GPT-4 Turbo', usd: 10.0, datePrecision: 'inferred' },
    { date: '2024-05', label: 'GPT-4o', usd: 5.0, datePrecision: 'stated' },
    { date: '2024-07', label: 'GPT-4o Mini', usd: 0.15, datePrecision: 'stated' },
    { date: '2024-12', label: 'DeepSeek V3', usd: 0.27, datePrecision: 'stated' },
    { date: '2025-01', label: 'DeepSeek R1', usd: 0.55, datePrecision: 'stated' },
    { date: '2026-01', label: 'DeepSeek V3.2', usd: 0.14, datePrecision: 'inferred' },
    { date: '2026-06', label: 'GPT-4.1 Nano', usd: 0.1, datePrecision: 'stated' },
    { date: '2026-06', label: 'Ministral 3B', usd: 0.04, datePrecision: 'stated' },
    { date: '2026-08', label: 'GPT-5.6 Sol (promotional)', usd: 4.0, datePrecision: 'stated' },
    { date: '2026-08', label: 'Claude Sonnet 5', usd: 2.0, datePrecision: 'stated' },
    { date: '2026-08', label: 'DeepSeek V4 Pro (off-peak)', usd: 0.66, datePrecision: 'stated' },
    { date: '2026-08', label: 'GPT-5 Nano', usd: 0.05, datePrecision: 'stated' },
  ],
} as const;

/**
 * Token decline against the great cost curves of technology history.
 *
 * The token row is the FRONTIER FLAGSHIP rate, and the label has to stay on it.
 * The corpus separates two curves that diverged after 2024: a buyer who insists
 * on the current flagship has seen roughly 45% per year, while a buyer willing
 * to run the cheapest capable SKU has seen roughly 85%. The 80-90% figure this
 * row used to carry belongs to the second curve, and putting it under a
 * "frontier" label is the conflation the review panel flagged. On a continuous
 * exponential basis the frontier falls at about 0.64x the fastest decade of
 * Moore's Law — slower than semiconductors, not several times faster.
 *
 * One non-comparability cannot be fixed by arithmetic, and any caption drawn
 * from this table should say so. Moore's 16% end of the range is a
 * quality-adjusted hedonic index; the token figure is a cheapest-available-SKU
 * chain whose capability changes at every link, which absorbs capability decline
 * into measured price decline and flatters tokens. Read the multiples as
 * indicative and the sign as reliable until a hedonic token index exists.
 *
 * The token rate is also a two-point annualization with no residual, standard
 * error, or test behind it, over a window a Chow test says is not one regime.
 */
export const DECLINE_COMPARISON = {
  source: 'Research doc 04 "Budget Constraints", section 3 — comparing decline curves',
  points: [
    { name: "Transistors (Moore's Law)", annualPct: 23, range: '16–30%', years: '~50 years' },
    { name: 'AWS EC2 compute', annualPct: 8, range: '~8%', years: '~18 years' },
    { name: 'AWS S3 storage', annualPct: 15, range: '~15%', years: '~10 years' },
    { name: 'Internet bandwidth', annualPct: 30, range: '~30%', years: '~25 years' },
    { name: 'LLM tokens (frontier)', annualPct: 45, range: '~45%', years: '~3 years' },
  ],
} as const;

// -------------------------------------------------------------- context windows

/**
 * Every window in this series is one a developer could generally use, and that
 * restriction is what the growth figure depends on.
 *
 * GPT-3's 2,048 tokens to the one-million-token industry baseline is roughly
 * 488x over six years. The larger figure sometimes quoted — around 1,000x, from
 * 2K to 2M — is arithmetically defensible only against Gemini 1.5 Pro's 2M
 * window, and that was one Google model in May 2024 that no competitor ever
 * matched; Google's own current documentation puts the whole Gemini 3.x line at
 * 1M. Llama 4 Scout has advertised 10M since April 2025 and has stood unmatched
 * for sixteen months, with no independent benchmark at that depth.
 *
 * So both ceilings above 1M were breached on paper and neither became a market
 * standard, which is why neither appears below. Plotting the 10M would put
 * growth at 4,883x and describe capacity nobody can rely on. The accurate
 * description of 2024 through 2026 is consolidation at 1M rather than
 * expansion: windows doubled every four to six months from 2020 to 2024, then
 * stopped.
 *
 * Three rows carry corrections worth stating, because each is easy to get
 * wrong. Anthropic's million-token Opus window arrived with Opus 4.6 in
 * February 2026 — the release immediately before it, Opus 4.5 of November 2025,
 * is documented at 200K, which settles the ordering without needing the retired
 * Opus 4 and Opus 4.1 pages that are no longer published. Gemini 3.1 Pro is 1M,
 * not 2M. And the GPT-5.6 family sits at 921,600 tokens, a distinction the round
 * million erases everywhere it is quoted.
 *
 * Two things this series cannot express, and a caption should not imply it can.
 * Claude Sonnet 4's million-token window in August 2025 shipped as a gated beta
 * rather than a default, which is a third state alongside advertised and
 * generally available. And the advertised number is not the usable one: four
 * independent measurements of effective context disagree by more than an order
 * of magnitude, and any general rule for it is now a statement about a model
 * generation rather than about models.
 */
export const WINDOW_TIMELINE = {
  source: 'Research doc 05 "The Window-Quality Equilibrium", section 1 — the context arms race',
  points: [
    { date: '2020-06', model: 'GPT-3', tokens: 2_048 },
    { date: '2022-11', model: 'ChatGPT', tokens: 4_096 },
    { date: '2023-03', model: 'GPT-4', tokens: 8_192 },
    { date: '2023-05', model: 'Claude 1.3', tokens: 100_000 },
    { date: '2023-11', model: 'GPT-4 Turbo', tokens: 128_000 },
    { date: '2024-02', model: 'Gemini 1.5 Pro', tokens: 1_000_000 },
    { date: '2024-03', model: 'Claude 3', tokens: 200_000 },
    { date: '2025-11', model: 'Claude Opus 4.5', tokens: 200_000 },
    { date: '2026-02', model: 'Claude Opus 4.6', tokens: 1_000_000 },
    { date: '2026-06', model: 'Gemini 3.1 Pro', tokens: 1_000_000 },
    { date: '2026-07', model: 'Claude Opus 5', tokens: 1_000_000 },
    { date: '2026-07', model: 'GPT-5.6 Sol', tokens: 921_600 },
    { date: '2026-08', model: 'Gemini 3.7 Flash', tokens: 1_000_000 },
    { date: '2026-08', model: 'Qwen3.8-Max', tokens: 991_808 },
  ],
} as const;

/**
 * The three shares are one number — a ~6,000-token mean prompt — divided by
 * three window sizes. They are not an interval and carry no measurement
 * uncertainty of their own.
 *
 * The mean is also the wrong statistic, and a caption that stops at "under 5%"
 * says the opposite of what the corpus now argues. The distribution is bimodal:
 * human chat sits at a few thousand tokens and shows no sign of moving, while
 * agentic tasks run 1M to 3.5M tokens each, consume roughly 5x what human users
 * do on the same platform, vary up to 30x run to run on identical work, and
 * exhaust windows outright — which is why providers shipped compaction. No
 * published source decomposes utilization by workload, so these shares describe
 * a value neither mode is near. Context slack is real in the average and gone
 * at the margin.
 */
export const UTILIZATION = {
  source: 'Research doc 05 "The Window-Quality Equilibrium", section 6 — what users actually do',
  note: 'Mean prompt length is roughly 6K tokens regardless of the window offered.',
  points: [
    { window: 128_000, used: 6_000, pct: 4.7 },
    { window: 200_000, used: 6_000, pct: 3.0 },
    { window: 1_000_000, used: 6_000, pct: 0.6 },
  ],
} as const;

/**
 * Accuracy retention at two context depths, as measured in 2025.
 *
 * Chroma's 2025 study of 18 frontier models found a 20-50% accuracy drop from
 * 10K to 100K tokens. `retention` is 1 minus the midpoint of that range, and
 * `dropRange` keeps the span so the chart can state it rather than implying the
 * midpoint is the finding.
 *
 * THE DATE IS PART OF THE FINDING, and this curve should be captioned as a 2025
 * measurement rather than as the current state of the world. Every study behind
 * it tested models released in 2023, 2024 or 2025, and no 2026 replication has
 * been published. The corpus has since reversed its position on whether the
 * degradation rate is fixed: on MRCR v2 8-needle at one million tokens, one
 * generation of Claude Sonnet moved retrieval accuracy from 18.5% to 65.8%, and
 * Claude Opus 4.6 reaches 76.0%. That is not what an architectural constant
 * looks like.
 *
 * The reversal rests on thinner evidence than its size suggests — one lineage,
 * one benchmark, single runs with no published variance, compiled by a secondary
 * source; drop the Claude row and the remaining Gemini improvement is 9.9 points
 * over two generations. So the defensible claim is that the degradation rate is
 * demonstrably MOVABLE, not reliably moving. What survives unchanged is that
 * quality still falls with depth in every model measured: Gemini 3.1 Pro loses
 * 58.6 points between 128K and 1M, across its own advertised window.
 *
 * That generational dimension is not represented here, and cannot be without
 * changing this export's shape. `interpolateRetention` and the window-quality
 * slider in `src/lib/charts/equivalence.ts` both destructure exactly two
 * anchors, and a third would be silently swallowed by one and would break the
 * guard in the other. Representing it is deferred rather than dropped.
 */
export const DEGRADATION = {
  source:
    'Research doc 05 "The Window-Quality Equilibrium", section 2 — Chroma 2025 (18 models); Liu et al. 2023',
  dropRange: '20–50%',
  liuDropPoints: 'more than 30 percentage points',
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
 *
 * The ordinal has also stopped tracking capability, which is a further reason
 * not to read it as quality. Gemini 3.7 Flash — a mid tier — outscores Gemini
 * 3.1 Pro on ARC-AGI-2 by 7.5 points. A tier ladder is a product line under
 * nonlinear pricing whose shape a seller chooses, not a ranking a technology
 * dictates, so these rows are a cost schedule rather than one frontier.
 *
 * By August 2026 every Anthropic row here has been superseded: Opus 4 and
 * Sonnet 4 are retired from the first-party API, Opus 5 holds the flagship slot
 * at $5.00, Sonnet 5 the balanced slot at $2.00, and Fable 5 opened a new band
 * above the flagship at $10.00. The top of the live catalog is therefore cheaper
 * in August than in June even though a tier was added above Opus, because the
 * $15.00 SKUs were retired rather than repriced. Holding both snapshots would
 * need a field this shape does not have, so this stays the June card.
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
    { model: 'Haiku 4.5', provider: 'Anthropic', usdIn: 1.0, contextK: 200, tier: 1 },
    { model: 'Gemini 3.1 Pro', provider: 'Google', usdIn: 2.0, contextK: 1_000, tier: 3 },
    { model: 'Sonnet 4', provider: 'Anthropic', usdIn: 3.0, contextK: 1_000, tier: 2 },
    { model: 'Opus 4', provider: 'Anthropic', usdIn: 15.0, contextK: 1_000, tier: 3 },
  ],
} as const;

/**
 * What a SWE-bench Verified score costs, per million output tokens, in August
 * 2026.
 *
 * The floor is DeepSeek V4 Flash at 79.0% for $0.66 off-peak, and DeepSeek
 * bills peak hours at exactly 2x, so the floor is $1.32 for part of every
 * working day. The second cheapest model in that score band is MiniMax M3 at
 * $1.20, which is why the floor is not purely an artifact of one vendor's
 * off-peak discount. The ceiling is Claude Fable 5 at 95.0% for $50.00, the tier's
 * only occupant.
 *
 * Do not read a single ratio off these two points. The corpus reports three, and
 * quoting any one alone misstates what moved. Holding the ceiling tier fixed at
 * 88.6% and $25.00 in both periods, the ratio to the cheapest model within a
 * point of 80% widened from about 29x in June to about 38x in August, as the
 * floor fell from $0.87. Counting the new 95.0% tier gives about 76x — the more
 * quotable figure and the less informative one, since roughly half of the
 * widening it describes is a tier arriving rather than a shape changing. At
 * DeepSeek's peak rate both halve, to 19x and 38x. The pair below spans the
 * widest ratio.
 *
 * Two bounds on the ordering. SWE-bench Verified has 500 instances, so a single
 * reported score carries a binomial standard error near 1.8 points and the
 * models clustered at 80% are indistinguishable from one another; the
 * two-order-of-magnitude price spread across that cluster is not. And the June
 * floor of $0.87 could not be tied to any SKU confirmed generally available that
 * month, so it is retained in the prose above with no model attached to it.
 */
export const QUALITY_COST = {
  source:
    'Research doc 03 "The Production Possibility Frontier", section 4 — the shape of the cost-quality curve; doc 00 "LLM Token Economics: Consolidated Summary", section 3, finding 3',
  points: [
    { swePct: 79, usdPerMTok: 0.66 },
    { swePct: 95, usdPerMTok: 50 },
  ],
} as const;

// ------------------------------------------------------------------- Jevons

/**
 * Session token consumption against a single prompt.
 *
 * Note the unit: every multiplier compares a whole session to ONE PROMPT, not a
 * session to a session. The median chat session runs 13 rounds of back-and-forth,
 * so the session-to-session comparison is roughly an order of magnitude smaller
 * than the top of this ladder suggests, and the measured aggregate across all
 * traffic on the largest observable platform is 5x.
 *
 * `mult` is the centre of a range the corpus gives as a range — the top row is
 * 2,000-5,000x — and `tokens` is a central estimate rather than an interval.
 * Measured run-to-run variance on an identical, fully specified agentic task is
 * up to 30x, which is wider than any range in this table, so anything derived
 * from these numbers should carry the variance rather than the range.
 *
 * The revenue reading of this ladder is much weaker than the volume reading, and
 * the two are not interchangeable. More than 85% of agentic tokens are cache
 * reads billed at roughly a tenth of standard input, so the 5x aggregate token
 * multiplier corresponds to about a 1.2x revenue multiplier — 5 x (0.15 + 0.85 x
 * 0.10) — rising to perhaps 2.2x if human traffic caches at the rate its session
 * structure implies. Volume and spend have decoupled.
 */
export const AGENT_MULTIPLIER = {
  source: 'Research doc 06 "Jevons Paradox and the Token Demand Spiral", section 4 — from chat to agent to swarm',
  points: [
    { pattern: 'Single prompt', tokens: '1K–3K', mult: 1 },
    { pattern: '5-step agent loop', tokens: '10K–15K', mult: 5 },
    { pattern: '50-step agentic session', tokens: '300K–1M', mult: 300 },
    { pattern: '200-step autonomous debug', tokens: '1M–3M', mult: 750 },
    { pattern: 'Multi-agent team session', tokens: '5M–15M', mult: 3_500 },
  ],
} as const;

/**
 * The Jevons argument's inputs, and the two findings that changed its footing.
 *
 * `statedVolumeGrowth` is now a MEASURED figure rather than a derived one, and
 * that is the substantive change. The derivation that used to stand behind
 * 400-600x — divide a revenue multiple by a price decline to back out volume —
 * is one the corpus explicitly declines to use: its numerator mixed two firms'
 * revenue with an enterprise-category spend figure over different years on
 * different bases, and its denominator is a per-token price that context
 * tiering, tokenizer changes and expiring promotional rates have made hard to
 * measure at all. In its place, Google discloses tokens processed at each I/O
 * keynote: 9.7 trillion per month in May 2024, roughly 480 trillion in May 2025,
 * and over 3.2 quadrillion in May 2026. That is 330x over 24 months, disclosed
 * rather than inferred. Three qualifications travel with it — composition is not
 * held fixed across a window in which image, video and audio tokens became a
 * large share; billed and unbilled volume are not separated, so it cannot be
 * multiplied by a price to give revenue; and the unit is the same unstable
 * token. What it measures most defensibly is throughput at one firm.
 *
 * `priceDropFraction` is the frontier flagship decline from the March 2023
 * anchor, $30.00 to $4.00 — the promotional rate, which expires 2026-11-21.
 * The 95% it used to hold was the retired derivation's price term.
 *
 * `revenueGrowthMin` and `revenueGrowthMax` bracket OpenAI's move from roughly
 * $1B in 2023 to somewhere between $24B and $40B annualized in August 2026. The
 * range is the corpus's own unresolved disagreement — about $40B on some
 * accounts, closer to $24B on a confirmed-monthly-revenue basis — not a band
 * imposed on a single figure. Annualized run rate is self-reported and unaudited.
 *
 * The elasticity now measured is what most changes the argument, and it cannot
 * be represented here without a new key. A published estimate puts the
 * short-run price elasticity of demand for LLM tokens JUST ABOVE ONE, which
 * clears the backfire threshold — but it is identified from price variation
 * across providers serving the same model, so it recovers a cross-host
 * substitution elasticity and bounds the market-level parameter a Jevons claim
 * is about from above. That parameter has never been estimated, and no point
 * estimate or standard error appears in the reachable version of the paper.
 * Applied to the observed price path, the price channel alone accounts for a
 * volume increase on the order of 7-8x against 330x observed. Capability, not
 * price, supplied most of the growth: the framing is descriptive rather than
 * causal. `enterpriseSpendGrowthPct` is the 3.2x year-over-year rise in
 * enterprise generative-AI spend into 2025, on a series running $1.7B in 2023 to
 * $37B in 2025.
 *
 * `perDeveloperGrowth` is retained because it is widely cited, not because it
 * can be relied on: the corpus traces it only to secondary commentary with no
 * named study, sample, or measurement window. A properly sourced figure makes
 * the same point better — Google's internal AI developer tooling went from 500
 * billion tokens per day in March 2026 to more than 3 trillion in May, a 6x rise
 * in two months against roughly fixed engineering headcount.
 *
 * The programming shares are OPENROUTER shares, and the qualifier is
 * load-bearing. Programming is over half of developer-marketplace token usage,
 * not of all LLM usage; technical help was just over 10% of ChatGPT work
 * messages in July 2025 against roughly 40% for writing.
 */
export const JEVONS = {
  source:
    'Research doc 06 "Jevons Paradox and the Token Demand Spiral", sections 3-5; doc 00 "LLM Token Economics: Consolidated Summary", finding 2',
  priceDropFraction: 0.8667,
  revenueGrowthMin: 24,
  revenueGrowthMax: 40,
  statedVolumeGrowth: '330×',
  enterpriseSpendGrowthPct: 220,
  programmingShareBefore: 11,
  programmingShareAfter: 50,
  perDeveloperGrowth: 18.6,
  uber: 'Uber gave roughly 5,000 engineers Claude Code in December 2025, exhausted its entire 2026 AI tools budget by April 2026 — four months into the fiscal year — and capped spending at $1,500 per employee per month. Its COO on returns: "That link is not there yet."',
  falsification: [
    'Total enterprise token spending declines year over year by 2028. Not met as of August 2026 — nothing at the aggregate level is declining, though the heaviest-spending firms recorded their first negative print in July 2026.',
    'Volume growth tracks capability benchmarks rather than price cuts — jumping with each model generation and flat between them. Substantially met as of August 2026 — the measured elasticity applied to the observed price path accounts for 7-8x of a 330x move.',
    'Agent token consumption peaks and falls as architectures stop re-sending full context on every turn. Not met as of August 2026, as written — tokens per task did not fall and agentic volume rose 14x between February and August.',
    'Added August 2026: if the rebound runs through endogenous re-architecture rather than a demand response at fixed architecture, the price-volume relationship should be near-flat within an architecture generation and step at each architecture change. Not yet assessable. A fifth condition — geopolitical bifurcation of the model supply chain — belongs in the set and cannot be scored from market-internal evidence at all.',
  ],
  newProductProblem:
    'Much of the growth came from capabilities that existed at no price before, which makes it closer to the automobile than to Watt improving the steam engine — descriptive of Jevons, but not caused by it. The price fall was necessary rather than sufficient: no amount of cheap GPT-3.5 would have produced an agent that could run a fifty-step coding loop, because the binding constraint was reliability rather than cost.',
  // Both indices are relative to the March 2023 anchor: price is the frontier
  // flagship at $4.00 against $30.00, revenue the midpoint of the range above.
  points: [{ label: 'measured divergence', priceIndex: 0.1333, revenueIndex: 32 }],
} as const;

// --------------------------------------------------------- grounding sections

/**
 * Both ends of the floor thesis are now confirmed rather than predicted.
 *
 * The cheapest token available anywhere is gpt-oss-120b on DeepInfra's Turbo SKU
 * at $0.02 per million blended — inside the budget band at its lower edge, and
 * reached by open weights on commodity hosting rather than by a lab flagship. At
 * the other end, eight models from five providers on two continents converged
 * inside the frontier band, which is three dollars wide. No European model is in
 * it: Mistral Large 3 sits below at $0.50, priced as a value play.
 */
export const COST_FLOOR = {
  source:
    'Research doc 01 "Tokens as a Scarce Resource", section 5 — floor dollar figures; doc 02 "The Cost Structure of a Token", section 9 — the physical framing',
  budgetFloorLow: 0.01,
  budgetFloorHigh: 0.03,
  frontierStableLow: 2,
  frontierStableHigh: 5,
  note: 'A token requires loading weights from memory, multiplying matrices, and writing results back. The floor is thermodynamic, not notional.',
} as const;

/**
 * `capex2026UsdBn` is GUIDANCE, and the label matters when it sits beside two
 * years of actuals: roughly $231B in 2024 and $361B in 2025, so 2026 is up about
 * 101% after a 56% rise. Guidance in this cycle has been revised up every
 * quarter, which biases that growth rate down. Microsoft reports fiscal years
 * and the other three calendar years, so the combined figure mixes bases.
 *
 * Every share figure here needs its date read with it, and none is current.
 * `anthropicEnterpriseApiSharePct` is the December 2025 survey, the most recent
 * that exists — no mid-2026 enterprise survey has been published, so any 2026
 * enterprise share number in circulation is not measured. Anthropic's share of
 * the enterprise CODING segment is higher, roughly 54% against OpenAI's 21%,
 * and coding is where token volumes per user are highest.
 * `chatgptConsumerSharePct` is Similarweb web-visit share for May 2026, down
 * about 25 points year over year against Gemini's 27.9%; the 74% that stood here
 * is an early-2026 figure this supersedes, and cuts of the same data disagree by
 * roughly 7 points depending on the denominator. `googleRoutingSharePct` could
 * not be re-sourced for 2026 at all — the aggregators reporting 2026 routing
 * shares contradict each other — so it is a 2025 figure and should not be
 * presented as current.
 *
 * The lock-in pair is the weakest evidence in this file and only its direction
 * should be used. Both figures come from a vendor-run survey with no published
 * sampling frame, recruitment method, or question wording, and it asks about
 * cloud and end-user computing generally rather than AI specifically. A 94%
 * agreement rate on a concern item is close to what any agreeable question
 * elicits. The gap between 94% concerned and 6% able to switch is the moat, and
 * those two numbers are the least reliable in the set.
 *
 * `openWeightLagMonths` is the early-2026 figure. Measured directly in August
 * 2026 the lag is shorter: three points on Artificial Analysis's Intelligence
 * Index separate the best proprietary model from the best open weights. But the
 * gap that actually constrains proprietary pricing is the roughly ten points to
 * the best open-weight model a large buyer can deploy without negotiating a
 * license, and for a buyer who cannot deploy Chinese-origin weights at all it is
 * thirty-nine points — no credible substitution threat, and no effective floor.
 *
 * `hostingSpreadForIdenticalWeights` is doc 01 §5's direct measurement across
 * three open-weight models: 19.5x on gpt-oss-120b across seventeen providers,
 * 12x on Llama 3.3 70B across six, and 1.6x on DeepSeek V4 Pro across three. The
 * range is the spread across three models, not a confidence interval on one, and
 * it compresses toward 2x on newer models with fewer hosts. That pattern runs
 * backwards from what live price competition would predict, which points at
 * stale unrepriced SKUs at premium providers rather than at rivalry.
 */
export const SUPPLY_SIDE = {
  source:
    'Research doc 07 "Supply-Side Economics of the Token Market", sections 2, 4, 7; doc 01 "Tokens as a Scarce Resource", section 5 — hosting spread',
  capex2026UsdBn: 725,
  anthropicEnterpriseApiSharePct: 40,
  chatgptConsumerSharePct: 53.9,
  googleRoutingSharePct: 43,
  lockInConcernedPct: 94,
  couldSwitchPct: 6,
  openWeightLagMonths: '6–12 months',
  hostingSpreadForIdenticalWeights: '10–20×',
} as const;

// ------------------------------------------------------------------- derived

/**
 * Volume growth implied by a price drop and a revenue multiple.
 *
 * Revenue is price times quantity, so quantity is revenue divided by the price
 * ratio. Computed rather than asserted so the post cannot quote a figure the
 * inputs disagree with.
 *
 * What this is NOT is a measurement of volume. The corpus declines to use this
 * arithmetic for that purpose — dividing incommensurable aggregates by each
 * other does not produce an estimate — and reports a disclosed volume series
 * instead, at `JEVONS.statedVolumeGrowth`. Read the output of this function as
 * what the two inputs jointly imply, and the disclosed figure as what happened.
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
 *
 * IMPLIED, not measured, and the distinction now matters because a measurement
 * exists. The one published estimate for LLM tokens sits just above one in
 * absolute value, and it bounds the market-level parameter from above rather
 * than estimating it. Any figure this function returns further from zero than
 * that is attributing to price a volume move the measurement says price did not
 * produce.
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
 *
 * Two of these need their scope stated wherever the post uses them, because the
 * bare number is ambiguous in a way that misleads. `tokenAnnualDecline` is the
 * FRONTIER FLAGSHIP rate; the cheapest capable tier fell at roughly 85% per
 * year over the same window, and one figure cannot stand for both. And the ratio
 * between `sweCheap` and `sweDear` is the widest observable one — holding the
 * ceiling tier fixed instead gives about 38x, and half the difference is a tier
 * arriving rather than a shape changing.
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
