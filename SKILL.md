---
name: ai-output-runtime
description: Use when YOU are producing a structured, scannable artifact for humans rather than a paragraph of prose — weekly / monthly / quarterly / daily reviews (周报/月报/季报/日报), business reviews (业务汇报), dashboards, postmortems / 复盘 / retros, code reviews / security audits, KPI or OKR scorecards (达成率/进度), financial P&L bridges or variance analysis (财务分析/经营分析), sales funnel / conversion analysis (销售漏斗), inventory / logistics / operations / customer / cohort analytics (库存/物流/运营/客户/复购分析), trend or period-over-period analysis with deltas (趋势分析/同比/环比), competitor or vendor comparison / 方案选型 / 竞品比较, risk assessment / 风险评估 (likelihood × impact), status sync / 状态同步 / 盘点 / 概览 across services or business lines, action items / next steps / 行动项 / 待办, or any output the reader will scan rather than read linearly. Triggers on 生成报告 / 做一份分析 / 写个月报 / 出一份周报 / 复盘 / Postmortem / 趋势分析 / 对比分析 / 方案选型 / 竞品比较 / 总结 / 小结 / 盘点 / 概览 / 状态同步 / 审查 / 审计 / 风险评估 / KPI / OKR / 财务 / 销售 / 库存 / 物流 / 运营 / 客户分析, dashboard / report / weekly / monthly / quarterly / analysis / review / audit / comparison / funnel / waterfall / heatmap / matrix / RICE / BCG / status / summary / scorecard / next steps / action items, and on explicit mentions of AIO / AI Output Runtime / aio:name@major. Also use when validating or rendering AIO Markdown via the CLI. Skip for one-paragraph chat replies, code snippets, debugging help, or when the user explicitly asks for plain prose. Compatible with Claude Code, Codex, and other agents that install skills from GitHub.
---

# AI Output Runtime

Use this skill whenever the agent is producing **structured content for human consumption** — reports, comparisons, conclusions, status panels, audit findings — not just when the user names AIO explicitly. AIO Markdown lets agents highlight the takeaways, compare options side-by-side, and ship findings as a portable artifact, instead of dumping a wall of prose.

## Default Output Policy

**Use AIO by default for any of these content shapes:**

- A **conclusion / recommendation / verdict** at the end of an analysis → `aio:callout@1`
- A **comparison** between options, vendors, designs, or scenarios → `aio:table@1`
- A **summary of key metrics or status indicators** (counts, percentages, pass/fail, deltas) → `aio:metric-cards@1`
- **Risk / finding / issue lists** with severity or status → `aio:callout@1` (items) or `aio:table@1`
- **Audit / review / QA outputs** with structured findings → mix of the three above

**Fall back to plain CommonMark Markdown only when:**

- The reply is pure conversational prose / Q&A.
- The output is a code suggestion, snippet, or explanation in a chat surface.
- The user explicitly asked for plain Markdown or a specific format.

Prose paragraphs, narrative explanations, and inline lists stay as CommonMark — AIO blocks are interleaved with prose, not a replacement for it.

## Render-aware emission

AIO blocks render beautifully when the surface knows the runtime, and they degrade to a JSON code block when it doesn't. So:

- **When writing a `.md` or `.html` file to disk** (which the user can render with `aio render` or via the CDN runtime) → always emit AIO for the content shapes above.
- **When responding in a chat / TTY surface that may not render AIO** → still emit AIO for structured shapes (a JSON code block is no worse than a markdown table for the same data, and renders perfectly when the user later pipes it through `aio render`). Keep blocks small enough to be readable as JSON.
- **Never emit AIO without surrounding prose**. AIO blocks are dressing for a Markdown document, not a replacement for one.

## Hard Rules

- AIO block info strings must use `aio:name@major`.
- AIO block bodies must be valid JSON.
- Do not write JSON comments or trailing commas.
- Do not output HTML, CSS, JavaScript, iframe, style, event handlers, template expressions, or custom components.
- Do not include `<` or `>` in AIO string fields.
- AIO components in scope:
  - **stable**: `table@1`, `metric-cards@1`, `callout@1`
  - **candidate**: `chart@1`, `trend-card@1`, `status-grid@1`, `report-header@1`, `timeline@1`, `action-items@1`, `comparison@1`, `gauge@1`, `funnel@1`, `waterfall@1`, `heatmap@1`, `matrix@1`
- Do not invent new component names. When a content shape doesn't fit any listed component (diagrams, code diffs, etc.), fall back to plain Markdown.

## Components

### `aio:metric-cards@1`

```aio:metric-cards@1
{
  "items": [
    {
      "label": "Recommendation",
      "value": "Adopt",
      "note": "Fits v0.1 stable scope",
      "tone": "good"
    }
  ]
}
```

