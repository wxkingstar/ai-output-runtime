---
name: ai-output-runtime-g
description: Use when the output is a structured report for humans — comparisons, conclusions/recommendations, status overviews, metric summaries, risk lists, audit findings, or anything the user would want to scan rather than read linearly. Triggers on natural requests like 生成报告 / 做一份分析 / 对比一下 / 总结结论 / 状态盘点 / 复盘 / 审查 / 审计 / dashboard / report / analysis / review / audit / comparison / status / summary, and on explicit mentions of AIO / AI Output Runtime / aio:name@major. Also use when validating or rendering AIO Markdown. Compatible with Claude Code, Codex, and other agents that install skills from GitHub.
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
  - **candidate**: `chart@1` (line / bar / area / pie / donut — data only, no styling overrides)
- Do not invent new component names. When a content shape doesn't fit any listed component (timelines, diagrams, code diffs, etc.), fall back to plain Markdown.

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
<script src="https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime-g@v0.2.1/assets/ai-output-runtime.js"></script>
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
- "做一份代码审查 / code review"
- "对比这几种方案 / compare these options"
- "总结一下昨天的数据 / summarize yesterday's data"
- "盘点一下当前进度 / status check"
- "复盘上周的事故 / incident postmortem"
- "做个安全审计 / security audit"
- "给我一个 dashboard / status overview"
- "评估一下风险 / risk assessment"

For any of the above, default to AIO blocks for the structured slots, not a wall of Markdown prose.

