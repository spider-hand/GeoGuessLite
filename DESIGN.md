---
version: alpha
name: GeoGuessLite-design-system
description: A confident dark-mode interface system anchored on `on-primary` as the site base color, with darker support surfaces and a single high-contrast yellow accent carrying primary calls to action, key highlights, and emphasis moments. The system uses generic sans-serif typography with a preserved separation between editorial and numeric roles, flat color-block surfaces, compact spacing, and restrained radii for a dense but readable product experience.

colors:
  primary: "#fcd535"
  primary-active: "#f0b90b"
  primary-disabled: "#3a3a1f"
  ink: "#181a20"
  body: "#eaecef"
  muted: "#707a8a"
  muted-strong: "#929aa5"
  hairline: "#2b3139"
  border-strong: "#cdd1d6"
  canvas-dark: "#0b0e11"
  surface-card-dark: "#1e2329"
  surface-elevated-dark: "#2b3139"
  on-primary: "#181a20"
  on-dark: "#ffffff"
  success: "#0ecb81"
  danger: "#f6465d"
  info: "#3b82f6"
  info-ring: "#3b82f6"

typography:
  hero-display:
    fontFamily: 'Inter, "Segoe UI", Roboto, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: 64px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -1px
  display-lg:
    fontFamily: 'Inter, "Segoe UI", Roboto, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.5px
  display-md:
    fontFamily: 'Inter, "Segoe UI", Roboto, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.3px
  display-sm:
    fontFamily: 'Inter, "Segoe UI", Roboto, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0
  title-lg:
    fontFamily: 'Inter, "Segoe UI", Roboto, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0
  title-md:
    fontFamily: 'Inter, "Segoe UI", Roboto, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: 0
  title-sm:
    fontFamily: 'Inter, "Segoe UI", Roboto, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  number-display:
    fontFamily: 'Inter, "Segoe UI", Roboto, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.3px
  number-md:
    fontFamily: 'Inter, "Segoe UI", Roboto, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  number-sm:
    fontFamily: 'Inter, "Segoe UI", Roboto, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  body-md:
    fontFamily: 'Inter, "Segoe UI", Roboto, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: 'Inter, "Segoe UI", Roboto, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  caption:
    fontFamily: 'Inter, "Segoe UI", Roboto, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  button:
    fontFamily: 'Inter, "Segoe UI", Roboto, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 0
  nav-link:
    fontFamily: 'Inter, "Segoe UI", Roboto, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0

rounded:
  xs: 2px
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 80px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 12px 24px
    height: 40px
  button-primary-active:
    backgroundColor: "{colors.primary-active}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
  button-primary-disabled:
    backgroundColor: "{colors.primary-disabled}"
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
  button-primary-pill:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 14px 32px
  button-secondary:
    backgroundColor: "{colors.surface-card-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 12px 24px
  button-tertiary-text:
    backgroundColor: transparent
    textColor: "{colors.body}"
    typography: "{typography.button}"
  button-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 8px 20px
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 8px 20px
  button-compact:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 6px 16px
    height: 28px
  text-link:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
  top-nav:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.nav-link}"
    height: 64px
  hero-band:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.hero-display}"
    padding: 80px
  stat-callout-card:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    typography: "{typography.number-display}"
  badge-card:
    backgroundColor: "{colors.surface-card-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.title-sm}"
    rounded: "{rounded.lg}"
    padding: 16px 20px
  data-table-card:
    backgroundColor: "{colors.surface-card-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: 24px
  data-row:
    backgroundColor: transparent
    textColor: "{colors.on-dark}"
    typography: "{typography.number-md}"
    padding: 12px 0
  status-positive:
    backgroundColor: transparent
    textColor: "{colors.success}"
    typography: "{typography.number-md}"
  status-negative:
    backgroundColor: transparent
    textColor: "{colors.danger}"
    typography: "{typography.number-md}"
  search-input:
    backgroundColor: "{colors.surface-card-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 10px 16px
    height: 40px
  feature-card:
    backgroundColor: "{colors.surface-card-dark}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.xl}"
  faq-row:
    backgroundColor: transparent
    textColor: "{colors.on-dark}"
    typography: "{typography.title-sm}"
    rounded: "{rounded.md}"
    padding: 20px 0
  cta-band:
    backgroundColor: "{colors.surface-card-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.display-sm}"
    rounded: "{rounded.xl}"
    padding: 48px
  steps-card:
    backgroundColor: "{colors.surface-card-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.title-sm}"
    rounded: "{rounded.lg}"
    padding: 24px
  chart-card:
    backgroundColor: "{colors.surface-card-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 24px
  data-cell:
    backgroundColor: transparent
    textColor: "{colors.body}"
    typography: "{typography.body-md}"
  list-row:
    backgroundColor: transparent
    textColor: "{colors.on-dark}"
    typography: "{typography.body-md}"
    padding: 12px 0
  footer:
    backgroundColor: "{colors.surface-card-dark}"
    textColor: "{colors.body}"
    typography: "{typography.body-md}"
    padding: 64px