### `aio:callout@1`

```aio:callout@1
{
  "tone": "success",
  "title": "Final recommendation",
  "body": "Adopt AIO v0.1 for structured AI reports."
}
```

### `aio:table@1`

```aio:table@1
{
  "columns": ["Option", "Benefit", "Risk"],
  "rows": [
    ["Markdown", "Readable", "Weak interaction"],
    ["AIO", "Validated structure", "Requires runtime"]
  ]
}
```

### `aio:chart@1` (candidate)

Schema-constrained line, bar, area, pie, and donut charts. Pure data emission — no colours, no formatters, no interactivity. Use when a table would obscure the shape of trend / comparison / proportion data.

For line/bar/area, supply `x` (string labels) and `series` (each with `name` + numeric `data` of length equal to `x.length`). For pie/donut, supply `slices` (each with `label` + non-negative `value`).

```aio:chart@1
{
  "type": "line",
  "title": "Monthly active users",
  "yLabel": "MAU (k)",
  "x": ["Jan", "Feb", "Mar"],
  "series": [
    { "name": "Product A", "data": [120, 145, 162] },
    { "name": "Product B", "data": [80, 95, 110], "tone": "good" }
  ]
}
```

```aio:chart@1
{
  "type": "donut",
  "title": "Cost structure",
  "slices": [
    { "label": "Logistics", "value": 42 },
    { "label": "Marketing", "value": 28 },
    { "label": "Ops", "value": 18 },
    { "label": "Other", "value": 12 }
  ]
}
```

Constraints to respect:
- `type` is one of: `line`, `bar`, `area`, `pie`, `donut`.
- Numbers must be finite. `NaN`, `Infinity`, `-Infinity` are rejected.
- Up to 6 series and up to 50 x-axis points for line/bar/area; up to 12 slices for pie/donut.
- `tone` (optional) is one of `neutral` / `good` / `warn` / `bad` / `accent`. The renderer chooses the colour.
- No stacked variants, no scatter, no annotations, no log scale. If the data doesn't fit these primitives, fall back to a table.

### `aio:trend-card@1` (candidate)

Headline metrics with delta + sparkline. Use this — not `metric-cards@1` — whenever change matters (weekly / monthly / quarterly reports, KPI dashboards, business reviews).

- `items[].value`: number (preferred, formatted via `format`) or short string.
- `format`: one of `raw`, `number`, `percent`, `compact`, `currency:CCY` (ISO 4217). Rendered with the document locale.
- `delta`: `{ value, direction?, format?, label? }`. `direction` is `up` | `down` | `flat` (inferred from sign if omitted).
- `spark`: 2-60 finite numbers — small SVG trend.
- `tone`: `neutral` / `good` / `warn` / `bad`.
- Optional doc-level `asOf` stamp (top-right "data as of …").

### `aio:status-grid@1` (candidate)

State-of-the-world cards: service health, project portfolio, business line scorecards. Each `item` has `label`, `status` (`good`/`warn`/`bad`/`neutral`/`info`), optional headline `value`, and optional `note`. Up to 12 cards.

Use this when the question is "what's red?", not "how much did it move?". For change-over-time use `trend-card@1`.

### `aio:report-header@1` (candidate)

Hero block for formal reports. `title` required; optional `subtitle`, `period`, `author`, `status` (`draft`/`review`/`final`/`archived`), `dataAsOf`, `classification` (`public`/`internal`/`confidential`/`restricted`), and up to 6 extra `badges`.

**Markdown frontmatter shortcut**: instead of writing the block, you can put the metadata in a YAML frontmatter block at the very top of the markdown. The CLI prepends an `aio:report-header@1` block automatically:

```markdown
---
title: Q1 Business Review
period: 2026 Q1
author: Wang Xin
status: final
data-as-of: 2026-04-30
classification: internal
---

# 本周亮点
...
```

If both frontmatter and an explicit `aio:report-header@1` block exist, the frontmatter is ignored (no duplicates).

### `aio:timeline@1` (candidate)

Chronological events. Each `item` has `time` (free-form string), `title`, optional `body` and `tone` (`info`/`good`/`warn`/`bad`/`neutral`). Items render in source order — never sorted. Up to 30 items.

Use for: incident timelines, postmortems, weekly highlights, retrospective recap, release history.

### `aio:action-items@1` (candidate)

Follow-up lists. Each `item` has `task` plus optional `owner`, `due`, `status` (`todo`/`doing`/`done`/`blocked`), `priority` (`P0`–`P3`). Items where `due < today` and `status != done` auto-render with overdue highlight. Up to 30 items.

