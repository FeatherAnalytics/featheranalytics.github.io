# Paper & Ink — Color Palette

This palette is shared with the [cinemetrics](https://featheranalytics.dev/cinemetrics/) project so the two read as one site. Neutral warm surfaces carry the structure, and a single crimson accent carries emphasis.

Tokens are defined once in `src/styles/global.css` as CSS custom properties on `:root`, and are overridden under `html.dark`. Because the values flip rather than living in two parallel token sets, components name a single color (`bg-card`, `text-ink`) and need no `dark:` variants.

## Light Mode

### Surfaces
| Token | Hex | Usage |
|-------|-----|-------|
| `well` | `#eeece4` | Page ground |
| `paper` | `#f7f6f3` | Nav and footer band, chips and badges |
| `card` | `#fdfdfb` | Raised content blocks — project cards, post cards |
| `code-bg` | `#eae7dd` | Inline code and fenced blocks |

### Ink
| Token | Hex | Usage |
|-------|-----|-------|
| `ink` | `#0b0b0b` | Headings, emphasized text |
| `ink-body` | `#3d3c38` | Paragraphs, descriptions |
| `ink-muted` | `#67655f` | Meta lines, captions, inactive nav |

### Accent & Structure
| Token | Hex | Usage |
|-------|-----|-------|
| `accent` | `#c01023` | Links, active nav, card hover border |
| `accent-hover` | `#8f0c1a` | Link hover |
| `rule` | `#d3cfc1` | Borders, dividers, table rules |
| `selection` | `#f3d6da` | Text selection |

## Dark Mode

### Surfaces
| Token | Hex | Usage |
|-------|-----|-------|
| `well` | `#131210` | Page ground |
| `paper` | `#171613` | Nav and footer band, chips and badges |
| `card` | `#1c1b17` | Raised content blocks |
| `code-bg` | `#21201b` | Inline code and fenced blocks |

### Ink
| Token | Hex | Usage |
|-------|-----|-------|
| `ink` | `#f2f0ea` | Headings, emphasized text |
| `ink-body` | `#b6b3a9` | Paragraphs, descriptions |
| `ink-muted` | `#8d8a80` | Meta lines, captions, inactive nav |

### Accent & Structure
| Token | Hex | Usage |
|-------|-----|-------|
| `accent` | `#ff4757` | Links, active nav, card hover border |
| `accent-hover` | `#ff7a85` | Link hover |
| `rule` | `#35322c` | Borders, dividers, table rules |
| `selection` | `#5c1620` | Text selection |

## Typography

| Role | Family | Usage |
|------|--------|-------|
| Sans | Geist | Body text, UI |
| Display | Bricolage Grotesque | `h1`–`h3`, site title, card titles |
| Mono | Space Mono | Code, and the `.eyebrow` microlabel (10px, uppercase, `0.12em` tracking) used for section headers, tags, dates, and badges |

All three are self-hosted from `public/fonts` as latin-subset WOFF2. Geist is preloaded in `Base.astro` because it carries the body text.

## Design Principles

- **Depth comes from three surface tones.** The `well` → `paper` → `card` progression gives a page structure without spending any saturation on it, so shadows are unnecessary.
- **One accent, spent sparingly.** Crimson marks links, active state, and hover. Everything else is ink on paper.
- **Dark mode lifts lightness, not hue.** `#c01023` falls below 3:1 against a near-black ground, so the accent brightens to `#ff4757` while keeping its identity.
- **Warm neutrals throughout.** Warm-tinted surfaces and ink are what make the crimson read as a deliberate accent instead of an alert.
- **WCAG AA on every text pair.** All three ink tones clear 4.5:1 against all four surfaces in both modes. The lowest is `ink-muted` on `code-bg` at 4.71 (light) and 4.72 (dark).

## Validation

I checked all pairs before adopting the palette: three ink tones plus both accent states, against all four surfaces, in both modes. `rule` is deliberately low-contrast — it is a hairline divider, not a component boundary that conveys state, so WCAG 1.4.11 does not apply to it.
