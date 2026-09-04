# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

No changes yet beyond the initial `0.1.0` scope below.

## [0.1.0] - Unreleased

Initial release of `katanakit-css` — a lightweight, modular SCSS
mini-framework: design tokens, utility classes and layout mixins (grid, flex,
breakpoints) with an `@apply`-style system. Zero runtime overhead.

### Added

- **Modular SCSS architecture** — modern `@use`/`@forward` partials with
  explicit namespaces and a component-free public entry
  (`src/scss/main.scss`). Partial modules: `functions`, `variables`, `reset`,
  `breakpoints`, `theme`, `colors`, `grid`, `flex`, `apply`; utility engine
  under `partials/utils/` (`index`, `core`, `maps`, `spacing`, `sizing`,
  `flex`, `effects`, `layout`); example components under `components/`.
- **Design-token system** — `!default` maps for font families, shadows,
  containers, breakpoints, spacing, radius, z-index layers, transition
  durations and easings. `generate-css-tokens()` emits them as CSS custom
  properties in `:root` (`--font-*`, `--shadow-*`, `--container-*`,
  `--spacing-*`, `--radius-*`, `--z-*`, `--duration-*`, `--ease-*`), each
  family independently toggleable.
- **Color system** — six semantic palettes (`neutral`, `purple`, `info`,
  `warning`, `danger`, `success`) with **seven tones each** (100–700) plus
  four special colors (`white`, `black`, `transparent`, `current`). Accessor
  functions (`get-color`, `get`, `alpha`), `generate-css-vars()`, utility
  mixins (`text`, `bg`, `border`, `hover`, `all`) and `theme()` dark-mode
  inversion.
- **Modern CSS reset** — box-sizing, margin/padding zeroing and media
  defaults, all exposed as overrideable custom properties.
- **Responsive breakpoints** — mobile-first system with seven tiers
  (`xs` … `3xl`), a generic `breakpoint()`/`bp()` mixin supporting `up`,
  `down`, `only` and `between`, named `up`/`down` aliases
  (`xs` … `xxxl`, `xs-down` … `x3l-down`, with canonical `xxl-down` and
  `xxxl-down`) and feature queries (portrait, landscape, reduced-motion,
  hoverable, touch, dark-mode, light-mode).
- **CSS Grid mixins** — `grid-responsive` (auto-fill/fit),
  `grid-autofill`, `grid-autofit`, `grid-fixed-columns`,
  `grid-breakpoint-columns`, `grid-container`, `grid-center`, `grid-gap`,
  `grid-areas`/`grid-area`, `grid-span`, `grid-placement`,
  `grid-item-center`, `grid-item-full`, `subgrid`, `grid-masonry`
  (experimental), `grid-stack` and `grid-stack-item`.
- **Flexbox mixins** — `flex-container`, `flex-center`, `flex-gap`,
  `flex-grow`, `flex-shrink`, `flex-basis`, `flex-item`, `flex-item-center`,
  `flex-item-full`.
- **Pure functions** — `rem()`, `px()`, `to-unit()`, `strip-unit()`,
  `fluid()` (returns `clamp()`), `tint()`, `shade()`, `saturate-color()`,
  `desaturate-color()`, `complement()`, `contrast()`, `color-mix-var()`,
  `to-class()`.
- **Utility engine** — map-driven generators for sizing (`w`/`h`/min/max),
  flexbox, effects (shadows, radius, z-index, durations, easings, opacity)
  and layout (display, position, overflow, text alignment, font weights,
  white space, wrapping). Padding classes (`.p-*`) plus `.gap`, `.shadow`
  and `.rounded` are emitted automatically when the module loads;
  `generate-all-utilities()` exposes the opt-in generators.
- **`@apply`-style system** — `register-utility()` and `apply()` mixins with
  an automatic registry derived from the same `utils/_maps.scss` maps that
  drive the class generators.
- **Theme hook** — `theme()` delegates to the color system and emits inverted
  palettes under `:root[data-theme="dark"]`, with optional overrides.
- **Example components** — `components/_index.scss` demonstrates the `apply`
  system (`.card`, `.button`, responsive containers/hero) and is only pulled
  in by the demo entry.
- **Vite demo** — `index.html` + `demo/main.js` import `src/scss/demo.scss`
  with hot reload (port 4321); production build outputs to `demo-dist/` with
  PostCSS autoprefixer and PurgeCSS (custom properties preserved).
- **npm artifact** — `yarn build:css` compiles `src/scss/main.scss` to
  `dist/css/katanakit.css` (compressed, no source map), referenced by the
  package `style` field.
- **Test suite** — deterministic in-memory compilation tests
  (`node --test`) covering the public entries, the API surface and function
  regression fixtures (26 tests).
- **English documentation** — README (root), Getting Started, API Reference,
  Architecture, Roadmap, CONTRIBUTING, SECURITY and this changelog.

### Fixed

Corrections applied during the development of `0.1.0` so the public API
matches what the code actually generates:

- **Neutral palette** — reworked as a true gray scale (saturation 0%).
- **Breakpoints `2xl`/`3xl`** — restored the two high tiers and their named
  mixins (`xxl`, `xxxl`, `x2l-down`, `x3l-down`, and the canonical
  `xxl-down`/`xxxl-down` aliases) in both the map and the emitted media
  queries.
- **Grid placement** — the item-placement API is provided by
  `grid-placement`, `grid-item-full` and the `grid-stack`/`grid-stack-item`
  pair; no other placement mixin names exist in the code.
- **`rem()` base** — unit-safe conversion on a **16px** base; both
  `rem(16px)` and `rem(16)` return `1rem`, and `px(1)` returns `16px`.
- **`fluid()`** — corrected interpolation so it returns a proper `clamp()`
  expression (e.g. `fluid(16px, 24px)` →
  `clamp(16px, 0.5vw + 14.4px, 24px)`).
- **Dark theme** — inverts all **seven** tones of every palette
  (100 ↔ 700, 200 ↔ 600, 300 ↔ 500) under `:root[data-theme="dark"]`.
- **`.hidden`** — emits `display: none` via the `$display-values` map.
- **`.w-screen`** — emits `width: 100vw` from the `$sizing-map`.
- **Font weights** — utility and registry values now use the correct numeric
  weights (`thin` 100 … `black` 900), including `extralight` 200.
- **`to-unit()`** — restricted to the units `rem`, `px`, `em` and `%`, with a
  compile-time error for anything else; values that already carry a unit pass
  through unchanged.
- **`@apply` registry** — rewired to iterate `utils/_maps.scss` so the
  registered names stay synchronised with the generated classes (single
  source of truth).
- **Reset** — cleaned up so it only emits the documented reset defaults; no
  leftover identity palette tones are wired into it.