Use for: postmortem action items, retro next-steps, weekly TODOs, audit findings.

### `aio:comparison@1` (candidate)

Multi-option comparison matrix. `options` (2-6 strings) become columns; `criteria[]{ label, values, weight?, tone? }` are rows. Optional `recommended` matches one option and highlights its column with a green border + ★ badge. `values[]` length must equal `options[]` length (CLI enforces this).

Use for: solution selection, competitor comparison, vendor evaluation, RFP scorecard.

### `aio:gauge@1` (candidate)

KPI / OKR attainment gauges (semicircle arcs). `items[]{ label, value, target?, min?, max?, format?, tone?, note? }`. Up to 8 gauges. Auto-tone from progress vs target (good ≥ 90%, warn ≥ 70%, bad otherwise) unless `tone` is set. `format` accepts `percent`, `currency:CCY`, etc. and the value is locale-formatted.

Use for: KPI dashboards, OKR scorecards, capacity utilization, attainment progress.

### `aio:funnel@1` (candidate)

Conversion funnel. `stages[]{ label, value, tone?, note? }` (2-8 stages). Stage values must be monotonic non-increasing (CLI enforces). The runtime auto-computes "step" (vs previous) and "overall" (vs first) conversion percentages.

Use for: lead → customer funnels, signup → activation → paid, multi-step UX flows.

### `aio:waterfall@1` (candidate)

Additive/subtractive breakdown chart (P&L bridge). `bars[]{ label, value, kind, note? }` where kind ∈ `start | up | down | subtotal | end`. First bar must be `start`. `up`/`down` stack on the running total; `subtotal`/`end` reset to absolute zero baseline.

Use for: P&L bridge, variance analysis, attribution decomposition, period-over-period change explanation.

### `aio:heatmap@1` (candidate)

2D density grid. `xLabels[]` × `yLabels[]` (up to 32 × 32) plus a matching `rows[][]` of finite numbers. Cell opacity scales from 0.08 to 1.0 between min and max. `tone` picks the base color (`accent`/`good`/`warn`/`bad`/`neutral`).

Use for: orders by hour × day, sales by region × category, error rate by service × endpoint, retention cohort × week.

### `aio:matrix@1` (candidate)

2×2 quadrant analysis. Items plotted as labeled dots on an `[xMin, xMax]` × `[yMin, yMax]` plane (default 0–10). Optional `quadrants` array supplies 4 strings labeling top-left / top-right / bottom-left / bottom-right.

Use for: risk matrix (likelihood × impact), prioritization (impact × effort), BCG growth-share, RICE scores, employee performance.

## Output policy for the new components

Default report skeleton when the request looks like a structured business report:

1. **Frontmatter (or `aio:report-header@1`)** with title, period, author, status, dataAsOf.
2. **One paragraph** of prose framing (1–3 sentences).
3. **`aio:trend-card@1`** for headline metrics with WoW/MoM/YoY deltas.
4. **`aio:status-grid@1`** if multiple sub-units/services have separate state.
5. **`aio:chart@1` or `aio:table@1`** for detail data when needed.
6. **`aio:timeline@1`** for "what happened this period" or postmortem chronology.
7. **`aio:comparison@1`** for decision matrices.
8. **`aio:action-items@1`** for next-steps / follow-ups.
9. **`aio:callout@1`** for the final verdict / risk warning.

Picking between similar components:

| Want to show | Use |
|---|---|
| Static numbers | `metric-cards@1` |
| Numbers + delta + trend | `trend-card@1` |
| State (green/yellow/red) of items | `status-grid@1` |
| Row-shaped data | `table@1` |
| Side-by-side options on multiple criteria | `comparison@1` |
| Time-ordered events | `timeline@1` |
| Owned follow-ups with dates | `action-items@1` |
| Generic line/bar/area/pie/donut | `chart@1` |
| KPI/OKR attainment progress (semicircle) | `gauge@1` |
| Sequential conversion / drop-off | `funnel@1` |
| P&L bridge / variance / attribution | `waterfall@1` |
| 2D intensity grid | `heatmap@1` |
| Risk matrix / 2×2 prioritization | `matrix@1` |
| Final recommendation / verdict | `callout@1` |

## Reader-experience features available

Numbers in number-bearing components (`trend-card@1`, `gauge@1`, `funnel@1`, `waterfall@1`, `heatmap@1`) are locale-formatted via `Intl.NumberFormat` based on the document `lang`. When no `format` is supplied, numbers default to grouped digits with thousands separators (e.g. `13,620` not `13620`). Pass the right `lang` to the CLI (`--lang en` / `--lang zh-CN` / `--lang ja`) so currency separators and decimal marks render correctly. Use `format: "raw"` only when you explicitly do not want any formatting.

