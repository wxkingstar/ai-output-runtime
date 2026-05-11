# AI Output Runtime v0.1

A small, strict output contract for AI-generated reports. Markdown for prose. Validated JSON blocks for structured data. A safe runtime for rendering. No AI-generated HTML, CSS, or JavaScript on the page.

```aio:metric-cards@1
{
  "items": [
    {
      "label": "Stable components",
      "value": "3",
      "note": "table / metric-cards / callout",
      "tone": "good"
    },
    {
      "label": "Candidate components",
      "value": "1",
      "note": "chart (line / bar / area / pie / donut)",
      "tone": "neutral"
    },
    {
      "label": "Runtime size",
      "value": "~38 KB",
      "note": "Single file, zero dependencies",
      "tone": "good"
    },
    {
      "label": "AI surface area",
      "value": "Data only",
      "note": "No HTML, no callbacks, no script attrs",
      "tone": "good"
    }
  ]
}
```

```aio:chart@1
{
  "type": "line",
  "title": "Adoption trend (illustrative)",
  "subtitle": "Hypothetical agent installs per week",
  "yLabel": "installs",
  "x": ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
  "series": [
    { "name": "Claude Code", "data": [40, 95, 180, 290, 410, 530, 660, 800] },
    { "name": "Codex", "data": [20, 55, 110, 175, 250, 330, 420, 510], "tone": "good" }
  ]
}
```

## Why this exists

LLMs that need to deliver structured reports for humans face a forced binary today. Plain Markdown reads well but cannot highlight a recommendation, surface a metric, or compare options side-by-side. AI-generated HTML can do all of that, but every report becomes a fresh attack surface: arbitrary scripts, remote loads, inline handlers, opaque markup.

AIO is the middle path. AI writes normal Markdown for prose, and emits strictly typed JSON inside three stable fenced blocks for structured slots. The renderer is fixed code; the AI never touches it.

```aio:table@1
{
  "title": "Approach comparison",
  "columns": ["Approach", "Strengths", "Weaknesses"],
  "rows": [
    ["Plain Markdown", "Readable, diffable, ubiquitous", "Cannot highlight, summarize, or compare"],
    ["AI-generated HTML", "Visually rich, interactive", "Hard to review, security risk, harder to maintain"],
    ["AIO", "Validated structure with portable rendering", "Requires a small runtime; intentionally narrow component set"]
  ]
}
```

## How to use it

### 1. Install as an agent skill

```text
npx skills add wxkingstar/ai-output-runtime -g -y
```

Works with Claude Code, Codex, and any agent that loads skills from GitHub. After installation, ask for a report in plain language: `generate a monthly status report`, `compare these three options`, `summarize yesterday's data`. The agent emits AIO blocks where structure helps.

### 2. Render in the browser

```text
<script src="https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime@v0.4.2/assets/ai-output-runtime.js"></script>
<div id="app"></div>
<script>
  AIOutputRuntime.render(markdown, { target: "#app", title: "Report" });
</script>
```

For supply-chain safety, add a Subresource Integrity hash, or inline the runtime with `aio render report.md --inline-runtime` for a fully offline artifact.

### 3. Validate at the boundary

```text
node scripts/aio.mjs validate report.md
```

The CLI rejects HTML in any string field, unknown component names, and oversized inputs. Use it in CI to catch malformed AI output before it reaches a human.

## What AIO refuses to do

```aio:callout@1
{
  "tone": "warning",
  "title": "AI cannot inject code paths",
  "body": "AIO blocks accept data, not configuration objects. No JS callbacks, no HTML in string fields, no remote schema loading, no custom components. Anything outside the three stable shapes degrades to a plain JSON code block with a visible validation error."
}
```

## Try it

This page is itself an AIO document. Click `View source` in the top bar to see the Markdown that produced it. Toggle the theme button to switch between light and dark. The header buttons are the entire UI — everything else is the report.

```aio:callout@1
{
  "tone": "success",
  "title": "Ready to ship a report",
  "body": "Write your report as Markdown, drop in a metric-cards block for the headlines and a callout for the verdict, and validate with the CLI. The contract is small enough to remember; the runtime is small enough to inline. The agent ecosystem is the distribution channel."
}
```

## More demos

- [Chart showcase](./demo-charts.html) — every `aio:chart@1` variant in one page.
- [Chinese-locale report demo](./demo-zh.html) — the same renderer, `zh-CN` locale, dark/light toggle.

For the spec, schemas, and changelog, see the [GitHub repository](https://github.com/wxkingstar/ai-output-runtime).
