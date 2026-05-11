# `aio:chart@1` (candidate)

Status: **candidate** — may change before promotion to stable. New optional fields may be added in minor versions; breaking changes require `aio:chart@2`.

## Purpose

Communicate trends, comparisons, or proportions in AI-generated reports. Use when a table would obscure the shape of the data.

- **Trend over time** → `type: "line"` or `type: "area"`
- **Comparison across categories** → `type: "bar"` (grouped if multiple series)
- **Proportions of a whole** → `type: "pie"` or `type: "donut"`

If the data is just a handful of labelled numbers, prefer `aio:metric-cards@1`. If the data is row-shaped, prefer `aio:table@1`.

## Schema summary

```json
{
  "type": "line | bar | area | pie | donut",
  "title": "Optional plain-text title",
  "subtitle": "Optional plain-text subtitle",
  "caption": "Optional plain-text caption shown under the chart",
  "xLabel": "Optional plain-text X-axis label",
  "yLabel": "Optional plain-text Y-axis label",
  "x": ["category labels, only for line/bar/area"],
  "series": [
    { "name": "Series name", "data": [numbers...], "tone": "optional" }
  ],
  "slices": [
    { "label": "Slice label", "value": 123, "tone": "optional" }
  ]
}
```

### Discriminator

| `type` | Required fields | Ignored fields |
|---|---|---|
| `line`, `bar`, `area` | `x`, `series` | `slices` |
| `pie`, `donut` | `slices` | `x`, `series`, `xLabel`, `yLabel` |

### Hard rules

- `type` is required.
- For `line`/`bar`/`area`:
  - `x` must contain 1–50 string labels.
  - `series` must contain 1–6 entries.
  - Each `series[i].data` array length must equal `x.length`.
  - Each `series[i].data[j]` must be a finite real number (`NaN`, `Infinity`, `-Infinity` are rejected).
- For `pie`/`donut`:
  - `slices` must contain 1–12 entries.
  - Each `slices[i].value` must be a finite non-negative number.
  - At least one slice must have `value > 0`.
- All string fields reject `<` and `>` characters and enforce the documented `maxLength`.
- `tone` is an enum: `"neutral" | "good" | "warn" | "bad" | "accent"`. The renderer maps tone to a colour from the active theme.

### What is intentionally excluded

To preserve the AI-emits-data-only contract, the schema rejects:

- Free-form colour values (palette is renderer-controlled).
- Format strings or formatter callbacks.
- HTML in any string field.
- Annotation overlays, threshold lines, secondary axes, log scale, custom tick formatters.
- Stacked variants (line/area/bar). Will be considered for `aio:chart@1.1` or a separate component.
- Scatter, bubble, heatmap, radar, candlestick, gauge.
- Animation, tooltips, hover state, click handlers.

If a report needs anything in this list, fall back to a `aio:table@1` with the underlying numbers, or to inline Markdown.

## Examples

### Line chart (multi-series)

```aio:chart@1
{
  "type": "line",
  "title": "Monthly active users",
  "subtitle": "Q1 2026",
  "x": ["Jan", "Feb", "Mar"],
  "yLabel": "MAU (k)",
  "series": [
    { "name": "Product A", "data": [120, 145, 162] },
    { "name": "Product B", "data": [80, 95, 110], "tone": "good" }
  ]
}
```

### Bar chart (grouped)

```aio:chart@1
{
  "type": "bar",
  "title": "Revenue by region",
  "x": ["NA", "EU", "APAC"],
  "yLabel": "USD (M)",
  "series": [
    { "name": "Q1", "data": [12.4, 8.1, 6.5] },
    { "name": "Q2", "data": [13.2, 9.0, 7.8] }
  ]
}
```

### Area chart (single series)

```aio:chart@1
{
  "type": "area",
  "title": "Cumulative signups",
  "x": ["W1", "W2", "W3", "W4"],
  "series": [
    { "name": "Signups", "data": [120, 280, 470, 690] }
  ]
}
```

### Pie / donut

```aio:chart@1
{
  "type": "pie",
  "title": "Revenue mix Q1",
  "slices": [
    { "label": "EC", "value": 1200 },
    { "label": "Brand", "value": 800 },
    { "label": "Global", "value": 450 }
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

## Renderer contract

The reference renderer at `assets/ai-output-runtime.js` produces inline SVG with:

- Colours drawn from CSS variables `--ai-chart-1` through `--ai-chart-6`; tone overrides map to `--ai-good`, `--ai-warn`, `--ai-bad`, `--ai-accent`.
- Dark/light theme inherited from the document's `data-ai-theme` attribute.
- No JavaScript embedded in the chart output — pure SVG markup.
- Long axis labels truncate with an ellipsis rather than overflow or rotate (rotation deferred to a future minor revision).

Third-party renderers must accept the same data shape and may render however they wish. Cross-renderer visual differences are expected; the data contract is what is stable.
