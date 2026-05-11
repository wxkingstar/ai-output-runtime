# Launch Kit

## One-line Pitch

AIO is a small, strict output contract for AI-generated reports: Markdown for prose, JSON blocks for structured data, and a safe runtime for rendering.

## Short Description

AI Output Runtime v0.1 gives AI agents a safer middle path between Markdown and generated HTML. Agents write CommonMark plus schema-validated `aio:*@1` JSON blocks. A tiny runtime renders tables, metric cards, and callouts without executing AI-generated HTML, CSS, or JavaScript.

## Background

This project was motivated by the recent discussion started by Thariq Shihipar from Anthropic's Claude Code team, who argued for the "unreasonable effectiveness" of asking Claude Code to generate HTML instead of Markdown. That argument is right about the upside: HTML is much better for rich reports, dashboards, interactive explanations, and long-form reviews.

AIO is a middle path in that debate. It keeps Markdown as the source of truth, but lets agents emit a small number of schema-validated JSON blocks that render like polished report components. The AI does not write HTML, CSS, or JavaScript.

## Links

- GitHub: https://github.com/wxkingstar/ai-output-runtime-g
- Demo: https://wxkingstar.github.io/ai-output-runtime-g/
- CDN: https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime-g@v0.1.1/assets/ai-output-runtime.js
- Install: `npx skills add wxkingstar/ai-output-runtime-g -y`

## X / Twitter

I open-sourced `ai-output-runtime-g`: a tiny AIO v0.1 skill/runtime for structured AI reports.

It is a response to the recent "HTML instead of Markdown for Claude Code output" discussion from Anthropic's Thariq Shihipar.

Markdown stays the source. Structured sections use strict JSON blocks like `aio:table@1`. The runtime renders them safely without executing AI-generated HTML/CSS/JS.

Install:
`npx skills add wxkingstar/ai-output-runtime-g -y`

Demo: https://wxkingstar.github.io/ai-output-runtime-g/
GitHub: https://github.com/wxkingstar/ai-output-runtime-g

## Hacker News / Reddit

Title:

```text
Show HN: AIO, a small output contract for AI-generated reports
```

Body:

```text
I built a small experiment around a middle path between Markdown and AI-generated HTML.

Context: Thariq Shihipar from Anthropic's Claude Code team recently made the case for asking Claude Code to generate HTML instead of Markdown. I agree with the upside: HTML is a much better final reading surface for long reports, dashboards, and interactive explanations. But I wanted to keep Markdown's reviewability and avoid letting the model generate arbitrary HTML/CSS/JS.

The idea: keep AI output as CommonMark, but allow a few schema-validated JSON blocks:

- aio:metric-cards@1
- aio:callout@1
- aio:table@1

A runtime renders those blocks into a report UI. The AI never writes HTML/CSS/JS, and invalid blocks degrade safely.

Install as an agent skill:
npx skills add wxkingstar/ai-output-runtime-g -y

Demo: https://wxkingstar.github.io/ai-output-runtime-g/
Repo: https://github.com/wxkingstar/ai-output-runtime-g

I am specifically looking for feedback on the protocol boundary: whether the stable block set is too small, too large, or the wrong abstraction.
```

## LinkedIn

I open-sourced an experiment called AI Output Runtime v0.1.

It was motivated by the recent discussion from Anthropic's Claude Code team around HTML being a better final output format than Markdown for many agent workflows.

It is a small protocol for AI-generated reports:

- Markdown remains the source format.
- Structured sections use schema-validated JSON blocks.
- A browser runtime renders tables, metric cards, and callouts.
- AI-generated HTML, CSS, and JavaScript are explicitly out of scope.

The goal is to make AI output easier to read and share without losing reviewability, safety, and long-term maintainability.

GitHub: https://github.com/wxkingstar/ai-output-runtime-g
Demo: https://wxkingstar.github.io/ai-output-runtime-g/

## Product Hunt

Name:

```text
AI Output Runtime
```

Tagline:

```text
Structured AI reports without AI-generated HTML
```

Description:

```text
AI Output Runtime is a small protocol and runtime for AI-generated reports. Agents write CommonMark plus strict JSON blocks such as aio:table@1, aio:metric-cards@1, and aio:callout@1. The browser runtime renders those blocks safely, while the source remains readable and diffable Markdown.
```

## Chinese Post

我开源了一个小实验：AI Output Runtime v0.1。

背景是最近 Anthropic Claude Code 团队成员 Thariq Shihipar 提出的一个很火的观点：让 Claude Code 输出 HTML，而不是默认输出 Markdown。这个观点有道理，尤其是复杂报告、图表、dashboard、交互说明，用 HTML 作为最终阅读界面确实更强。

它想解决一个很具体的问题：AI 输出复杂报告时，纯 Markdown 不够好读，但让 AI 直接写 HTML/CSS/JS 又不好审查、不安全、也不利于长期维护。

我的中间路线是：

- 普通内容仍然是 CommonMark。
- 结构化内容用 `aio:*@1` JSON block。
- Runtime 负责渲染和交互。
- AI 不写 HTML/CSS/JS。

安装：

```bash
npx skills add wxkingstar/ai-output-runtime-g -y
```

Demo: https://wxkingstar.github.io/ai-output-runtime-g/
GitHub: https://github.com/wxkingstar/ai-output-runtime-g

现在 v0.1 只稳定了三个组件：`table`、`metric-cards`、`callout`。欢迎拍砖，尤其是协议边界和组件集合。
