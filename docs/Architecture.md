# Architecture

This document explains how `katanakit-css` is organised, how the modules
relate to each other and how a source `.scss` file becomes the artifacts you
ship.

> TL;DR — `katanakit-css` is **build-time SCSS**. There is no JavaScript
> runtime. Everything is produced by the Sass compiler from `!default` token
> maps.

---

## 1. Overview

The framework is a collection of Sass **modules** (partials) plus two
compilable entries:

| Entry | What it emits | Used for |
| --- | --- | --- |
| `src/scss/main.scss` | Public "full sheet": reset + token custom properties + color variables and utilities + all utility generators. **No components.** | npm artifact `dist/css/katanakit.css` and `@use "katanakit-css/src/scss/main"` consumers. |
| `src/scss/demo.scss` | `@use "main"` + `@use "components/index"` (example components built on `apply`). | Local demo only (Vite). |

Components intentionally stay out of `main.scss`: they are *example* styles,
not framework API.

---

## 2. Layer model

```
┌──────────────────────────────────────────────────────────────┐
│ ENTRY POINTS                                                 │
│   main.scss  ·  demo.scss                                    │
└───────────────┬──────────────────────────────────────────────┘
                │ @use
┌───────────────▼──────────────────────────────────────────────┐
│ PARTIAL MODULES (src/scss/partials/*.scss)                   │
│   reset · variables(v) · functions(f) · colors(c)            │
│   breakpoints(bp) · grid(g) · flex(fl) · theme(t)            │
│   apply(a) · utils(u — facade)                               │
└───────┬───────────────────────────────┬──────────────────────┘
        │ @use/@forward                 │ @use
┌───────▼────────────────────────┐ ┌────▼──────────────────────────────┐
│ UTILS SUBMODULES               │ │ COMPONENTS (demo only)            │
│ (partials/utils/*.scss)        │ │   components/_index.scss          │
│  _index · _core · _maps        │ │   uses apply + breakpoints        │
│  _spacing · _sizing · _flex    │ └────────────────────────────────────┘
│  _effects · _layout            │
└────────────────────────────────┘
```

Modules never `@import` each other; they use modern `@use` (lowercase) with
explicit namespaces and re-export through `@forward`. The `utils` partial
(`_utils.scss`) is a thin facade that only does `@forward "utils/index"`, and
`utils/_index.scss` forwards the seven pieces below it and defines the
`generate-all-utilities()` mixin.

---

## 3. Responsibilities of each partial

| Partial | Namespace | Responsibility |
| --- | --- | --- |
| `_reset.scss` | — | Modern reset. Defaults are exposed as `:root` custom properties (`--m-reset`, `--box-sizing`, `--min-h-screen`, …) so a theme can change them without editing the reset. |
| `_variables.scss` | `as v` | `!default` token maps (fonts, shadows, containers, breakpoints, spacing, radius, z, durations, easings), accessor functions and `generate-css-tokens()`. |
| `_functions.scss` | `as f` | Pure helpers: unit conversion, `fluid()` → `clamp()`, color manipulation, `color-mix-var()`, `to-class()`. No CSS output. |
| `_colors.scss` | `as c` | Color tokens (`$colors`, `$special-colors`, `$shades`), accessors (`get-color`/`get`/`alpha`), `generate-css-vars()`, color utility mixins and `theme()`. |
| `_breakpoints.scss` | `as bp` | `$breakpoints` map, generic `breakpoint()`/`bp()` mixins, named `up`/`down` mixins, feature-query mixins. |
| `_grid.scss` | `as g` | Grid composition mixins (responsive columns, containers, areas, placement, stacking, subgrid, masonry). |
| `_flex.scss` | `as fl` | Flex container/item mixins. |
| `_theme.scss` | `as t` | Theme hook; delegates to `colors.theme()`. |
| `_apply.scss` | `as a` | `@apply`-style registry: `register-utility()` + `apply()`, with an automatic registry derived from the utility maps. |
| `_utils.scss` + `utils/` | `as u` | Utility-class engine (see next section). |

---

## 4. The utility engine

The utility system is deliberately map-driven so that tokens and generated
classes cannot drift apart.

### 4.1 Maps are the single source of truth

`utils/_maps.scss` holds every utility token:

- `$sizing-map` (width/height values, incl. `full`, `screen`, `min`, `max`,
  `fit`),
- `$spacing-map` (padding/margin/gap scale; keys are literal: `"05"`,
  `"1-5"`, `"2-5"`, `"3-5"`, `"base"` …),
- `$gap-sizes-map`, `$flex-direction-map`, `$flex-wrap-list`,
  `$align-items-map`, `$justify-content-map`,
- `$shadow-map`, `$radius-map`, `$z-layers-map`, `$transition-duration-map`,
  `$transition-timing-map`, `$opacity-values`,
- `$font-weight-values`, `$text-align-values`, `$display-values`,
  `$position-values`, `$overflow-values`, `$white-space-list`,
  `$overflow-wrap-list`.

All maps are `!default`, so downstream projects can override them with the
Sass `with` clause.

### 4.2 From maps to CSS classes

```
utils/_maps.scss ─► generators (utils/_sizing|flex|effects|layout|spacing)
                          │  use core.utils-classes($input, $property, $prefix)
                          ▼
                 .w-full { width: 100% }
                 .hidden { display: none }   // $display-values maps hidden → none
                 .font-normal { font-weight: 400 }
                 .gap-4 { gap: 1rem }
                 …
```

- `_core.scss` provides the generic `utils-classes()` / `utils-classes-hover()`
  mixins plus CSS-variable helpers (`vars-list`, `vars-map`) and centering
  helpers (`absolute-center`, `center-mx`, `center-my`).
