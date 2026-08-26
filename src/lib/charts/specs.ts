/**
 * The post's charts, as OpenChart specs derived from `src/data/tokenomics.ts`.
 *
 * Nothing here types a number. Every value is read from the data module, so a
 * correction to a rate card moves the chart, the prose that interpolates
 * `FIGURES`, and the accessible table underneath it in one edit. That property
 * is the whole reason the data module exists and it is worth more than the
 * brevity of writing the arrays out inline.
 *
 * Two honesty constraints carry over from the data module's own comments and
 * must survive any edit here:
 *
 *   1. `MODEL_TIERS.tier` is the provider's own budget/mid/frontier ranking. It
 *      is ORDINAL and it is not a quality score. It is plotted against named
 *      bands with no numeric ticks; giving it a quantitative axis would invent
 *      a measurement the corpus does not contain.
 *   2. `contextK: null` on Ministral 3B means no document states a window. It
 *      renders as "not stated", never as a zero and never as a guess.
 */
import type { ChartSpec, LayerSpec } from '@opendata-ai/openchart-core';
import {
  AGENT_MULTIPLIER,
  DECLINE_COMPARISON,
  DEGRADATION,
  JEVONS,
  MODEL_TIERS,
  PRICE_DECLINE,
  QUALITY_COST,
  UTILIZATION,
  WINDOW_TIMELINE,
  FIGURES,
} from '../../data/tokenomics';

/** Provider tier ranking, as the band names the y-axis actually shows. */
const TIER_BANDS = ['Budget', 'Mid', 'Frontier'] as const;

/**
 * A story step as the Astro component takes it: a rail label plus the patch.
 *
 * Mirrors `StoryStep` from the vanilla story bundle with `label` added. It is
 * restated rather than imported so this module stays free of a browser-only
 * import — it is evaluated during the Astro build, where `@opendata-ai/
 * openchart-vanilla/story` reaches for `window` at module scope.
 */
export interface StoryStep {
  label: string;
  spec?: Record<string, unknown>;
  highlight?: string[] | null;
  camera?: Record<string, unknown> | null;
}

export interface Story {
  spec: ChartSpec | LayerSpec;
  steps: StoryStep[];
  label: string;
  alt: string;
  caption: string;
  source: string;
}

/** Entrance animation off, update transitions on: a step that lands mid-entrance snaps. */
const STORY_ANIMATION = { enter: false } as const;

// ---------------------------------------------------------------- 1. the PPF

const ppfRows = MODEL_TIERS.points.map((m) => ({
  model: m.model,
  provider: m.provider,
  price: m.usdIn,
  tier: TIER_BANDS[m.tier - 1],
  window: m.contextK === null ? 'not stated' : `${m.contextK}K`,
}));

