There was a long thread a while back about whether AI should output HTML or Markdown for reports. Both sides had a point.

HTML party: Markdown can't show a funnel, a 2x2 risk matrix, a P&L bridge, a KPI gauge. You need real layout.

Markdown party: HTML from a language model is unsafe — prompted styles, injected event handlers, third-party iframes. Pick something you can audit byte-for-byte.

AIO is the third path. The AI writes Markdown with a small set of fenced JSON blocks. A 28 KB browser runtime renders them. The model literally never writes HTML, CSS, JS, iframes, or event handlers — string fields reject `<` and `>`, blocks must parse as JSON, every field is schema-checked twice (Node CLI for authoring, runtime for rendering).

A trend-card block from the weekly-report demo:

    ```aio:trend-card@1
    {
      "items": [
        {
          "label": "GMV",
          "value": 12345678,
          "format": "currency:CNY",
          "delta": { "value": 0.083, "format": "percent", "direction": "up" },
          "spark": [9.1, 9.6, 10.2, 11.1, 10.8, 11.7, 12.3],
          "tone": "good"
        }
      ]
    }
    ```

The runtime renders a metric card with ¥12,345,678.00, an upward green ▲ 8.3% chip, and a small sparkline. The AI never types HTML.

v0.4.3 ships 15 components covering the business-report shapes I kept running into:

* "what's the number?" → metric-cards, trend-card (with Δ + sparkline)
* "what's red?" → status-grid, callout
* "what changed?" → waterfall (P&L bridge), comparison matrix
* "how does it convert?" → funnel
* "are we hitting target?" → gauge (KPI/OKR semicircle)
* "where's the heat?" → heatmap (2D density)
* "what's the priority?" → matrix (2x2 quadrant)
* "what happened?" → timeline, action-items (with owner/due/priority)
* "header & sign-off" → report-header (auto-emitted from YAML frontmatter), callout

Plus 30 syntax-highlight language modules (6 inlined, 24 lazy-loaded from jsDelivr — first time a language is used, the browser fetches its ~1-2 KB module).

Three things that surprised me building it:

1. The contract really is small enough to memorize. 15 components fit on a half page of SKILL.md and the AI gets it on first try.

2. The locale-aware number formatting (`Intl.NumberFormat`) was the single highest-impact UX change. "13620" rendered as "13,620" is the difference between "data dump" and "report".

3. Print-to-PDF is unironically good. @page A4 + cover-page page-break-after on the report header + `page-break-before: always` on H1s gets you a stakeholder-emailable artifact for free.

Try the live demo — the page is itself an AIO document; click "View source" in the top bar to see the Markdown that produced it:

  https://wxkingstar.github.io/ai-output-runtime/

Two longer demos:

  https://wxkingstar.github.io/ai-output-runtime/demo-weekly.html (weekly review)
  https://wxkingstar.github.io/ai-output-runtime/demo-dashboard.html (Q1 review)

Repo (MIT): https://github.com/wxkingstar/ai-output-runtime

Installs into Claude Code, Codex, Cursor, and ~50 other agents via:

  npx skills add wxkingstar/ai-output-runtime -g -y

Three specific things I'd love feedback on:

1. **Which report shape doesn't fit any of the 15 components.** I think waterfall/funnel/matrix cover 80% of what I needed in production, but I know I have blind spots. If you ship reports from an agent and a shape is missing, tell me which one and what data you have.

2. **Does the skill's description over-fire?** The trigger vocabulary is broad (weekly/monthly/dashboard/postmortem/audit/KPI/OKR/funnel/waterfall/heatmap/matrix/...). If you try this and the skill activates when you didn't want it to, that's the most useful data I can get.

3. **Print/PDF rendering edge cases.** A4 / Letter / Legal? Two-column? RTL? If you hit a layout problem when actually trying to email a printed report, please open an issue with the screenshot — I optimized for the cases I could test (zh-CN A4 dark mode → print) and there are definitely gaps.

(Also: the runtime is one file, 121 KB raw / 28 KB gzipped, no deps. The schema for each component is in `schemas/*.schema.json`. The CLI is in `scripts/aio.mjs`. The whole thing is browseable in under an hour.)