- `_spacing.scss` and `_effects.scss` **emit at load time**: `.p-{key}` for
  every `$spacing-map` key, `.gap`, `.shadow` and `.rounded`. This mirrors the
  original all-in-one `_utils.scss` behaviour and means loading the module is
  enough to get the most common padding classes.
- The rest is **opt-in**: `sizing.get-sizing-classes()`,
  `flex.generate-flex-utilities()`, `effects.generate-effects-utilities()` and
  `layout.generate-layout-utilities()`. `utils/_index.scss` exposes
  `generate-all-utilities()`, which `main.scss` calls.

### 4.3 The apply registry mirrors the same maps

`_apply.scss` builds its automatic registry with `@each` loops **over
`$spacing-map`, `$radius-map`, `$shadow-map`, `$z-layers-map`,
`$transition-duration-map`, `$transition-timing-map`, `$opacity-values`,
`$display-values`, `$position-values`, `$overflow-values`,
`$text-align-values`, `$font-weight-values`, `$flex-direction-map`,
`$flex-wrap-list`, `$align-items-map`, `$justify-content-map`** — the exact
same maps the class generators read. That keeps `apply(flex, p-2-5,
rounded-lg, …)` consistent with the generated `.flex`, `.p-2-5` and
`.rounded-lg` classes, and means a scale change propagates to both systems at
once.

The registry also carries hand-written helpers that are *not* generated as
classes (margin/directional padding, font-size steps, grid columns,
transitions, …). Those names are only available inside `@include a.apply(...)`.

### 4.4 Color utilities

Color utilities do **not** go through the generic engine. `_colors.scss`
emits them with a dedicated helper that iterates `$colors` × `$shades` and
`$special-colors`:

```
.text-neutral-500  { color: hsl(0 0% 35%) }
.bg-info-300       { background-color: … }
.border-white      { border-color: … }
.hover-bg-success-600:hover { … }
```

The palette custom properties (`--neutral-500`, `--white`, …) are a parallel
output of `generate-css-vars()`; the utility classes keep **literal values**
so class-based CSS purging can remove them safely while the token variables
stay in `:root`.

---

## 5. Tokens and the `:root` block

`main.scss` calls, in order:

```scss
@use "./partials/reset";     // reset emits its own :root defaults
@use "./partials/variables" as v;
@use "./partials/colors" as c;
@use "./partials/utils" as u;

@include v.generate-css-tokens();  // --font-*, --shadow-*, --spacing-*, …
@include c.generate-css-vars();    // --neutral-100…, --white, …
@include c.all-utilities();        // .text-*, .bg-*, .border-*, hover
@include u.generate-all-utilities();
```

The CSS custom properties are grouped under `:root`. Because every token map
is `!default`, a consumer can reconfigure the whole output by loading the
`variables` module with a `with` clause *before* anything else loads it (a
Sass module can only be configured once per compilation).

Dark themes do not edit `:root`: `theme("dark")` emits an *additional* block
under `:root[data-theme="dark"]` with each palette inverted (100 ↔ 700,
200 ↔ 600, 300 ↔ 500), leaving the light defaults untouched.

---

## 6. Build pipeline

Two independent pipelines produce the artifacts:

```
(1) npm artifact
    src/scss/main.scss
          │  yarn build:css
          │  sass src/scss/main.scss dist/css/katanakit.css
          │  --no-source-map --style=compressed
          ▼
    dist/css/katanakit.css            ◄── shipped, referenced by "style"

(2) local demo
    src/scss/demo.scss  +  index.html + demo/main.js
          │  yarn dev        →  vite dev server (HMR, port 4321)
          │  yarn build:demo →  vite build
          │                     PostCSS autoprefixer  +  PurgeCSS
          ▼
    demo-dist/ (index.html + assets/*.css + assets/*.js)
```

Notes on the demo build (`vite.config.js`):

- `publicDir: false` — there is no static folder; the CSS is compiled from the
  SCSS module graph.
- PurgeCSS content is `index.html` + `demo/**/*.{js,ts}`. A safelist keeps
  variant-looking tokens (`hover:*`, `md:*`, …) and keyframes/font-faces are
  preserved.
- `variables: false` — PurgeCSS keeps the custom properties in `:root` (the
  token/color variables) even though utility classes use literal values.
- Output goes to `demo-dist/`, intentionally **not** `dist/`, so the demo never
  overwrites the npm CSS artifact.
- The `dist/css/katanakit.css` artifact is produced by the Sass CLI alone; run
  your own PostCSS (e.g. autoprefixer) when you consume the SCSS source if you
  need prefixing for older browsers.

The test suite (`node --test "test/**/*.test.mjs"`) compiles the entries and
fixtures in memory via the Sass JS API (`loadPaths: src/scss/partials`) and
asserts on the compiled CSS — it never writes to `src/` or `dist/`.

---

## 7. Conventions that keep the architecture intact

1. **One responsibility per partial** — put new capabilities in the module
   that owns that concern (tokens in `_variables.scss`, mixins in `_grid.scss`,
   maps in `utils/_maps.scss`, …).
2. **Modern module syntax only** — `@use`/`@forward`, never `@import`.
3. **Maps are `!default`** — any scale can be overridden without forks.
4. **Kebab-case literal keys** — utility keys (`.p-05`, `.p-1-5`, `.w-screen`)
   match the map keys exactly; no bracket conversion layer.
5. **Generated classes vs registry** — only mixins explicitly emit classes;
   registering a utility for `apply` never creates a class by itself.
6. **`main.scss` stays component-free** — example components live in
   `components/_index.scss` and are pulled in by `demo.scss`, never by the
   public sheet.