export const ppfStory: Story = {
  label: 'Producer tradeoff between price and provider-assigned tier',
  alt:
    `Five June 2026 models plotted by input price against their provider's own budget, mid, and frontier ranking. ` +
    `Price spans ${FIGURES.cheapestTier} to ${FIGURES.dearestTier} per million tokens across the five, and the ranking does not ` +
    `move with price in the simple way it once did: Google's frontier model is priced below Anthropic's mid-tier one. ` +
    `Separately, the SWE-bench cost anchors show the last fifteen points of measured coding accuracy costing ` +
    `${FIGURES.sweCheap} to ${FIGURES.sweDear} per million tokens — a fiftyfold jump for a fifteen-point gain.`,
  caption:
    'X axis: June 2026 input price per million tokens, measured, log scale. Y axis: each provider’s own budget / mid / frontier ranking — an ordinal label, not a quality score, because no per-model quality metric exists in the corpus.',
  source: MODEL_TIERS.source,
  spec: {
    mark: { type: 'point', filled: true, size: 8 },
    data: ppfRows,
    animation: STORY_ANIMATION,
    encoding: {
      x: {
        field: 'price',
        type: 'quantitative',
        scale: { type: 'log', domain: [0.02, 10], nice: false },
        axis: { title: 'Input price ($ per million tokens)', format: '$,.2f' },
      },
      y: {
        field: 'tier',
        type: 'ordinal',
        scale: { domain: [...TIER_BANDS] },
        axis: { title: 'Provider’s own tier' },
      },
      color: { field: 'provider', type: 'nominal' },
      tooltip: [
        { field: 'model', type: 'nominal', title: 'Model' },
        { field: 'provider', type: 'nominal', title: 'Provider' },
        { field: 'price', type: 'quantitative', title: '$ / M tokens', format: '$,.2f' },
        { field: 'window', type: 'nominal', title: 'Context window' },
      ],
    },
    chrome: {
      eyebrow: 'Producer tradeoff',
      title: 'Price no longer tracks tier',
      subtitle: 'June 2026 rate cards, five models, log price scale',
    },
  },
  steps: [
    {
      label: 'Five models, priced across two orders of magnitude',
    },
    {
      label: 'The budget tier',
      highlight: ['Mistral', 'Anthropic'],
      camera: { x: [0.02, 10] },
    },
    {
      label: 'Google prices a frontier model below Anthropic’s mid tier',
      highlight: ['Google'],
      spec: {
        annotations: [
          {
            type: 'text',
            x: MODEL_TIERS.points.find((m) => m.provider === 'Google')!.usdIn,
            y: 'Frontier',
            text: `Gemini 3.1 Pro sits at **$${MODEL_TIERS.points.find((m) => m.provider === 'Google')!.usdIn.toFixed(2)}**`,
            subtitle: 'a frontier tier priced under a mid tier',
            anchor: 'top',
            offset: { dy: -46 },
            connector: 'curve',
            responsive: false,
          },
        ],
      },
    },
    {
      label: 'What the last fifteen accuracy points cost',
      highlight: [],
      spec: {
        annotations: [
          {
            type: 'range',
            axis: 'x',
            from: QUALITY_COST.points[0].usdPerMTok,
            to: QUALITY_COST.points[1].usdPerMTok,
            label: `${QUALITY_COST.points[0].swePct}% → ${QUALITY_COST.points[1].swePct}% SWE-bench: ${FIGURES.sweCheap} → ${FIGURES.sweDear}`,
            responsive: false,
          },
        ],
      },
    },
  ],
};

// -------------------------------------------------- 2. window x quality

/**
 * Offered window and typical usage on one log token axis.
 *
 * Both series are in tokens, so they share a scale honestly and the gap between
 * them is the finding rather than an artifact of two axes chosen to make a
 * point. `UTILIZATION` states one usage figure repeated across three window
 * sizes, so the usage series is drawn flat at that value across the span the
 * corpus covers — from the first window at or above the smallest measured one.
 */
const usageTokens = UTILIZATION.points[0].used;
const windowRows = [
  ...WINDOW_TIMELINE.points.map((p) => ({
    date: p.date,
    tokens: p.tokens,
    series: 'Window offered',
    model: p.model,
  })),
  ...WINDOW_TIMELINE.points.map((p) => ({
    date: p.date,
    tokens: usageTokens,
    series: 'Tokens actually used',
    model: p.model,
  })),
];