---

## Overview

GeoGuessLite uses a dark-mode design language that feels confident, dense, and highly legible. The site base is **On Primary** (`{colors.on-primary}` — #181a20), carrying light text and a single, high-contrast accent: **yellow** (`{colors.primary}` — #FCD535). Darker support surfaces such as **Canvas Dark** (`{colors.canvas-dark}` — #0b0e11) are layered on top for navigation bands and section separation. That accent does most of the visual emphasis work. It appears on primary CTAs, highlighted statistics, key links, and moments that need immediate visual priority.

The system is intentionally compact. It prefers flat surfaces, clear color separation, modest corner radii, and consistent 4px-based spacing over decorative depth or oversized whitespace. The result is a UI language that can support product messaging, navigation, dashboards, forms, and data-heavy layouts without changing its underlying structure.

Typography keeps a deliberate separation between editorial roles and numeric roles. Even when both currently use the same generic sans-serif family, the system preserves distinct tokens for numbers so a dedicated data-oriented typeface can be introduced later without changing the hierarchy.

**Key Characteristics:**
- Single accent color: `{colors.primary}` (#FCD535) carries primary actions, emphasized statistics, and highlight moments.
- Dark-mode only: the site base uses `{colors.on-primary}` with darker layered surfaces and high-contrast text.
- Preserved role separation in typography: display/body and numeric styles remain distinct at the token level.
- Flat color-block surfaces: depth comes from surface contrast and hairlines, not heavy shadows.
- Compact density: spacing is controlled and consistent, making the system suitable for both content and data display.
- Semantic status colors: `{colors.success}` and `{colors.danger}` communicate positive and negative change without domain-specific assumptions.

## Colors

### Brand & Accent
- **Primary** (`{colors.primary}` — #FCD535): The single accent and emphasis color. Used for primary CTA backgrounds, key statistics, active highlights, and inline links.
- **Primary Active** (`{colors.primary-active}` — #f0b90b): The pressed or hover state for primary actions.
- **Primary Disabled** (`{colors.primary-disabled}` — #3a3a1f): A darkened, desaturated primary used for disabled CTA states.

### Surface

The system is dark-mode only and uses a small set of layered surfaces:

- **On Primary** (`{colors.on-primary}` — #181a20): The site-wide base color used by the page root and default app background.
- **Canvas Dark** (`{colors.canvas-dark}` — #0b0e11): A darker structural surface used for navigation bands, hero bands, and sections that need stronger separation from the page base.
- **Surface Card Dark** (`{colors.surface-card-dark}` — #1e2329): Default elevated surface for cards, menus, panels, and secondary controls.
- **Surface Elevated Dark** (`{colors.surface-elevated-dark}` — #2b3139): One step lighter than the main card surface, used for nested panels, hover states, and internal separation.

### Hairlines & Borders
- **Hairline** (`{colors.hairline}` — #2b3139): The default 1px border tone on dark surfaces. It separates elements without introducing bright outlines.
- **Border Strong** (`{colors.border-strong}` — #cdd1d6): A stronger border tone reserved for more emphatic disabled or outlined states.

### Text
- **Ink** (`{colors.ink}` — #181a20): Dark text color kept primarily for use on yellow surfaces.
- **Body** (`{colors.body}` — #eaecef): Default body text on dark surfaces. Slightly softer than pure white.
- **Muted** (`{colors.muted}` — #707a8a): Secondary labels, metadata, helper text, and low-priority navigation.
- **Muted Strong** (`{colors.muted-strong}` — #929aa5): A stronger secondary text tone for emphasized labels.
- **On Primary** (`{colors.on-primary}` — #181a20): High-contrast text for primary yellow controls.
- **On Dark** (`{colors.on-dark}` — #ffffff): Strong headline and UI text on both the site base and darker support surfaces.

### Semantic Status
- **Success** (`{colors.success}` — #0ecb81): Positive state, increase, confirmation, or success.
- **Danger** (`{colors.danger}` — #f6465d): Negative state, decrease, warning, or destructive emphasis.

### Info / Focus
- **Info** (`{colors.info}` — #3b82f6): Informational accents and helper UI states.
- **Info Ring** (`{colors.info-ring}` — #3b82f6): Focus-ring base for keyboard and form interaction states.

## Typography

### Font Family

The system uses generic sans-serif stacks for now, with the option to introduce custom fonts later.

- Editorial/display/body roles use: `Inter, "Segoe UI", Roboto, -apple-system, BlinkMacSystemFont, sans-serif`
- Numeric roles currently use the same stack, but remain separate tokens so they can be swapped later without restructuring the system

The split is structural, not decorative:
- Editorial roles cover headlines, paragraphs, navigation, and button labels
- Numeric roles cover statistics, measured values, tabular data, and compact status values

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.hero-display}` | 64px | 700 | 1.1 | -1px | Primary page hero headline |
| `{typography.display-lg}` | 48px | 700 | 1.1 | -0.5px | Major promotional or section headline |
| `{typography.display-md}` | 40px | 600 | 1.15 | -0.3px | Large section heading |
| `{typography.display-sm}` | 32px | 600 | 1.2 | 0 | CTA band or featured panel heading |
| `{typography.title-lg}` | 24px | 600 | 1.3 | 0 | Sub-section title |
| `{typography.title-md}` | 20px | 600 | 1.35 | 0 | Card title or panel title |
| `{typography.title-sm}` | 16px | 600 | 1.4 | 0 | Badge label, FAQ heading, step label |
| `{typography.number-display}` | 40px | 700 | 1.1 | -0.3px | Large statistics and callout values |
| `{typography.number-md}` | 16px | 500 | 1.4 | 0 | Data table values and medium numeric labels |
| `{typography.number-sm}` | 14px | 500 | 1.4 | 0 | Inline values, compact deltas, secondary data |
| `{typography.body-md}` | 14px | 400 | 1.5 | 0 | Default body copy |
| `{typography.body-sm}` | 13px | 400 | 1.5 | 0 | Footer copy, helper text, compact body copy |
| `{typography.caption}` | 12px | 500 | 1.4 | 0 | Small metadata labels |
| `{typography.button}` | 14px | 600 | 1 | 0 | Standard CTA labels |
| `{typography.nav-link}` | 14px | 500 | 1.4 | 0 | Top navigation items |

### Principles

Display sizes use medium-to-heavy weights so headlines and numerical callouts remain legible against dark surfaces. The hierarchy favors clarity over elegance: large numbers, strong section titles, and stable body text.

Numeric roles remain explicit even though they currently share the same font family as body text. This preserves the system's ability to evolve later, for example by introducing a more data-oriented typeface for statistics or tabular views.

### Note on Font Substitutes

Because the system currently uses generic fallback stacks, no special substitution rules are required. If custom fonts are introduced later, they should map onto the existing editorial and numeric role split rather than replacing the token structure.

## Layout

### Spacing System
- **Base unit:** 4px.
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px · `{spacing.section}` 80px.
- **Section padding (vertical):** `{spacing.section}` (80px) for major page bands and headline sections.
- **Card internal padding:** `{spacing.lg}` (24px) for most content cards and data containers; `{spacing.xl}` (32px) for feature or CTA panels; `{spacing.md}` (16px) for compact badges and dense rows.
- **Gutters:** `{spacing.lg}` (24px) between larger cards; `{spacing.md}` (16px) in denser grouped layouts.

### Grid & Container
- **Max content width:** ~1280px centered for standard content pages.
- **Wide data surfaces:** up to ~1440px when horizontal density matters.
- **Editorial body:** a 12-column grid works well for most layouts.
- **Common split layout:** 8/4 or similar main-panel plus side-panel structures for mixed content and utility surfaces.
- **Footer:** multi-column at desktop, collapsing progressively at smaller breakpoints.

### Whitespace Philosophy

The system is denser than airy editorial sites. It relies on contrast, structure, and repeated spacing tokens more than oversized whitespace. Separation comes from consistent vertical rhythm, card surfaces, and semantic color emphasis rather than large empty bands.

Proximity is an explicit relationship signal in the layout system. Controls that belong to the same functional cluster should sit closer together than adjacent groups with different roles.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border | Body sections, navigation bars, large background bands |
| Soft hairline | 1px `{colors.hairline}` | Inputs, table dividers, row separators, secondary controls |
| Card surface | `{colors.surface-card-dark}` on `{colors.on-primary}` or `{colors.canvas-dark}` | Standard cards, menus, panels, grouped content |
| Nested surface | `{colors.surface-elevated-dark}` | Hovered panels, nested cards, internal raised sections |
| Focus ring | `0 0 0 2px {colors.info-ring}` at 50% alpha | Keyboard focus and active input state |

The elevation philosophy is **flat surfaces with restrained separation**. Depth comes from shifts between `{colors.on-primary}`, `{colors.canvas-dark}`, `{colors.surface-card-dark}`, and `{colors.surface-elevated-dark}`, not from heavy shadows, blur, or glass effects.

### Decorative Depth

Decorative treatments should remain secondary to the system. If imagery or illustration is used, it should sit inside the established surface model rather than introduce a new color or depth vocabulary.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 2px | Very small badges or tiny UI details |
| `{rounded.sm}` | 4px | Compact inline controls |
| `{rounded.md}` | 6px | Standard buttons and field shapes |
| `{rounded.lg}` | 8px | Search inputs, content cards, sub-panels |
| `{rounded.xl}` | 12px | Large elevated card containers and featured panels |
| `{rounded.pill}` | 9999px | Prominent capsule CTAs |
| `{rounded.full}` | 9999px / 50% | Circular icons, avatars, and fully rounded media |

The radius hierarchy stays tight. Most surfaces sit within the 6-12px range, keeping the system disciplined rather than soft.

### Photography & Iconography
- Icons should remain clean and legible against dark surfaces.
- Circular or rounded icon containers may use `{rounded.full}` where appropriate.
- Photography or illustration, when used, should adopt `{rounded.xl}` for larger media surfaces.

## Components

### Top Navigation

**`top-nav`** — The primary top navigation presented as a darker structural band over the site base. 64px tall with `{colors.canvas-dark}` background and `{colors.on-dark}` text. It carries the product mark at left, primary navigation links, and a right-side action cluster including text actions and a primary CTA.

Action spacing inside the top nav should reflect relationship, not just rhythm. Utility icon actions should form a tighter cluster than surrounding text actions, and the primary CTA should remain slightly separated so it reads as the final, highest-priority action.

### Buttons

**`button-primary`** — The main CTA. Background `{colors.primary}`, text `{colors.on-primary}`, type `{typography.button}`, padding 12px × 24px, height 40px, rounded `{rounded.md}`.

**`button-primary-pill`** — A larger capsule version of the primary CTA for especially prominent actions. Same yellow and dark text pairing, padding 14px × 32px, rounded `{rounded.pill}`.

**`button-secondary`** — Less emphasized action on dark surfaces. Background `{colors.surface-card-dark}`, text `{colors.on-dark}`, rounded `{rounded.md}`.

**`button-tertiary-text`** — Inline text action with no filled background. Used for navigation-side actions and low-emphasis interactive text.

**`button-success`** — Positive semantic action or confirmation control. Background `{colors.success}`, text `{colors.on-dark}`, rounded `{rounded.sm}`.

**`button-danger`** — Negative or destructive semantic action. Background `{colors.danger}`, text `{colors.on-dark}`, rounded `{rounded.sm}`.

**`button-compact`** — A condensed CTA for dense layouts such as data rows, inline controls, or utility panels.

**`text-link`** — Inline body link using `{colors.primary}` for emphasis.

### Cards & Containers

**`hero-band`** — Full-width dark band for the page’s main introduction, using `{typography.hero-display}` and `{spacing.section}` padding.

**`stat-callout-card`** — Minimal stat presentation with large emphasized numeric type in `{colors.primary}`.

**`badge-card`** — Small elevated container for trust, status, or feature highlights.

**`feature-card`** — Standard elevated content card for mixed text and visual content.

**`cta-band`** — Large highlighted panel for key calls to action. Uses `{colors.surface-card-dark}`, `{rounded.xl}`, and generous padding.

**`steps-card`** — Structured card for multi-step explanations, process summaries, or onboarding sections.

**`chart-card`** — Framed surface for charts, visual summaries, or analytical content.

### Data Display

**`data-table-card`** — Elevated container for structured tabular content.

**`data-row`** — Standard row treatment inside data tables or dense list structures.

**`data-cell`** — Default cell text styling for structured content.

**`status-positive`** — Positive status text or data delta.

**`status-negative`** — Negative status text or data delta.

**`list-row`** — Generic dense list-row treatment for ranked items, activity feeds, or compact grouped content.

### Inputs & Utility

**`search-input`** — Dark elevated input with `{rounded.lg}` and compact horizontal padding. Suitable for search and other single-line text entry.

### Informational Rows

**`faq-row`** — Expandable or grouped information row with strong title styling and compact vertical rhythm.

### Footer

**`footer`** — Large closing surface using `{colors.surface-card-dark}`, `{colors.body}`, and generous padding. Suitable for grouped navigation, supplemental links, and product-support information.
