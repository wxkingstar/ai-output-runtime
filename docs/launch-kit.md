# Launch Kit — AIO v0.2

Ready-to-paste copy for every launch channel. The **sequencing** lives in [`launch-plan.md`](launch-plan.md). Screenshots are in [`screenshots/`](screenshots/).

---

## Core assets

- **Tagline**: Schema-validated JSON blocks for AI-generated reports. The AI emits data. A 38 KB runtime emits the HTML.
- **One-liner**: A safe middle path between Markdown and AI-generated HTML for LLM reports.
- **Repo**: https://github.com/wxkingstar/ai-output-runtime
- **Live demo**: https://wxkingstar.github.io/ai-output-runtime/
- **CDN**: https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime@v0.4.3/assets/ai-output-runtime.js
- **Install (as agent skill)**: `npx skills add wxkingstar/ai-output-runtime -g -y`
- **Hero screenshot**: `docs/screenshots/landing-light.png`
- **Charts showcase**: `docs/screenshots/charts-light.png`
- **Dark mode**: `docs/screenshots/landing-dark.png`

---

## Background story (use in all long-form posts)

In May 2026, Thariq Shihipar from Anthropic's Claude Code team made a sharp argument: HTML beats Markdown for agent output. Richer reports, polished visuals, real dashboards. He's right about the upside. But the argument forces a question — **who writes the HTML?**

If the AI writes it, every report is an attack surface. If a human writes a template, you lose the dynamism. AIO is the third path: **AI emits data, a 38 KB runtime emits the HTML.**

Discussion:
- https://thariqs.github.io/html-effectiveness/
- https://simonwillison.net/2026/May/8/unreasonable-effectiveness-of-html/
- https://www.reddit.com/r/ClaudeCode/comments/1t8vni3/

---

## Hacker News

**Title** (one of these — pick whichever feels least try-hard the day of):

```text
Show HN: AIO — a safe middle path between Markdown and AI-generated HTML
```

```text
Show HN: AI emits data, runtime emits HTML — a 38 KB output contract for LLM reports
```

**URL**: https://github.com/wxkingstar/ai-output-runtime

**First comment (post it within 2 minutes of submission)**:

```text
Author here. Quick context for anyone who didn't see Thariq Shihipar's "unreasonable effectiveness of HTML in Claude Code" thread in May: the argument was that HTML output beats Markdown for agent reports. He's right about the upside — but I kept asking myself "who writes the HTML?"

If the AI writes it, every report is an attack surface (inline handlers, remote loads, opaque markup, no human-reviewable diff).
If a human writes a fixed template, you lose the dynamism that made LLM output worth shipping.

AIO is the third path. The agent writes CommonMark Markdown plus four schema-validated JSON blocks (table, metric-cards, callout, chart). A 38 KB runtime renders them safely. There is no surface where the AI controls executable code.

Live demo: https://wxkingstar.github.io/ai-output-runtime/
Repo: https://github.com/wxkingstar/ai-output-runtime

Specifically looking for feedback on:
1. Is the four-component set the right minimum? Too narrow? Too wide?
2. Is "candidate" vs "stable" lifecycle (with breaking changes only at major) the right discipline?
3. Are there integrations (MCP server, VS Code preview, react/vue bindings) the community would actually use?
```

---

## Reddit

### r/ClaudeCode — reply to the original Thariq thread

URL of thread to reply to: https://www.reddit.com/r/ClaudeCode/comments/1t8vni3/html_markdown_for_claude_code_outputs_thariqs/

**Reply**:

```text
Saw this thread back in May and the question stuck with me — not HTML vs Markdown, but "who writes the HTML?" Spent the last weeks building a middle path.

AIO: agent writes CommonMark + 4 schema-validated JSON blocks (table, metric-cards, callout, chart). A 38 KB runtime renders them safely. The AI never touches HTML/CSS/JS.

Demo: https://wxkingstar.github.io/ai-output-runtime/
Install as Claude Code skill: `npx skills add wxkingstar/ai-output-runtime -g -y`
Source: https://github.com/wxkingstar/ai-output-runtime

Curious what r/ClaudeCode thinks of the component set. Specifically whether 4 is too few, and whether the candidate / stable lifecycle (no breaking changes within a major version) is the right discipline.
```