export const windowStory: Story = {
  label: 'Context window offered against tokens actually used',
  alt:
    `Context windows grew ${FIGURES.windowGrowthFactor} between 2020 and June 2026, from 2,000 tokens to 2 million, ` +
    `on a log scale. Typical usage stayed flat at about ${FIGURES.typicalUsage} tokens across every window size the ` +
    `corpus measures, so utilization of the largest window falls to ${FIGURES.lowestUtilization}. Separately, measured ` +
    `accuracy retention drops ${FIGURES.degradationDrop} between 10,000 and 100,000 tokens, meaning the unused capacity ` +
    `is not simply idle headroom — the part of it that does get used costs accuracy.`,
  caption:
    'Both series are token counts on one log scale. Window sizes are the generally available figures each provider advertised; usage is the corpus’s single stated average, held flat across the span because it is reported as roughly constant regardless of the window offered.',
  source: `${WINDOW_TIMELINE.source}; ${UTILIZATION.source}`,
  spec: {
    mark: { type: 'line', interpolate: 'monotone', strokeWidth: 2.5, point: true },
    data: windowRows,
    animation: STORY_ANIMATION,
    encoding: {
      x: { field: 'date', type: 'temporal', axis: { title: '', format: '%Y' } },
      y: {
        field: 'tokens',
        type: 'quantitative',
        scale: { type: 'log', domain: [1_000, 2_000_000], nice: false },
        axis: { title: 'Tokens', format: '~s' },
      },
      color: { field: 'series', type: 'nominal' },
      tooltip: [
        { field: 'model', type: 'nominal', title: 'Model' },
        { field: 'series', type: 'nominal', title: 'Series' },
        { field: 'tokens', type: 'quantitative', title: 'Tokens', format: ',.0f' },
      ],
    },
    chrome: {
      eyebrow: 'Window × quality',
      title: `Windows grew ${FIGURES.windowGrowthFactor}. Usage did not.`,
      subtitle: 'Advertised context window against typical usage, log scale',
    },
    // The usage series is the flat reference the window series is measured
    // against, so it reads as a rule rather than a competing trend.
    seriesStyles: {
      'Tokens actually used': { lineStyle: 'dashed', opacity: 0.85 },
    },
  },
  steps: [
    { label: 'Windows from 2,048 tokens to a million', highlight: ['Window offered'] },
    {
      label: 'The 2023–2024 jump',
      camera: { x: ['2022-11', '2024-06'] },
    },
    { label: 'What a reader actually sends', highlight: [], camera: null },
    {
      label: `Utilization falls to ${FIGURES.lowestUtilization}`,
      spec: {
        annotations: [
          {
            type: 'text',
            x: WINDOW_TIMELINE.points.at(-1)!.date,
            y: usageTokens,
            text: `About ${FIGURES.typicalUsage} tokens used against a ${(WINDOW_TIMELINE.points.at(-1)!.tokens / 1_000_000).toFixed(0)}M window`,
            subtitle: `${FIGURES.lowestUtilization} of what is offered`,
            anchor: 'bottom',
            offset: { dy: 44, dx: -70 },
            connector: 'curve',
            responsive: false,
          },
        ],
      },
    },
    {
      label: `Accuracy falls ${FIGURES.degradationDrop} across the window`,
      spec: {
        annotations: [
          {
            type: 'range',
            axis: 'y',
            from: DEGRADATION.points[0].tokens,
            to: DEGRADATION.points[1].tokens,
            label: `Measured accuracy drop ${FIGURES.degradationDrop} across this band`,
            responsive: false,
          },
        ],
      },
    },
  ],
};

// ------------------------------------------------------- 3. budget constraint

const declineRows = DECLINE_COMPARISON.points.map((p) => ({
  resource: p.name,
  annual: p.annualPct,
  range: p.range,
  span: p.years,
}));

export const budgetStory: Story = {
  label: 'Token price decline against other metered resources',
  alt:
    `Annual price decline for five metered resources. LLM tokens fall ${FIGURES.tokenAnnualDecline} a year, against ` +
    `${FIGURES.mooreAnnualDecline} for transistors under Moore's Law, about 30% for internet bandwidth, about 15% for ` +
    `object storage, and about 8% for cloud compute. The token figure is measured over roughly three years, far too ` +
    `short a span to compare directly with the multi-decade series beside it.`,
  caption:
    'Bars are stated annual decline rates, ordered by size. The spans differ by an order of magnitude — roughly three years for tokens against roughly fifty for transistors — so this ranks the rates, it does not claim tokens will hold that rate for fifty years.',
  source: DECLINE_COMPARISON.source,
  spec: {
    mark: { type: 'bar', orient: 'horizontal', cornerRadius: 2 },
    data: declineRows,
    animation: STORY_ANIMATION,
    encoding: {
      x: {
        field: 'annual',
        type: 'quantitative',
        axis: { title: 'Annual price decline', format: '.0f%' },
      },
      y: {
        field: 'resource',
        type: 'nominal',
        sort: { field: 'annual', order: 'descending' },
        axis: { title: '' },
      },
      color: { field: 'resource', type: 'nominal' },
      tooltip: [
        { field: 'resource', type: 'nominal', title: 'Resource' },
        { field: 'range', type: 'nominal', title: 'Stated range' },
        { field: 'span', type: 'nominal', title: 'Measured over' },
      ],
    },
    legend: { show: false },
    labels: { density: 'all', format: '.0f%' },
    chrome: {
      eyebrow: 'Budget constraint',
      title: 'Nothing else metered falls this fast',
      subtitle: 'Annual price decline, five metered resources',
    },
  },
  steps: [
    { label: 'Five metered resources, ranked by annual decline' },
    {
      label: `Moore's Law as the reference at ${FIGURES.mooreAnnualDecline}`,
      highlight: [DECLINE_COMPARISON.points[0].name],
    },
    {
      label: `Tokens fall ${FIGURES.tokenAnnualDecline} a year`,
      highlight: [DECLINE_COMPARISON.points.at(-1)!.name],
    },
    {
      label: 'The span is three years, not fifty',
      highlight: [],
      spec: {
        annotations: [
          {
            type: 'text',
            x: DECLINE_COMPARISON.points.at(-1)!.annualPct,
            y: DECLINE_COMPARISON.points.at(-1)!.name,
            text: `Measured over ${DECLINE_COMPARISON.points.at(-1)!.years}`,
            subtitle: `against ${DECLINE_COMPARISON.points[0].years} for transistors`,
            anchor: 'left',
            offset: { dx: -30, dy: -34 },
            connector: 'curve',
            responsive: false,
          },
        ],
      },
    },
  ],
};

