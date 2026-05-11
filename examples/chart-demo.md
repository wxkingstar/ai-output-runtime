# Chart Showcase

A walkthrough of every `aio:chart@1` variant. This component is a **candidate** in v0.2 — schema is final, may receive optional fields before promotion to stable.

## Line — multi-series trend

```aio:chart@1
{
  "type": "line",
  "title": "Monthly active users",
  "subtitle": "Q1 2026",
  "yLabel": "MAU (k)",
  "x": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  "series": [
    { "name": "Product A", "data": [120, 145, 162, 175, 198, 230] },
    { "name": "Product B", "data": [80, 95, 110, 132, 158, 184], "tone": "good" },
    { "name": "Target", "data": [150, 150, 175, 175, 200, 200], "tone": "accent" }
  ]
}
```

## Bar — grouped comparison

```aio:chart@1
{
  "type": "bar",
  "title": "Revenue by region",
  "subtitle": "Q1 vs Q2 2026",
  "yLabel": "USD (M)",
  "x": ["NA", "EU", "APAC", "LATAM"],
  "series": [
    { "name": "Q1", "data": [12.4, 8.1, 6.5, 2.3] },
    { "name": "Q2", "data": [13.2, 9.0, 7.8, 2.9] }
  ]
}
```

## Area — cumulative trend

```aio:chart@1
{
  "type": "area",
  "title": "Cumulative signups",
  "x": ["W1", "W2", "W3", "W4", "W5", "W6"],
  "series": [
    { "name": "Signups", "data": [120, 280, 470, 690, 920, 1180] }
  ]
}
```

## Pie — revenue mix

```aio:chart@1
{
  "type": "pie",
  "title": "Revenue mix Q1",
  "slices": [
    { "label": "EC", "value": 1200 },
    { "label": "Brand", "value": 800 },
    { "label": "Global", "value": 450 },
    { "label": "Other", "value": 180 }
  ]
}
```

## Donut — cost structure

```aio:chart@1
{
  "type": "donut",
  "title": "Cost structure",
  "subtitle": "FY26 actuals",
  "slices": [
    { "label": "Logistics", "value": 42, "tone": "warn" },
    { "label": "Marketing", "value": 28 },
    { "label": "Ops", "value": 18 },
    { "label": "R&D", "value": 12 }
  ]
}
```

```aio:callout@1
{
  "tone": "info",
  "title": "What charts do not include",
  "body": "By design, AIO chart blocks accept data only: no formatter callbacks, no colour overrides, no stacked variants, no annotations, no interactivity. If a report needs those, fall back to a plain Markdown table with the underlying numbers, or use a separate visualization tool."
}
```