### r/programming — fresh post

**Title**:

```text
AIO — schema-validated JSON blocks for AI-generated reports
```

**Body**: same as the HN first-comment, slightly trimmed.

### r/LLMDevs

**Title**:

```text
A small contract for getting structured reports out of LLMs, without letting them write HTML
```

**Body**: focus on the agent integration angle (Claude Code, Codex, agent-skill ecosystem).

---

## X / 𝕏 (English)

### Thread — 4 posts

**Post 1 (hook):**

```text
@thariqshihipar argued HTML beats Markdown for Claude Code's output.

He's right about the upside.

But it raises a question: who writes the HTML — the AI or the runtime?

I built the runtime path.

🧵
```

**Post 2 (story + tag):**

```text
The Thariq / @simonw / @AnthropicAI discussion in May was about output format.

The deeper question was: how much code do you let the AI generate?

AIO's answer: zero. The AI emits data. A 38 KB runtime emits the HTML.

CommonMark + 4 validated JSON blocks. That's the whole protocol.
```

**Post 3 (proof, attach `charts-light.png`):**

```text
Four components — table, metric-cards, callout, chart.

The chart renderer is pure SVG, 600 lines, no chart-library dependency. Line / bar / area / pie / donut.

AI emits {type, x, series}. The renderer picks the colors, axes, ticks.

[attach: docs/screenshots/charts-light.png]
```

**Post 4 (CTA):**

```text
Install as agent skill (Claude Code, Codex, any GitHub-skill agent):

  npx skills add wxkingstar/ai-output-runtime -g -y

Or drop one <script> tag from jsDelivr CDN.

Live demo: https://wxkingstar.github.io/ai-output-runtime/
Source: https://github.com/wxkingstar/ai-output-runtime

MIT. v0.2. Feedback welcome.
```

---

## X / 𝕏 (Japanese)

### Single-post version (高密度)

```text
"AI が HTML を書くか、ランタイムが HTML を書くか" — Anthropic Claude Code チームの Thariq 氏が投げかけた議論への、私の答え。

AIO: エージェントが Markdown + 4 つのスキーマ検証済み JSON ブロックを出力。38 KB のランタイムが安全に描画。AI は HTML/CSS/JS を一切書きません。

デモ: https://wxkingstar.github.io/ai-output-runtime/
リポ: https://github.com/wxkingstar/ai-output-runtime
README: https://github.com/wxkingstar/ai-output-runtime/blob/main/README.ja.md

エージェント skill としてインストール:
npx skills add wxkingstar/ai-output-runtime -g -y

MIT、v0.2、コンポーネントは 4 つだけ（table / metric-cards / callout / chart）。
```

---

## X / 𝕏 (Chinese)

### 短帖

```text
Thariq（Anthropic Claude Code 团队）发起的"HTML vs Markdown for agent output"讨论引出一个问题：HTML 到底是谁写——AI 还是 runtime？

AIO 是 runtime 路径。Agent 输出 Markdown + 4 个 schema 校验过的 JSON 块。38 KB runtime 安全渲染。AI 完全不碰 HTML/CSS/JS。

Demo: https://wxkingstar.github.io/ai-output-runtime/
Repo: https://github.com/wxkingstar/ai-output-runtime
中文 README: https://github.com/wxkingstar/ai-output-runtime/blob/main/README.zh-CN.md

装成 agent skill：
npx skills add wxkingstar/ai-output-runtime -g -y

MIT、v0.2、表/卡/提示/图共 4 个稳定组件。
```

---

## Product Hunt

**Product name**: `AI Output Runtime`

**Tagline** (≤ 60 chars):