// ------------------------------------------------------------- 4. Jevons

/**
 * Price index against the revenue index the corpus reports.
 *
 * Price is indexed to 1.0 at the first measured point so the two series share
 * one log axis. Revenue is drawn as the two endpoints the corpus actually
 * states — a start at 1.0 and the measured multiple — rather than a fabricated
 * path between them, because no intermediate revenue figures exist in the
 * corpus and drawing a smooth curve through them would invent a trajectory.
 */
const basePrice = PRICE_DECLINE.points[0].usd;
const revenueMid = (JEVONS.revenueGrowthMin + JEVONS.revenueGrowthMax) / 2;

const jevonsRows = [
  ...PRICE_DECLINE.points.map((p) => ({
    date: p.date,
    index: p.usd / basePrice,
    series: 'Price index',
    label: p.label,
    precision: p.datePrecision,
  })),
  {
    date: PRICE_DECLINE.points[0].date,
    index: 1,
    series: 'Revenue index',
    label: 'indexed start',
    precision: 'stated',
  },
  {
    date: PRICE_DECLINE.points.at(-1)!.date,
    index: revenueMid,
    series: 'Revenue index',
    label: `${FIGURES.revenueGrowth} revenue`,
    precision: 'stated',
  },
];

export const jevonsStory: Story = {
  label: 'Price index and revenue index diverging',
  alt:
    `Indexed to the first measured point, the cheapest price for GPT-4-class capability fell ${FIGURES.priceDrop} ` +
    `between March 2023 and June 2026 — ${FIGURES.startPrice} to ${FIGURES.endPrice}, a ${FIGURES.deflationFactor} ` +
    `decline — while revenue over the same span grew ${FIGURES.revenueGrowth}. The two lines diverge rather than ` +
    `converge, which implies a price elasticity of about ${FIGURES.impliedElasticity}: elastic enough that each price ` +
    `cut raised total spending instead of lowering it.`,
  caption:
    'Both series are indexed to 1.0 at March 2023 and share one log axis. The revenue series is drawn as its two stated endpoints only; the corpus reports no figures in between, so no path is claimed between them. Two price points carry an inferred rather than a stated month.',
  source: `${PRICE_DECLINE.source}; ${JEVONS.source}`,
  spec: {
    mark: { type: 'line', interpolate: 'monotone', strokeWidth: 2.5, point: true },
    data: jevonsRows,
    animation: STORY_ANIMATION,
    encoding: {
      x: { field: 'date', type: 'temporal', axis: { title: '', format: '%Y' } },
      y: {
        field: 'index',
        type: 'quantitative',
        scale: { type: 'log', domain: [0.001, 40], nice: false },
        axis: { title: 'Indexed to March 2023 = 1', format: '~g' },
      },
      color: { field: 'series', type: 'nominal' },
      tooltip: [
        { field: 'label', type: 'nominal', title: 'Point' },
        { field: 'series', type: 'nominal', title: 'Series' },
        { field: 'index', type: 'quantitative', title: 'Index', format: '.3~f' },
        { field: 'precision', type: 'nominal', title: 'Date' },
      ],
    },
    chrome: {
      eyebrow: 'Jevons paradox',
      title: `Price fell ${FIGURES.priceDrop}. Revenue grew ${FIGURES.revenueGrowth}.`,
      subtitle: 'Both indexed to March 2023, log scale',
    },
    seriesStyles: {
      'Revenue index': { lineStyle: 'dashed' },
    },
  },
  steps: [
    {
      label: `Price falls ${FIGURES.startPrice} to ${FIGURES.endPrice}`,
      highlight: ['Price index'],
    },
    {
      label: 'Revenue over the same span',
      highlight: [],
    },
    {
      label: `The divergence implies elasticity of ${FIGURES.impliedElasticity}`,
      spec: {
        annotations: [
          {
            type: 'text',
            x: PRICE_DECLINE.points.at(-1)!.date,
            y: revenueMid,
            text: `Revenue **${FIGURES.revenueGrowth}** while price fell **${FIGURES.priceDrop}**`,
            subtitle: `implied elasticity ${FIGURES.impliedElasticity} — below −1, so cuts raise spending`,
            anchor: 'left',
            offset: { dx: -40, dy: 10 },
            connector: 'curve',
            responsive: false,
          },
        ],
      },
    },
    {
      label: `Agent loops multiply consumption up to ${FIGURES.agentTopMultiplier}`,
      spec: {
        annotations: [
          {
            type: 'refline',
            axis: 'y',
            value: 1,
            label: 'index = 1 (March 2023)',
            responsive: false,
          },
        ],
      },
    },
    {
      label: 'What would falsify this',
      highlight: [],
    },
  ],
};

