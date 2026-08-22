/**
 * The site's paper-and-ink palette, expressed as an OpenChart theme.
 *
 * OpenChart resolves mark and chrome colors inside the compiler, in JS — a CSS
 * variable would reach the DOM chrome but never the compiled SVG, so the
 * palette has to be stated here as literal light/dark pairs rather than as
 * `var(--ink)`. `src/styles/openchart.css` separately maps the `--oc-*` DOM
 * tokens onto the same values, so the two halves of a chart (compiled SVG,
 * CSS-styled chrome) agree in both themes.
 *
 * Every value below is copied from `design/palette.md` or derived from it. When
 * that document changes, this file changes with it.
 */
import type { ThemeConfig } from '@opendata-ai/openchart-core';

/**
 * Series colors, ordered so the first three are the ones that co-occur most.
 *
 * All five clear 4.2:1 against both page grounds (`well`) and both card tones,
 * measured, so a mark never falls below the threshold the axis labels sit at.
 * They are separated by hue rather than by lightness, which is the weak spot:
 * crimson and teal sit within 1% of each other in luminance, so a chart that
 * puts those two side by side must carry a second cue — `fillPattern: 'auto'`
 * on filled marks, a dashed `seriesStyles` entry on lines — and not lean on
 * color alone.
 */
export const SERIES = {
  crimson: { light: '#c01023', dark: '#ff4757' },
  indigo: { light: '#3b4a8f', dark: '#8e9ce8' },
  ochre: { light: '#9a6410', dark: '#e0a03c' },
  teal: { light: '#0f6b6e', dark: '#42c9c2' },
  moss: { light: '#55682c', dark: '#a6bd5e' },
} as const;

export type SeriesName = keyof typeof SERIES;

/** Resolve one series color for a mode, for the rare spot that needs a literal. */
export function seriesColor(name: SeriesName, mode: 'light' | 'dark'): string {
  return SERIES[name][mode];
}

/**
 * The neutral used for "everything that is not the protagonist".
 *
 * Deliberately `--chart-mark` and not `--rule`: a divider hairline is too faint
 * to read as a plotted series, which is the failure `global.css` records having
 * hit on the cinemetrics charts.
 */
export const MUTED_MARK = { light: '#8e8b82', dark: '#78746a' } as const;

export const chartTheme: ThemeConfig = {
  colors: {
    categorical: Object.values(SERIES).map((c) => c.light),
    background: { light: '#fdfdfb', dark: '#1c1b17' },
    text: { light: '#3d3c38', dark: '#b6b3a9' },
    gridline: { light: '#b3b1a6', dark: '#3a3833' },
    axis: { light: '#7c7a71', dark: '#726e66' },
    annotationText: { light: '#0b0b0b', dark: '#f2f0ea' },
    annotationFill: { light: '#f7f6f3', dark: '#171613' },
    positive: SERIES.teal,
    negative: SERIES.crimson,
  },
  fonts: {
    family: '"Geist", ui-sans-serif, system-ui, sans-serif',
    mono: '"Space Mono", ui-monospace, monospace',
  },
};

/**
 * The dark-mode categorical palette, swapped in at mount time.
 *
 * `ThemeConfig.colors.categorical` takes a flat `string[]` with no light/dark
 * pair, unlike the semantic slots above it, so the only way to move the series
 * colors across themes is to hand the compiler a different array. The mount
 * helper calls this whenever `html.dark` flips.
 */
export function themeForMode(mode: 'light' | 'dark'): ThemeConfig {
  return {
    ...chartTheme,
    colors: {
      ...(chartTheme.colors as object),
      categorical: Object.values(SERIES).map((c) => c[mode]),
    },
  };
}