```text
Structured AI reports — without AI-generated HTML
```

**Description**:

```text
AIO is a tiny output contract for AI-generated reports. Your agent writes CommonMark Markdown plus four schema-validated JSON blocks — table, metric-cards, callout, chart. A 38 KB safe runtime renders them. The AI never writes HTML, CSS, or JavaScript.

Why it matters
- Most "AI writes HTML" approaches turn every report into an attack surface (inline handlers, remote loads, opaque markup, undiffable changes).
- Most "human writes the template" approaches throw away the dynamism that makes LLM output valuable.
- AIO is the middle path: AI emits validated data, a fixed runtime emits HTML. Markdown stays the source of truth; structure stays schema-checked; the rendering surface stays small.

What you get
- Four components: table, metric-cards, callout, chart (line / bar / area / pie / donut)
- ~38 KB runtime, zero dependencies
- Light / dark dual theme, prefers-color-scheme aware
- English + Chinese built-in i18n, print-friendly stylesheet
- CDN with optional Subresource Integrity, or inline-runtime for offline
- MIT licensed, agent-agnostic — works with Claude Code, Codex, any GitHub-skill agent

This launches into the discussion started by Thariq Shihipar (Anthropic Claude Code team) and Simon Willison about whether agents should output HTML or Markdown. AIO is the third path.
```

**Categories**: Developer Tools · Artificial Intelligence · Open Source

**Maker comment (post immediately after launch)**:

```text
Maker here. The whole project came out of a real question: when @thariqshihipar argued HTML beats Markdown for Claude Code's output, he was right about the upside, but he raised an uncomfortable follow-up — who writes that HTML?

I built the answer where neither the AI nor a human template writes the HTML. A small fixed runtime does, and the AI just hands it validated data.

Feedback I'm most interested in:
1. Is four components the right minimum stable set, or am I missing a critical shape?
2. Should the candidate-stable lifecycle stay strict, or is the community fine with faster expansion?
3. What integrations would make AIO 10× more useful — MCP server, VS Code preview, framework bindings, hosted preview service?
```

---

## 知乎 (Zhihu, 中文长帖)

**标题**：

```text
让 AI 写 HTML 还是写 Markdown？我做了第三条路：AI Output Runtime
```

**正文**：

```markdown
2026 年 5 月，Anthropic Claude Code 团队成员 Thariq Shihipar 抛出一个挺尖锐的观点：让 Claude Code 输出 HTML 比 Markdown 更合适。理由很硬——HTML 能做更丰富的报告、能上 dashboard、视觉精致，Markdown 比起来确实弱。

Simon Willison 还专门写过一篇 note 跟进这场讨论：https://simonwillison.net/2026/May/8/unreasonable-effectiveness-of-html/

我看完之后一直在想一个问题：**HTML 到底是谁写？**

如果是 **AI 写**——那每份报告就是一份攻击面。内联事件、远程加载、不可审查的 markup、人类没法 diff 的变更。审计部门一看就皱眉。

如果是 **人写模板**——你把 LLM 最值钱的那块（动态性、内容驱动的结构）扔了。

我花了几周做了第三条路：**AI 输出数据，runtime 输出 HTML**。叫 AI Output Runtime (AIO)。

## 协议

Agent 写 CommonMark Markdown + 四个 schema 校验过的 JSON 块：

- `aio:table@1`——行/列结构数据
- `aio:metric-cards@1`——核心 KPI / 状态总览
- `aio:callout@1`——结论 / 警告 / 推荐
- `aio:chart@1`——line / bar / area / pie / donut（candidate）

就这四个。Stable 组件升级很罕见，这是项目纪律不是 bug。

## 安全边界

- AI 不能输出 HTML、CSS、JavaScript、iframe、事件 handler、模板表达式
- 字符串字段不能含 `<` 或 `>`
- 数字必须是有限实数（NaN / Infinity 拒绝）
- 颜色由 runtime 控制，AI 无法 override
- 不能加载远程 schema、不能注册新组件

非法 block 会安全降级为带校验错误的代码块。

## Runtime

~38 KB，零依赖，纯 SVG 图表，明暗双主题（跟随系统或属性强制），多语言（中英内置），打印友好。

```html
<script src="https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime@v0.4.3/assets/ai-output-runtime.js"></script>
```

也可以 inline 完全离线：`npx aio render report.md --inline-runtime`。

## 装成 agent skill

```bash
npx skills add wxkingstar/ai-output-runtime -g -y
```

之后用自然语言提需求："做一份月度业绩报告"、"对比这几个方案"、"总结昨天的数据"——agent 自动产 AIO 块。

## Demo

在线 demo：https://wxkingstar.github.io/ai-output-runtime/
GitHub: https://github.com/wxkingstar/ai-output-runtime
中文 README: https://github.com/wxkingstar/ai-output-runtime/blob/main/README.zh-CN.md

## 不试图做什么

- 不做 MDX——动态计算、组件嵌套、复杂交互都不接
- 不做 ECharts 那种"可视化平台"——AI 只能 emit 数据，不能 emit 库配置
- 不做完整 markdown parser——CommonMark 子集足够 cover 报告场景

## 想听的反馈

1. 四个组件够不够？哪个内容形状你常用但 AIO 没覆盖？
2. candidate / stable lifecycle 节奏对吗？还是太保守了？
3. 接下来想看什么：MCP server？VS Code preview？React/Vue 绑定？hosted preview 服务？

MIT 协议、agent 中立、欢迎拍砖。
```

