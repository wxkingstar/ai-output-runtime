A while back there was a long thread here about whether Claude should output HTML or Markdown for reports. I built a third path — let Claude emit **Markdown with a small set of fenced JSON blocks**, and a 28 KB browser runtime renders the blocks. Claude literally never writes HTML, CSS, JS, event handlers, or `<style>`/`<script>`/`<iframe>` — the schema rejects `<` and `>` in every string field.

I just shipped v0.4.3 and figured I owed an update to this sub specifically, since that thread is what kicked it off.

**What you can ask Claude to make:**

| Ask | Component(s) |
|-----|--------------|
| Weekly / monthly / quarterly review | `report-header` + `trend-card` + `status-grid` + `timeline` + `action-items` |
| Postmortem / incident timeline | `timeline` + `action-items` + `callout` |
| KPI / OKR scorecard | `gauge` (semicircle, auto-tone from progress vs target) |
| P&L bridge / variance | `waterfall` (start/up/down/subtotal/end) |
| Sales / signup funnel | `funnel` (auto step% + overall%) |
| Inventory / logistics heatmap | `heatmap` (2D, up to 32×32) |
| Risk matrix / RICE / BCG | `matrix` (2×2 quadrant) |
| Vendor / option comparison | `comparison` (multi-criteria + recommended column) |

15 components total (3 stable + 12 candidates). 30 syntax-highlight languages in code blocks (6 inlined, 24 lazy-loaded — 28 KB runtime supports them all).

**A trend-card looks like this in the Markdown Claude emits:**

    ```aio:trend-card@1
    {
      "items": [{
        "label": "GMV",
        "value": 12345678,
        "format": "currency:CNY",
        "delta": { "value": 0.083, "format": "percent", "direction": "up" },
        "spark": [9.1, 9.6, 10.2, 11.1, 10.8, 11.7, 12.3],
        "tone": "good"
      }]
    }
    ```

The runtime renders a metric card with ¥12,345,678.00, an upward ▲ 8.3% chip, and a small SVG sparkline. The model emits data; the runtime renders pixels.

**Reader-facing UX**

- Executive Summary card auto-built from the first callout + first metric block (10-second exec view).
- Locale-aware number formatting (千分位, currency, percent — all default; no `format: number` needed).
- Sticky TOC with active-section highlight on screens ≥ 1200px.
- Print-to-PDF: report-header becomes a cover page, each H1 forces a page break.
- CSV export button on every data component.

**Skill install (drops into Claude Code, Codex, Cursor, ~50 others):**

```bash
npx skills add wxkingstar/ai-output-runtime -g -y
```

Once installed, Claude routes to it when you say things like *"out a Q1 review"* / *"复盘上周的事故"* / *"build a sales funnel for last month"* / *"评估一下风险"*. The trigger vocabulary covers the common business-report verbs in EN/CN/JA.

**Try it**

- Live demo (the page is itself an AIO doc — click *View source* to see the Markdown): https://wxkingstar.github.io/ai-output-runtime/
- Weekly review demo: https://wxkingstar.github.io/ai-output-runtime/demo-weekly.html
- Q1 dashboard demo: https://wxkingstar.github.io/ai-output-runtime/demo-dashboard.html

**Repo (MIT):** https://github.com/wxkingstar/ai-output-runtime

**Three asks for this sub specifically:**

1. **Which business-report shape doesn't fit any of the 15 components?** waterfall/funnel/matrix cover most of what I needed in production but I know I have blind spots. If you ship reports from Claude and the shape is missing, tell me what data you have.

2. **Does the skill over-fire or under-fire?** The trigger description was just broadened in v0.4.2 — if Claude activates AIO when you wanted prose (or vice versa), that's the most useful data point I can get.

3. **For folks using Claude in production reports:** the biggest pain point you've hit. I keep guessing at this and want real signal.

(Also happy to take pull requests. The whole runtime is one file you can read in an hour: `assets/ai-output-runtime.js`.)
