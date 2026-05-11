# Changelog

All notable changes to AI Output Runtime are documented here. The project follows [Semantic Versioning](https://semver.org/).

## v0.4.1 — 2026-05-11

Reader-experience patch on top of v0.4.0. No schema changes; all features additive.

### Added

- **Executive Summary auto-card.** When a document contains a `callout` and/or a `trend-card` / `metric-cards` block, the runtime now injects a collapsible "Executive Summary" card right after the report-header (or at the top if absent). Pulls the first callout's title + body excerpt and the first 4 metric labels/values. Toggle button collapses the body. Suppress with frontmatter `summary: off`.
- **Sticky TOC + active section highlight.** On viewports ≥ 1200px the right-rail TOC is now sticky and uses `IntersectionObserver` to highlight the section currently in view (border-left + accent color). Below 1200px the TOC stays hidden as before.
- **Section anchor links.** Hovering an h1/h2/h3 reveals a `#` icon. Clicking it copies the section URL to clipboard, updates the address bar via `history.replaceState`, and briefly flashes green. Hidden in print.
- **CSV export buttons** on `table`, `chart`, `trend-card`, `status-grid`, `action-items`, `comparison`, `gauge`, `funnel`, `waterfall`, `heatmap`. Each component now ships an inline `<script type="text/csv" data-ai-csv>` payload; the header bar `⤓ CSV` button serializes it via Blob + `a.download`, prepending a UTF-8 BOM so Excel handles non-ASCII labels. Suppressed in print.
- **Numbering toggle** via frontmatter `numbering: off` (or `false`/`no`). Hides the sequential chip before component headers — useful when sections are already H2-numbered or when the report is short. Pads the header back to the normal inset.
- **Print/PDF polish:**
  - `@page { size: A4; margin: 18mm 16mm 22mm 16mm }` — proper margins for cover + content pages.
  - `report-header` becomes a real cover page (`page-break-after: always`, min-height ≈ viewport).
  - Each top-level H1 starts a new page (except the first, and except the one right after report-header).
  - Topbar, source panel, toc, search input, code-block Copy button, CSV button, and executive summary are hidden in print.
  - Dark theme is forced to light in print; report-header chips remap to print-safe colors; sequence chip hidden.
  - Component cards break-inside-avoid so charts and tables don't split awkwardly.

### Changed

- Top-bar button row now leads with the new **Skim** toggle (was added in v0.4.0 but kept its previous slot for compatibility).
- `assets/lang/index.json` regenerated against `v0.4.1` runtime.

### Compatibility

- All v0.4.0 markdown renders unchanged. CDN-pinned `@v0.4.0` URLs continue to serve their original bytes.

## v0.4.0 — 2026-05-11

A major shape expansion: 11 new candidate components covering business-report scenarios (weekly/monthly/quarterly reviews, postmortems, KPI dashboards, finance bridges, conversion analysis, prioritization), a modular language pack architecture for code-block syntax highlighting, and reader-experience upgrades. Backward-compatible: every v0.2.x markdown renders unchanged.

### Added

- **Six P0 candidate components** for business reporting:
  - `aio:report-header@1` — hero block with title / period / author / status / dataAsOf / classification / badges. Auto-emitted from markdown YAML frontmatter.
  - `aio:trend-card@1` — metric cards with delta, sparkline, locale-aware number formatting (`format: percent | currency:CCY | compact | number | raw`).
  - `aio:status-grid@1` — state-of-the-world cards (good/warn/bad/neutral/info) with colored top border + status dot.
  - `aio:timeline@1` — chronological events with tone-colored dots and time stamps. Up to 30 items.
  - `aio:action-items@1` — owned follow-ups with status / priority / due date. Overdue (`due < today` and not `done`) is auto-highlighted red.
  - `aio:comparison@1` — multi-option scoring matrix with optional `recommended` column highlight and weights.
- **Five P1 chart components** for analytical reports:
  - `aio:gauge@1` — semicircle KPI/OKR attainment gauges (auto-tone from progress vs target).
  - `aio:funnel@1` — conversion funnel with auto-computed step + overall conversion percentages.
  - `aio:waterfall@1` — P&L bridge / variance / attribution chart with `start | up | down | subtotal | end` bar kinds.
  - `aio:heatmap@1` — 2D density grid (up to 32×32) with opacity scaling and color legend.
  - `aio:matrix@1` — 2×2 quadrant scatter (risk / RICE / BCG) with optional quadrant labels.
- **Modular code-block syntax highlighting** (`assets/lang/*.js`):
  - Six languages **always inlined** in the runtime: `json`, `bash`, `js+ts`, `python`, `yaml`, `diff`.
  - Twenty-four languages **lazy-loaded on demand** via jsDelivr: `go`, `rust`, `php`, `ruby`, `java`, `kotlin`, `swift`, `c`, `cpp`, `csharp`, `sql`, `html`, `css`, `xml`, `dockerfile`, `toml`, `ini`, `lua`, `perl`, `r`, `scala`, `dart`, `regex`, `graphql` (with aliases — e.g. `golang`, `c++`, `mysql`, `htm`, `svg`).
  - New `window.AIOutputRuntime.registerLanguage(spec)` API; runtime queues registrations that arrive before it loads.
  - New `langBaseUrl` render option; runtime auto-detects from `document.currentScript.src` when present.
  - `assets/lang/index.json` manifest (24 languages with SHA-384 integrity hints).
  - Code blocks now have a header bar with language tag + Copy button (1.2s "Copied" toast).
- **Markdown YAML frontmatter** (`---\ntitle: ...\nperiod: ...\n---`) auto-renders as `aio:report-header@1`. Ignored when an explicit `aio:report-header@1` block is present.
- **Locale-aware number formatting** via `Intl.NumberFormat` for `trend-card`, `gauge`, `funnel`, `waterfall`, `heatmap`. CLI `--lang` flag selects the locale.
- **`asOf` field** on every new candidate component, rendered as a discreet top-right "data as of …" stamp.
- **Skim mode** toggle in the top bar: dims narrative paragraphs to 35% opacity so structured blocks (cards / charts / tables / callouts) read first.
- **Top-bar Copy source** button now gives a 1.2s "Copied" visual confirmation.
- **CLI inline-runtime** auto-inlines used language modules so the resulting HTML opens via `file://` with no network calls.
- New `--lang-base-url` CLI flag overrides the default language-module CDN base.
- New `npm run gen:lang-manifest` script regenerates `assets/lang/index.json`.
- Two new comprehensive examples: `examples/weekly-report-demo.md` (P0 six-component weekly business report) and `examples/dashboard-demo.md` (P1 five-chart quarterly review). Both wired into `npm test` and `npm run render:site`.
- `docs/demo-weekly.html` and `docs/demo-dashboard.html` join the public Pages site.

### Changed

- Component header now uses `justify-content: flex-start`: the sequence-number chip stays left-of the title (previously the title was pushed to the right). Table search box keeps right alignment via `margin-left: auto`.
- Runtime grew from 47.7 KB → 121.1 KB raw (gzipped 11.9 KB → 26.1 KB) reflecting the eleven new components + tokenizer base + UX features.
- `RUNTIME_VERSION` constant exposed on `window.AIOutputRuntime.version`.
- `aio-registry.json` candidate list expanded with eleven new entries; stable list unchanged (`table@1`, `metric-cards@1`, `callout@1`).

### Security

- `isSafeLangUrl` (runtime) uses an explicit ASCII whitelist instead of a control-byte range regex — same outcome, safer to inline.
- All new components reject `<` and `>` in every string field (consistent with the existing AIO rule).
- Frontmatter parser only accepts top-level `key: value` lines and bails on the first malformed line; nested structures are not supported on purpose to keep the surface narrow.

### Compatibility

- All v0.2.x markdown renders identically (no breaking schema changes). The four original stable components retain their exact field set.
- CDN-pinned `@v0.2.x` URLs continue to serve the bytes they shipped with. Update production embeds to `@v0.4.0` to opt in.

## v0.2.2 — 2026-05-11

### Changed

- **Renamed the project from `ai-output-runtime-g` to `ai-output-runtime`.** The GitHub repository was renamed; GitHub auto-redirects old URLs, but the canonical references now drop the trailing `-g`. The new repo URL is `https://github.com/wxkingstar/ai-output-runtime`, the new Pages URL is `https://wxkingstar.github.io/ai-output-runtime/`, and the new CDN URL is `https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime@v0.2.2/assets/ai-output-runtime.js`. All README / SKILL / docs / examples references swept in this release.
- **Install command now defaults to global install:** `npx skills add wxkingstar/ai-output-runtime -g -y` (was `-y` only). The `-g` makes the agent skill available across all projects on the machine instead of per-project. Existing per-project installs are unaffected; reinstall with `-g` to migrate.
- `scripts/aio.mjs` `DEFAULT_RUNTIME_URL` and `RUNTIME_VERSION` updated; `package.json`, `aio-registry.json` bumped to 0.2.2.
- `docs/index.html`, `docs/demo-zh.html`, `docs/demo-charts.html` regenerated against the new CDN base URL.

### Compatibility

- Old `@v0.2.x` CDN URLs under the `ai-output-runtime-g` repo name continue to resolve via GitHub's repo-rename redirect for the foreseeable future, but all new documentation points at the canonical `ai-output-runtime` path. Update production embeds at your convenience.

## v0.2.1 — 2026-05-11

### Fixed

- **Dark mode contrast across all stable components.** v0.2.0 introduced the dual-theme system at the variable level, but a handful of CSS rules still hardcoded light-mode colours: inline `<code>` backgrounds, `<pre>` block surrounds, table header strip, default badge background, table cell badges (high/medium/low), the section-number chip, the search input, the metric-card background, the TOC border, the error block, and all four callout tone backgrounds (info / success / warning / danger). In dark mode these collapsed to invisible white-on-dark slabs.
- Each of those rules now reads from a new dedicated CSS variable (`--ai-code-bg`, `--ai-pre-bg`, `--ai-table-header-bg`, `--ai-badge-bg`, `--ai-badge-{high,medium,low}-{bg,border}`, `--ai-section-chip-bg`, `--ai-input-bg`, `--ai-toc-bg`, `--ai-error-{bg,fg,border}`, `--ai-callout-{info,success,warning,danger}-bg`). The light theme keeps every previous colour exactly; the dark theme defines semi-transparent overlays so tone semantics survive while contrast against the slate background stays readable.
- Added `.ai-document pre code` reset so nested inline code inside a code block does not inherit the standalone inline-code styling on top of the pre block background.

### Changed

- Bumped CDN-default RUNTIME_VERSION to `v0.2.1`. All README, SKILL.md, launch-kit, launch-plan, and `examples/landing.md` references updated to the new tag. `@v0.2.0` remains pinned to the previous (broken-in-dark) runtime for any links that already shipped.

## v0.2.0 — 2026-05-11

### Added

- **Candidate component `aio:chart@1`** — line / bar / area / pie / donut charts. Schema-constrained data emission (no formatter callbacks, no colour overrides, no stacked variants). Pure SVG rendering, zero new dependencies, theme-aware via CSS variables. See `specs/chart-v1.md`.
- **Dark / light dual theme** in the runtime. Driven by `prefers-color-scheme` by default; force via `options.theme` at render time, the `--theme` CLI flag, or the toolbar toggle button. Six-colour chart palette adapts automatically.
- **Print stylesheet** (`@media print`): hides chrome, forces light palette, avoids page breaks inside tables / charts / callouts, expands link targets.
- **i18n support** — built-in `en` and `zh-CN` locale tables. `options.locale`, the `--lang` CLI flag, or `<html lang>` selects the active locale. All hardcoded UI strings (filter placeholder, TOC heading, toolbar buttons, default component titles) are now translatable.
- **`docs/index.html`** landing page and `docs/demo-charts.html` chart showcase, both rendered with the inline runtime so they work offline. `docs/.nojekyll` prevents Jekyll from rewriting the site.
- **`package.json` `files[]` whitelist** so `npm pack` only ships the runtime, scripts, schemas, specs, examples, and skill metadata.

### Changed

- **SKILL.md output policy flipped** from "Markdown by default, occasional AIO" to "default AIO whenever the content shape is structured: comparisons, conclusions, recommendations, metric summaries, status overviews, risk lists, audit findings". The skill description now triggers on natural report-shaped requests (report, analysis, comparison, summary, status, review, audit, dashboard, postmortem, plus Chinese equivalents).
- **JSON schemas** gained a `description` field clarifying that cross-field invariants (e.g., table row length must match `columns.length`) are enforced by the CLI validator at `scripts/aio.mjs`. The validator is the source of truth; schemas describe shape only.
- **Renderer hardening**: removed four unregistered "ghost" renderers (`decision`, `matrix`, `tabs`, `flow`) and their CSS, dropping 231 lines of dead code. `renderTabs` in particular shipped an interactive click handler that violated the no-JS-on-AI-content principle.
- **README repositioned** as agent-agnostic (Claude Code / Codex / generic) instead of Claude-specific. "CommonMark Markdown" wording corrected to "CommonMark subset" to match the actual implementation.
- **Runtime bundle grew from ~32 KB to ~38 KB** (chart code + i18n + theme).

### Fixed

- **`aio render --runtime` attribute injection** (security): the runtime source is now sanitized — quotes, angle brackets, backslashes, whitespace, control characters, path traversal, and non-HTTPS URL schemes are all rejected. The final `<script src>` value is HTML-escaped. Previously `--runtime 'x" onerror="alert(1)'` could land arbitrary JS in rendered HTML.
- **CLI input size guard**: 4 MiB cap on `aio validate` / `aio render` input matches the browser runtime's existing `MAX_BLOCK_BYTES` safeguard.
- `--lang` BCP47 validation; `--theme` enum validation.
- Literal control-byte regex in `scripts/aio.mjs` replaced with explicit `\uXXXX` escapes so the file is no longer detected as binary by git.

## v0.1.1 — 2026-05-11

### Changed

- `aio render` output now references the jsDelivr CDN by default (pinned to `v0.1.1`), fixing the previous broken `../assets/...` relative path that only worked when `--out` targeted `dist/`.
- New CLI flags: `--inline-runtime` (embed the bundled runtime), `--runtime <url|path>` (custom source). `--out` is now optional and defaults to `<input>.html` next to the source.
- `package.json` test split into `test:valid` / `test:invalid`. `engines.node >= 18` declared.

### Added

- `examples/report-demo.md` — mixed-component report fixture, wired into `npm run test:valid`.
- README expanded with default / inline / custom-runtime render examples and Subresource Integrity guidance for the CDN tag.

## v0.1.0 — Initial release

- Three stable components: `aio:table@1`, `aio:metric-cards@1`, `aio:callout@1`.
- Zero-dependency CLI validator + browser runtime.
- Specs, schemas, registry, and agent skill metadata.
