# APAS DISC Profile — Guidelines

## Components

The design system exports these components — import them from `@ws-n2ss1umyzyvwdwc7iwjl/ccea2f55-1a6b-412e-a83c-42094122042d` and compose them before building anything from scratch:

`AppShell`, `Button`, `Constants`, `DiscBars`, `DiscChart`, `DiscPremiumReport`, `DiscTechnicalPanel`, `DiscTechnicalReport`, `V1`, `V3`

Per-component details (import stanzas, props, variants, examples) live in `.lovable/rules/libraries/{slug}/components.md` — on disk, not auto-loaded. Read that file or the component source when the name alone isn't enough.

## Theme Files

The design system's theme is delivered through the following files. The author's original source files carry the full wiring the design system needs — variable declarations, framework-specific directives, provider objects, etc. — and are the canonical import target.

- `@ws-n2ss1umyzyvwdwc7iwjl/ccea2f55-1a6b-412e-a83c-42094122042d/styles.css` (source — preferred import)
- `@ws-n2ss1umyzyvwdwc7iwjl/ccea2f55-1a6b-412e-a83c-42094122042d/dist/tokens.css` (auto-generated flat list of CSS custom properties — a raw-values fallback only; does NOT carry framework-specific wiring that the source files above provide)

