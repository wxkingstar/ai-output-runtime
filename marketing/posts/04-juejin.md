半年前 r/ClaudeCode 上吵过：让 AI 写业务报告，HTML 还是 Markdown？两边都对——HTML 不安全，Markdown 表达不出 KPI 仪表 / 漏斗 / P&L 桥。

我做了第三条路：**AI 只输出 Markdown + JSON 数据块**，28KB 浏览器 runtime 负责把数据安全渲染。AI 一行 HTML/CSS/JS 都不写。

## 一个 funnel 例子

    ```aio:funnel@1
    {
      "title": "Q1 销售漏斗",
      "stages": [
        { "label": "曝光", "value": 12800000 },
        { "label": "点击", "value": 1840000 },
        { "label": "加购", "value": 320000 },
        { "label": "下单", "value": 4500 },
        { "label": "支付完成", "value": 60 }
      ]
    }
    ```

CLI 校验通过（`node scripts/aio.mjs validate file.md`），浏览器 runtime 渲染成 5 条水平条 + 自动算每段环比和累计转化率：环比 14.4% / 17.4% / 1.4% / 1.3%，累计 100% / 14.4% / 2.5% / 0.04% / 0.0005%。

## 一个 waterfall（P&L 桥）例子

    ```aio:waterfall@1
    {
      "title": "Q1 P&L Bridge",
      "format": "currency:CNY",
      "bars": [
        { "label": "Revenue", "value": 420000000, "kind": "start" },
        { "label": "COGS",    "value": -260000000, "kind": "down" },
        { "label": "Gross",   "value":  160000000, "kind": "subtotal" },
        { "label": "OpEx",    "value":  -88000000, "kind": "down" },
        { "label": "Net",     "value":   72000000, "kind": "end" }
      ]
    }
    ```

5 根柱：start 蓝、down 红、subtotal 蓝、down 红、end 蓝，柱间虚线连表示累计。schema 强制：第一根必须是 `start`，up/down 在前一根的 cumulative 上叠加，subtotal/end 重置到 0 基线。

## v0.4.x 的 15 个组件

| 业务场景 | 组件 |
|---|---|
| 周报 / 月报 / 业务汇报 | `report-header` + `trend-card` + `status-grid` + `timeline` + `action-items` |
| Postmortem / 复盘 | `timeline` + `action-items` + `callout` |
| KPI / OKR 达成 | `gauge` |
| 财务 P&L | `waterfall` |
| 销售漏斗 | `funnel` |
| 运营时段 / 库存周转 | `heatmap` |
| 风险评估 / RICE / BCG | `matrix` |
| 方案选型 / 竞品 | `comparison` |
| 数据汇总 | `metric-cards` / `trend-card` / `table` |
| 结论 / 警告 | `callout` |

每个组件都有 JSON Schema，CLI 校验跨字段不变量（funnel 单调非增、matrix 边界、waterfall 第一根 start 等）。

## 30 语言代码高亮（lazy load）

6 内置（json / bash / js+ts / python / yaml / diff）+ 24 lazy-loaded（go / rust / php / ruby / java / kotlin / swift / c / cpp / csharp / sql / html / css / xml / dockerfile / toml / ini / lua / perl / r / scala / dart / regex / graphql）。runtime 28 KB gzipped，首次出现某语言时浏览器从 jsDelivr 拉 ~1-2 KB 模块。

## Reader UX

- 自动 Executive Summary 卡（10 秒看懂）
- 数字默认 `Intl.NumberFormat` 千分位 + 货币 + 百分比
- Sticky TOC + 当前章节高亮
- 打印封面 + H1 分页 → PDF
- CSV 一键导出

## 装到 Claude Code / Codex / Cursor

```bash
npx skills add wxkingstar/ai-output-runtime -g -y
```

之后 Claude 看到"出一份月报" / "Q1 OKR 复盘" / "做个销售漏斗"自动激活。

## 在线 demo

主页：https://wxkingstar.github.io/ai-output-runtime/

业务 demo：
- 周报：https://wxkingstar.github.io/ai-output-runtime/demo-weekly.html
- Q1 Dashboard：https://wxkingstar.github.io/ai-output-runtime/demo-dashboard.html

页面本身就是一份 AIO 文档，点顶栏「查看源稿」看原始 Markdown。

## 想 fork 二次开发

runtime 是单文件 `assets/ai-output-runtime.js`（121 KB raw / 28 KB gzipped，零依赖），一个小时能逐段读完。每个组件的 schema 在 `schemas/*.schema.json`，CLI 校验逻辑在 `scripts/aio.mjs`。

## 仓库

GitHub（MIT）：https://github.com/wxkingstar/ai-output-runtime
skills.sh：https://skills.sh/wxkingstar/ai-output-runtime

欢迎提 issue 说还有哪些业务报告场景没覆盖到。