---

## 即刻 (Jike) / V2EX (中文短帖)

```text
开源了 ai-output-runtime：AI 输出报告的协议层。

背景：5 月 Anthropic Claude Code 的 Thariq 提出"HTML 比 Markdown 适合 agent 输出"，但留下一个问题——HTML 是 AI 写还是 runtime 写？

AIO 选 runtime 写。Agent 输出 Markdown + 4 个 JSON 块（表格/卡片/提示/图表），38KB runtime 渲染。AI 完全不碰 HTML/CSS/JS。

装成 Claude Code / Codex 的 skill：
npx skills add wxkingstar/ai-output-runtime -g -y

Demo: https://wxkingstar.github.io/ai-output-runtime/
Source: https://github.com/wxkingstar/ai-output-runtime
```

---

## Qiita (日本長文)

**タイトル**：

```text
AI に HTML を書かせる？ それともランタイムに書かせる？ — AI Output Runtime (AIO) を作りました
```

**本文**：

```markdown
2026 年 5 月、Anthropic Claude Code チームの Thariq Shihipar 氏がこんな主張をしました——**エージェントの出力は Markdown より HTML が優れている**。リッチなレポート、洗練されたビジュアル、本格的なダッシュボード。彼の言うとおり、HTML の上限は確かに高い。

Simon Willison 氏もこの議論についてメモを書いています:
https://simonwillison.net/2026/May/8/unreasonable-effectiveness-of-html/

しかし、この議論にはひとつ避けて通れない問いがあります——**HTML は誰が書くのか？**

**AI が書く** なら、すべてのレポートが攻撃面になります。インラインハンドラ、リモート読み込み、レビュー不能なマークアップ、人間が diff できない差分。

**人がテンプレートを書く** なら、LLM 出力の魅力である動的さが失われます。

数週間かけて第三の道を作りました——**AI はデータを出力し、ランタイムが HTML を描画する**。これを AI Output Runtime (AIO) と呼んでいます。

## プロトコル

エージェントは CommonMark Markdown と、スキーマ検証済みの 4 つの JSON ブロックを書きます:

- `aio:table@1` — 行 × 列、比較、項目リスト
- `aio:metric-cards@1` — 主要 KPI、ステータス概要
- `aio:callout@1` — 結論、推奨、警告
- `aio:chart@1` — line / bar / area / pie / donut（candidate）

これだけ。Stable コンポーネントの追加は意図的に稀です。

## セキュリティ境界

- AI は HTML、CSS、JavaScript、iframe、イベントハンドラ、テンプレート式を出力できない
- 文字列フィールドに `<` や `>` を含められない
- 数値は有限実数のみ（NaN / Infinity は拒否）
- 色はランタイム制御、AI からは上書き不可
- リモートスキーマ読み込み不可、カスタムコンポーネント登録不可

無効ブロックは検証エラー付きのコードブロックに安全に降格されます。

## ランタイム

約 38 KB、依存ゼロ、純粋な SVG チャート、ライト / ダーク両テーマ、多言語（英語と中国語を同梱）、印刷対応。

```html
<script src="https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime@v0.4.3/assets/ai-output-runtime.js"></script>
```

完全オフラインなら inline 可能: `npx aio render report.md --inline-runtime`。

## エージェント skill としてインストール

```bash
npx skills add wxkingstar/ai-output-runtime -g -y
```

その後は自然言語で依頼するだけ——「月次レポート」「比較」「要約」「監査」。エージェントが自動的に AIO ブロックを出力します。

## デモ

ライブデモ: https://wxkingstar.github.io/ai-output-runtime/
GitHub: https://github.com/wxkingstar/ai-output-runtime
日本語 README: https://github.com/wxkingstar/ai-output-runtime/blob/main/README.ja.md

## やらないこと

- MDX のような動的計算やコンポーネントネストは扱わない
- ECharts のような可視化プラットフォーム化はしない (AI はデータのみ出力し、ライブラリ設定を出力しない)
- 完全な Markdown パーサは実装しない (レポート用途には CommonMark のサブセットで十分)

## フィードバックを募集

1. 4 つのコンポーネントで足りますか？ よく使うが AIO にない形は？
2. candidate / stable のライフサイクル運用は適切ですか？
3. 次に欲しいのは: MCP サーバ？ VS Code プレビュー？ React/Vue バインディング？ ホスト型プレビューサービス？

MIT、エージェント中立、フィードバック歓迎。
```

