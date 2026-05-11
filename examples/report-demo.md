# AIO v0.1 渲染效果测试

下面是一份示例报告，演示 AI Output Runtime 三个稳定组件（metric-cards、callout、table）在 Markdown 中的混排效果。

```aio:metric-cards@1
{
  "items": [
    {
      "label": "规范版本",
      "value": "AIO v0.1",
      "note": "稳定核心三件套",
      "tone": "good"
    },
    {
      "label": "组件数量",
      "value": "3",
      "note": "table / metric-cards / callout",
      "tone": "neutral"
    },
    {
      "label": "JSON 校验",
      "value": "Pass",
      "note": "无注释、无尾逗号",
      "tone": "good"
    },
    {
      "label": "安全约束",
      "value": "Strict",
      "note": "禁用 HTML / JS / 模板表达式",
      "tone": "warn"
    }
  ]
}
```

## 组件对比

下表比较纯 Markdown 与 AIO 块在结构化场景中的差异。

```aio:table@1
{
  "columns": ["维度", "纯 Markdown", "AIO 块"],
  "rows": [
    ["可读性", "高", "高（JSON 略冗长）"],
    ["结构化渲染", "弱", "强（runtime 解析）"],
    ["类型校验", "无", "有（aio.mjs validate）"],
    ["交互能力", "无", "有限（取决于 runtime 版本）"],
    ["适用场景", "叙述、解释", "指标、对比、风险面板"]
  ]
}
```

## 使用建议

- 默认写 CommonMark，只在结构化展示有价值时使用 AIO 块。
- info string 必须严格写成 `aio:name@major`，body 必须是合法 JSON。
- 字符串字段不能包含 `<` 或 `>`，避免被误判为 HTML。
- 不确定是否需要组件时，直接退回到 Markdown。

```aio:callout@1
{
  "tone": "success",
  "title": "结论",
  "body": "AIO v0.1 适合作为结构化 AI 报告的输出契约：稳定三件套覆盖了指标、对比、提示三类高频场景，其余内容保留为标准 Markdown 即可。"
}
```
