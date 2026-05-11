# ai-output-runtime-g

Claude Code / agent skill for AI Output Runtime v0.1.

AIO keeps AI output as readable CommonMark Markdown, while allowing selected structured sections to render through strict JSON blocks:

- `aio:table@1`
- `aio:metric-cards@1`
- `aio:callout@1`

Install:

```bash
npx skills add wxkingstar/ai-output-runtime-g -y
```

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
<script src="https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime-g@v0.1.0/assets/ai-output-runtime.js"></script>
```

Then render AIO Markdown:

```html
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