/**
 * The agent-consumption ladder, as a standalone figure.
 *
 * Split out of the Jevons story rather than layered into it: the multiplier is
 * a per-session count with no date, so it shares neither axis with the indexed
 * time series and could only join it as a second chart wearing the first one's
 * frame.
 */
export const agentLadder: { spec: ChartSpec; alt: string; caption: string; source: string } = {
  spec: {
    mark: { type: 'bar', orient: 'horizontal', cornerRadius: 2 },
    data: AGENT_MULTIPLIER.points.map((p) => ({
      pattern: p.pattern,
      mult: p.mult,
      tokens: p.tokens,
    })),
    encoding: {
      x: {
        field: 'mult',
        type: 'quantitative',
        scale: { type: 'log', domain: [1, 5_000], nice: false },
        axis: { title: 'Tokens per session, relative to a single prompt', format: '~s' },
      },
      y: { field: 'pattern', type: 'nominal', sort: { field: 'mult', order: 'ascending' }, axis: { title: '' } },
      tooltip: [
        { field: 'pattern', type: 'nominal', title: 'Pattern' },
        { field: 'tokens', type: 'nominal', title: 'Tokens' },
        { field: 'mult', type: 'quantitative', title: 'Multiplier', format: ',.0f' },
      ],
    },
    labels: { density: 'all', format: ',.0f', suffix: '×' },
    chrome: {
      eyebrow: 'Induced demand',
      title: `One session can cost ${FIGURES.agentTopMultiplier} a single prompt`,
      subtitle: 'Tokens per session by interaction pattern, log scale',
    },
  },
  alt:
    `Tokens consumed per session rise from a single prompt at 1× to a multi-agent team session at ` +
    `${FIGURES.agentTopMultiplier}, on a log scale. The steps in between are a five-step agent loop at 5×, a ` +
    `fifty-step agentic session at 125×, and a two-hundred-step autonomous debug at 750×. Nothing about the ` +
    `underlying price changed across these rows — only how many times the model is called.`,
  caption:
    'Multipliers are relative to a single prompt, on a log scale. Each row is a stated token range in the source table; the multiplier is that range’s midpoint against the single-prompt row.',
  source: AGENT_MULTIPLIER.source,
};