## Fenced code blocks (syntax highlight)

The runtime ships dark code blocks with a header bar (language tag + Copy button) and built-in syntax highlighting. **Just write fenced code as usual** — no special block type, no preload step. Highlighting is rendering-time only; it never changes block contents.

**Always inlined in the runtime** (zero extra fetch):
`json`, `bash` (`sh`/`shell`/`zsh`/`console`), `js` (`javascript`/`jsx`/`mjs`/`cjs`), `ts` (`typescript`/`tsx`), `python` (`py`), `yaml` (`yml`), `diff` (`patch`).

**Lazy-loaded from CDN on demand** (`assets/lang/<name>.js`, ~1–3 KB each, fetched the first time that language appears on a page; subsequent visits hit the browser cache):
`go` (`golang`), `rust` (`rs`), `php`, `ruby` (`rb`), `java`, `kotlin` (`kt`), `swift`, `c`, `cpp` (`c++`/`cxx`/`cc`/`hpp`), `csharp` (`cs`/`c#`), `sql` (`mysql`/`postgres`/`sqlite`/`plsql`/`tsql`), `html` (`htm`), `css`, `xml` (`svg`/`xhtml`/`xsl`/`rss`/`atom`/`plist`), `dockerfile` (`docker`/`containerfile`), `toml`, `ini` (`conf`/`cfg`/`properties`), `lua`, `perl` (`pl`/`pm`), `r` (`rscript`), `scala` (`sbt`), `dart`, `regex` (`regexp`/`re`), `graphql` (`gql`).

**`diff` blocks** also get line-level red/green/purple/blue treatment for `-`/`+`/`@@`/`+++/---` lines — useful in code-review style reports.

**`--inline-runtime` artifacts are still offline-friendly**: the CLI scans the markdown for code-block languages and inlines every non-builtin module it actually needs, so the resulting HTML opens via `file://` with no network calls. The complete language registry lives in `assets/lang/index.json`.

If a language isn't in either list, the block falls back to plain monospaced text — never an error.

## Local Tools

Validate a Markdown file:

```bash
node SKILL_DIR/scripts/aio.mjs validate report.md
```

Render a Markdown file. `--out` is optional and defaults to `report.html` next to the source:

```bash
node SKILL_DIR/scripts/aio.mjs render report.md
```

By default the rendered HTML references the runtime via jsDelivr CDN, so the file is portable:

```html
<script src="https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime@v0.4.3/assets/ai-output-runtime.js"></script>
```

For an offline / `file://`-friendly artifact, inline the runtime:

```bash
node SKILL_DIR/scripts/aio.mjs render report.md --inline-runtime
```

Override the runtime source (custom CDN or local path) when needed:

```bash
node SKILL_DIR/scripts/aio.mjs render report.md --runtime ./assets/ai-output-runtime.js
```

Prefer the CDN or `--inline-runtime` over copying `SKILL_DIR/assets/ai-output-runtime.js` by hand.

## When Writing Reports

Prefer this structure:

1. Markdown heading and one short prose summary (1–2 sentences, what this report is and why it exists).
2. `aio:metric-cards@1` for the headline numbers / status indicators.
3. `aio:table@1` for any comparison, finding list, or row-shaped data.
4. Plain Markdown sections for narrative context and analysis.
5. `aio:callout@1` for the final recommendation, verdict, or top-priority warning.

A good AIO report is **prose + structured slots**, not raw JSON walls. If you're emitting more than two AIO blocks in a row without prose between them, restructure.

## Trigger Examples

These natural requests should activate this skill:

- "生成一份月度财务报告 / monthly financial report"
- "出一份本周业务周报 / weekly business review"
- "做一份代码审查 / code review"
- "对比这几种方案 / compare these options"
- "总结一下昨天的数据 / summarize yesterday's data"
- "盘点一下当前进度 / status check"
- "复盘上周的事故 / incident postmortem"
- "做个安全审计 / security audit"
- "给我一个 dashboard / status overview"
- "评估一下风险 / risk assessment / 做个风险矩阵"
- "Q1 OKR 达成情况 / Q1 OKR scorecard"
- "看下销售转化漏斗 / build the conversion funnel"
- "做个 P&L 桥分析变动 / P&L bridge by segment"
- "按小时×星期看订单量分布 / orders by hour × day"
- "客户复购 cohort 分析 / customer cohort retention"
- "竞品/方案选型评分 / vendor scorecard"
- "下周行动项 / next steps with owners & due dates"

For any of the above, default to AIO blocks for the structured slots, not a wall of Markdown prose. Skip AIO and answer in plain prose for one-paragraph chat replies, code snippets, debugging help, or when the user explicitly asks for plain Markdown.