---

## Zenn (日本語 短文版)

**タイトル**:

```text
AI Output Runtime — エージェント生成レポートのためのスキーマ検証された出力契約
```

**サマリー**:

```text
Anthropic Claude Code チームの Thariq Shihipar 氏が投げかけた「HTML vs Markdown for agent output」という議論への第三の答え。AI はデータを出力し、38KB のランタイムが HTML を描画する。
```

---

## 内 部 WeChat 群消息 (短)

```text
开源了一个小项目 AIO，AI 报告的协议层：
- AI 写 Markdown + 4 个 JSON 块（表/卡/提示/图）
- 38KB runtime 安全渲染，AI 不碰 HTML/CSS/JS
- 装成 Claude Code/Codex 的 skill 直接用

Demo: https://wxkingstar.github.io/ai-output-runtime/
Repo: https://github.com/wxkingstar/ai-output-runtime
中文 README: https://github.com/wxkingstar/ai-output-runtime/blob/main/README.zh-CN.md

帮看一眼 + star 一下，多谢
```

---

## LinkedIn (英文 短文版)

```text
I open-sourced AI Output Runtime (AIO) — a small contract for getting structured reports out of LLMs without letting them write HTML.

The project started from a real discussion in the AI community: Thariq Shihipar (Anthropic Claude Code team) argued that HTML output beats Markdown for agent reports. He's right about the upside, but it raised a question: who writes the HTML?

If the AI writes it, your report is an attack surface. If a human writes a template, you lose dynamism.

AIO is the third path: AI emits validated data, a 38 KB runtime emits the HTML. Four components (table, metric cards, callout, chart). MIT, agent-agnostic, works with Claude Code, Codex, or any GitHub-skill agent.

Live demo: https://wxkingstar.github.io/ai-output-runtime/
GitHub: https://github.com/wxkingstar/ai-output-runtime

I'd love feedback from anyone building agent skills or report tooling.
```
