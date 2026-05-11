# ai-output-runtime-g

Agent-agnostic skill for AI Output Runtime v0.1 — works with Claude Code, Codex, and any agent that loads skills from GitHub.

[![CI](https://github.com/wxkingstar/ai-output-runtime-g/actions/workflows/ci.yml/badge.svg)](https://github.com/wxkingstar/ai-output-runtime-g/actions/workflows/ci.yml)
[![Version](https://img.shields.io/badge/aio-v0.1.1-2563eb)](https://github.com/wxkingstar/ai-output-runtime-g/releases/tag/v0.1.1)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**A small, strict output contract for AI-generated reports: Markdown for prose, JSON blocks for structured data, and a safe runtime for rendering.**

- Install as a skill into any agent that loads GitHub skills.
- Render with one CDN script (or inline for offline / `file://`).
- Validate with a zero-dependency CLI.
- Avoid AI-generated HTML, CSS, JavaScript, or ad-hoc DSLs.

AIO keeps AI output as readable Markdown (a pragmatic CommonMark subset — headings, paragraphs, lists, code blocks, inline emphasis), while allowing selected structured sections to render through strict JSON blocks:

- `aio:table@1`
- `aio:metric-cards@1`
- `aio:callout@1`

Install:

```bash
npx skills add wxkingstar/ai-output-runtime-g -y
```

Live demo:

[https://wxkingstar.github.io/ai-output-runtime-g/](https://wxkingstar.github.io/ai-output-runtime-g/)

After installation, ask:

```text
按 AIO v0.1 输出一份方案评审。
```

or:

```text
把这份内容整理成 AI Output Runtime 格式。
```

The skill instructs the agent to output CommonMark Markdown plus stable AIO blocks:

- `aio:table@1`
- `aio:metric-cards@1`
- `aio:callout@1`

## Runtime CDN

Use the latest `main` branch during development:

```html
<script src="https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime-g@main/assets/ai-output-runtime.js"></script>
```

Use the immutable version tag in production:

```html
<script src="https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime-g@v0.1.1/assets/ai-output-runtime.js"></script>
```

For supply-chain integrity, add a Subresource Integrity hash. Generate it with:

```bash
curl -s https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime-g@v0.1.1/assets/ai-output-runtime.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

Then pin the hash in the script tag:

```html
<script
  src="https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime-g@v0.1.1/assets/ai-output-runtime.js"
  integrity="sha384-<paste-hash-here>"
  crossorigin="anonymous"></script>
```

Alternatively, ship the runtime inline (no external dependency) with the CLI:

```bash
node scripts/aio.mjs render report.md --inline-runtime
```

Then render AIO Markdown:

```html
<script src="https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime-g@v0.1.1/assets/ai-output-runtime.js"></script>
<div id="app"></div>
<script>
  AIOutputRuntime.render(markdown, {
    target: "#app",
    title: "AI Output"
  });
</script>
```

## Included Files

- `SKILL.md`: Agent instructions.
- `assets/ai-output-runtime.js`: Browser runtime.
- `schemas/*.schema.json`: JSON schemas.
- `specs/*.md`: Protocol and component specs.
- `scripts/aio.mjs`: Validator and renderer.
- `examples/*.md`: Valid and invalid fixtures.
- `aio-registry.json`: Stable block registry.

## Validate

```bash
node scripts/aio.mjs validate examples/valid-v0.1.md
node scripts/aio.mjs validate examples/invalid-html.md
```

The second command should fail because HTML is not allowed in AIO string fields.

## Render

```bash
# Default: writes valid-v0.1.html next to the source, runtime via jsDelivr CDN
node scripts/aio.mjs render examples/valid-v0.1.md

# Pick an output path
node scripts/aio.mjs render examples/valid-v0.1.md --out dist/valid.html

# Inline the runtime so the HTML works offline / via file://
node scripts/aio.mjs render examples/report-demo.md --inline-runtime --out dist/report-demo.html

# Point at a different runtime source (custom CDN or local path)
node scripts/aio.mjs render report.md --runtime ./assets/ai-output-runtime.js
```

## AIO Example

````md
# Report

```aio:metric-cards@1
{
  "items": [
    {
      "label": "Status",
      "value": "Ready",
      "note": "Valid AIO v0.1",
      "tone": "good"
    }
  ]
}
```

```aio:callout@1
{
  "tone": "success",
  "title": "Recommendation",
  "body": "Use AIO when the output benefits from structured rendering."
}
```
````

## Security Boundary

AIO v0.1 does not allow AI-generated HTML, CSS, JavaScript, iframe, event handlers, template expressions, custom components, or remote schemas. Invalid blocks must degrade safely.

See [specs/01-security.md](specs/01-security.md).

## Why This Exists

In May 2026, Thariq Shihipar from Anthropic's Claude Code team sparked a broader discussion around using Claude Code to generate HTML instead of Markdown for agent outputs. The argument is compelling: HTML can produce richer reports, interactive documents, dashboards, and review surfaces than long linear Markdown files.

But the counterargument is also real: AI-generated HTML is harder to diff, harder to review, less pleasant to edit by hand, and creates a larger safety boundary when agents generate markup, styles, and scripts directly.

This project is a middle path.

There is a useful middle path between plain Markdown and AI-generated HTML:

| Approach | Good at | Weak at |
|---|---|---|
| Markdown | readable, editable, diffable | structured rendering and interaction |
| AI-generated HTML | visual output and one-off tools | review, safety, long-term maintenance |
| AIO | readable source plus validated rendering | requires a small runtime |

AIO v0.1 intentionally ships only three stable blocks. The goal is not to become MDX; the goal is to give agents a minimum reliable protocol for structured reports.

Further reading:

- [Thariq Shihipar's HTML effectiveness demo](https://thariqs.github.io/html-effectiveness/)
- [Simon Willison's note on the discussion](https://simonwillison.net/2026/May/8/unreasonable-effectiveness-of-html/)
- [Reddit discussion in r/ClaudeCode](https://www.reddit.com/r/ClaudeCode/comments/1t8vni3/html_markdown_for_claude_code_outputs_thariqs/)

## Launch Kit

See [docs/launch-kit.md](docs/launch-kit.md) for launch posts, short descriptions, and community-specific copy.
