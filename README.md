# AI Output Runtime (AIO)

> **Schema-validated JSON blocks for AI-generated reports.** Markdown stays the source. A ~38 KB safe runtime renders the visuals. The AI never writes HTML, CSS, or JavaScript.

[![CI](https://github.com/wxkingstar/ai-output-runtime/actions/workflows/ci.yml/badge.svg)](https://github.com/wxkingstar/ai-output-runtime/actions/workflows/ci.yml)
[![Version](https://img.shields.io/badge/aio-v0.2.0-2563eb)](https://github.com/wxkingstar/ai-output-runtime/releases/tag/v0.2.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![CDN](https://img.shields.io/badge/jsDelivr-CDN-orange)](https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime@v0.4.2/assets/ai-output-runtime.js)

🇬🇧 **English** · [🇨🇳 中文](README.zh-CN.md) · [🇯🇵 日本語](README.ja.md)

[**Live demo →**](https://wxkingstar.github.io/ai-output-runtime/)

<p align="center">
  <a href="https://wxkingstar.github.io/ai-output-runtime/">
    <img src="docs/screenshots/landing-light.png" alt="AIO landing page in light theme" width="720">
  </a>
</p>

---

## Why this exists

In May 2026, Thariq Shihipar from Anthropic's Claude Code team made a sharp argument: **HTML beats Markdown for agent output**. Richer reports, polished visuals, real dashboards. He's right about the upside.

But the argument forces a question — **who writes the HTML?**

If the AI writes it, every report is an attack surface: inline handlers, remote loads, opaque markup, diffs no human can review. If a human writes a fixed template, you lose the dynamism that made LLM output worth shipping in the first place.

AIO is the third path. **The AI emits data. A small runtime emits the HTML.**

The agent writes CommonMark Markdown plus four schema-validated JSON blocks — `table`, `metric-cards`, `callout`, `chart`. The runtime renders them safely. There is no surface where the AI controls executable code.

The discussion that sparked this:

- [Thariq Shihipar — Unreasonable effectiveness of HTML in Claude Code](https://thariqs.github.io/html-effectiveness/)
- [Simon Willison's note on the thread](https://simonwillison.net/2026/May/8/unreasonable-effectiveness-of-html/)
- [r/ClaudeCode discussion](https://www.reddit.com/r/ClaudeCode/comments/1t8vni3/html_markdown_for_claude_code_outputs_thariqs/)

## Try it in 30 seconds

Install as an agent skill (Claude Code, Codex, or any agent that loads skills from GitHub):

```bash
npx skills add wxkingstar/ai-output-runtime -g -y
```

Then ask in plain language: *"monthly status report"*, *"compare these options"*, *"summarize yesterday's data"*, *"do an audit"*. AIO blocks appear automatically when the content shape benefits from structure.

Render the agent's Markdown to a polished HTML report:

```bash
npx aio render report.md --inline-runtime
```

The output is a single self-contained `.html` you can email, archive, or open from `file://`. No build step, no server.

[**See it live →**](https://wxkingstar.github.io/ai-output-runtime/)

## What you get

| Status | Component | Use it for |
|---|---|---|
| stable | `aio:table@1` | rows × columns, comparisons, finding lists |
| stable | `aio:metric-cards@1` | headline KPIs, status snapshots, deltas |
| stable | `aio:callout@1` | conclusions, recommendations, warnings |
| candidate | `aio:chart@1` | line / bar / area / pie / donut |

<p align="center">
  <a href="https://wxkingstar.github.io/ai-output-runtime/demo-charts.html">
    <img src="docs/screenshots/charts-light.png" alt="aio:chart@1 — line, bar, area, pie, donut" width="720">
  </a>
</p>

Plus:

- **~38 KB runtime, zero dependencies** — one `<script>` tag, no bundler, no React/Vue lock-in
- **Light / dark theme** — auto via `prefers-color-scheme` or force via attribute
- **i18n** — `en` and `zh-CN` shipped; locale via `options.locale` or `<html lang>`
- **Print / PDF friendly** — `@media print` strips the chrome, forces light, avoids page breaks
- **CDN with optional SRI** — supply-chain hardened
- **MIT licensed, agent-agnostic** — works with Claude Code, Codex, or any agent

## Two ways to render

**1. CDN script tag** — drop one `<script>` into any page:

```html
<script src="https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime@v0.4.2/assets/ai-output-runtime.js"></script>
<div id="app"></div>
<script>
  AIOutputRuntime.render(markdown, { target: "#app", title: "My Report" });
</script>
```

For supply-chain integrity, pin with [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity). Generate the hash:

```bash
curl -s https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime@v0.4.2/assets/ai-output-runtime.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

**2. CLI** — produce a standalone `.html` (runtime inlined, no external dependencies):

```bash
node scripts/aio.mjs render report.md --inline-runtime --lang en --theme dark
```

## What an AIO report looks like

````md
# Q1 status

```aio:metric-cards@1
{
  "items": [
    { "label": "Revenue", "value": "$1.2M", "note": "+18% YoY", "tone": "good" },
    { "label": "Churn", "value": "3.1%", "note": "−0.4pp", "tone": "good" },
    { "label": "Open incidents", "value": "2", "tone": "warn" }
  ]
}
```

```aio:chart@1
{
  "type": "line",
  "title": "Monthly active users",
  "x": ["Jan", "Feb", "Mar"],
  "series": [{ "name": "MAU", "data": [120, 145, 162] }]
}
```

```aio:callout@1
{
  "tone": "success",
  "title": "Ready to scale to Q2",
  "body": "Three of four KPIs trending positive. One incident class to close out before scope expansion."
}
```
````

The runtime renders this into the polished page at the [live demo](https://wxkingstar.github.io/ai-output-runtime/). The Markdown stays diffable, the JSON stays validated, the page stays safe.

## What the AI cannot do (by design)

- Emit HTML, CSS, JavaScript, iframes, event handlers, template expressions, or custom components
- Override component colours, load remote schemas, register new components
- Include `<` or `>` in any string field
- Emit anything outside the four registered components

Invalid blocks degrade safely to a code block with a validation error. The full security boundary is in [`specs/01-security.md`](specs/01-security.md).

## For developers

- **Spec & schemas**: [`specs/`](specs/), [`schemas/`](schemas/), [`aio-registry.json`](aio-registry.json)
- **CLI**: `node scripts/aio.mjs validate report.md` · `node scripts/aio.mjs render report.md [--out PATH] [--inline-runtime] [--runtime URL] [--lang TAG] [--theme dark|light]`
- **Cross-field invariants** are enforced by the CLI validator (single source of truth). JSON schemas describe shape; see each schema's `description` field for the policy.
- **CHANGELOG**: [`CHANGELOG.md`](CHANGELOG.md)
- **Promo / launch copy**: [`docs/launch-kit.md`](docs/launch-kit.md)
- **Contributing**: [`CONTRIBUTING.md`](CONTRIBUTING.md). New stable components are intentionally rare.

## License

[MIT](LICENSE). Use it, fork it, embed it in commercial products. Attribution appreciated, not required.
