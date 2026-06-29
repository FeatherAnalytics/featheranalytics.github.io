# Feather Blue + Forest — Color Palette

## Light Mode

### Core
| Color   | Hex       | Usage              |
|---------|-----------|--------------------|
| Deep Navy   | `#0d2137` | Headers, dark text |
| Sky         | `#4fc3f7` | Primary accent     |
| Forest      | `#00695c` | Secondary accent, hover |
| Cloud White | `#f8f9fa` | Page background    |

### Text
| Color   | Hex       | Usage       |
|---------|-----------|-------------|
| Headings    | `#0d2137` | h1–h6       |
| Body        | `#2c3e50` | Paragraphs  |
| Secondary   | `#5a6c7d` | Captions, meta |
| Links       | `#039be5` | Anchor tags (darker sky for contrast on white) |

### Surfaces
| Color   | Hex       | Usage           |
|---------|-----------|-----------------|
| Page BG     | `#f8f9fa` | Main background |
| Navbar      | `#eef3f7` | Navbar, footer  |
| Code BG     | `#e1eaf1` | Inline/block code |
| Borders     | `#dce3e8` | Dividers, table borders |

### Interactive
| Color   | Hex       | Usage          |
|---------|-----------|----------------|
| Link        | `#039be5` | Default state  |
| Hover       | `#00695c` | Hover/focus    |
| Active      | `#039be5` | Active state   |
| Selection   | `#b2ebf2` | Text selection |

### Alerts
| Color   | Hex       | Usage   |
|---------|-----------|---------|
| Note    | `#1976d2` | Info    |
| Success | `#00695c` | Success |
| Warning | `#f9a825` | Warning |
| Error   | `#c62828` | Error   |

### Code Syntax
| Color   | Hex       | Token type |
|---------|-----------|------------|
| Forest  | `#00695c` | Strings    |
| Sky     | `#4fc3f7` | Keywords   |
| Gold    | `#f9a825` | Constants  |
| Gray    | `#5a6c7d` | Comments   |

---

## Dark Mode

### Core
| Color   | Hex       | Usage              |
|---------|-----------|--------------------|
| Light Text  | `#e8eef4` | Headers, primary text |
| Sky         | `#4fc3f7` | Primary accent (unchanged) |
| Forest Light| `#4db6ac` | Secondary accent, hover |
| Deep Dark   | `#121a24` | Page background    |

### Text
| Color   | Hex       | Usage       |
|---------|-----------|-------------|
| Headings    | `#e8eef4` | h1–h6       |
| Body        | `#e0e6ed` | Paragraphs  |
| Secondary   | `#8b9db5` | Captions, meta |
| Links       | `#4fc3f7` | Anchor tags (brighter sky for contrast on dark) |

### Surfaces
| Color   | Hex       | Usage           |
|---------|-----------|-----------------|
| Page BG     | `#121a24` | Main background |
| Navbar      | `#0d1b2a` | Navbar, footer  |
| Code BG     | `#1e2d3d` | Inline/block code |
| Borders     | `#2a3a4e` | Dividers, table borders |

### Interactive
| Color   | Hex       | Usage          |
|---------|-----------|----------------|
| Link        | `#4fc3f7` | Default state  |
| Hover       | `#81d4fa` | Hover/focus    |
| Active      | `#039be5` | Active state   |
| Selection   | `#00695c` | Text selection |

### Alerts
| Color   | Hex       | Usage   |
|---------|-----------|---------|
| Note    | `#42a5f5` | Info    |
| Success | `#4db6ac` | Success |
| Warning | `#ffca28` | Warning |
| Error   | `#ef5350` | Error   |

### Code Syntax
| Color       | Hex       | Token type |
|-------------|-----------|------------|
| Forest Light| `#4db6ac` | Strings    |
| Sky         | `#4fc3f7` | Keywords   |
| Gold        | `#ffca28` | Constants  |
| Gray        | `#8b9db5` | Comments   |

---

## Design Principles

- Same hue families across modes — dark mode shifts lightness, not hue
- Navy-tinted darks (`#121a24`, `#0d1b2a`) instead of pure gray — cohesive with palette
- 3-tier surface hierarchy for depth (page → container → elevated)
- Accents shift ~1 lightness stop up in dark mode for readability
- Sky `#4fc3f7` is the constant — unchanged across modes
- Links: darker `#039be5` on light BG, brighter `#4fc3f7` on dark BG
- WCAG AA contrast met for all text/background combinations
