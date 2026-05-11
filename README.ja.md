# AI Output Runtime (AIO)

> **AI 生成レポート向けの「データ契約」。** Markdown はソースのまま。約 38 KB の安全なランタイムが描画を担当します。AI は HTML、CSS、JavaScript を一切書きません。

[![CI](https://github.com/wxkingstar/ai-output-runtime/actions/workflows/ci.yml/badge.svg)](https://github.com/wxkingstar/ai-output-runtime/actions/workflows/ci.yml)
[![Version](https://img.shields.io/badge/aio-v0.2.0-2563eb)](https://github.com/wxkingstar/ai-output-runtime/releases/tag/v0.2.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![CDN](https://img.shields.io/badge/jsDelivr-CDN-orange)](https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime@v0.4.3/assets/ai-output-runtime.js)

[🇬🇧 English](README.md) · [🇨🇳 中文](README.zh-CN.md) · 🇯🇵 **日本語**

[**ライブデモ →**](https://wxkingstar.github.io/ai-output-runtime/)

<p align="center">
  <a href="https://wxkingstar.github.io/ai-output-runtime/">
    <img src="docs/screenshots/landing-light.png" alt="AIO ライトテーマのランディング" width="720">
  </a>
</p>

---

## なぜこのプロジェクトが必要か

2026 年 5 月、Anthropic Claude Code チームの Thariq Shihipar が鋭い主張を投げかけました——**エージェントの出力は Markdown より HTML が優れている**。確かにそのとおりで、HTML のほうがリッチなレポート、洗練されたビジュアル、本格的なダッシュボードを作れます。

しかしこの議論は避けて通れない問いを残します——**その HTML は誰が書くのか？**

**AI が書く** なら、すべてのレポートが攻撃面になります。インラインハンドラ、リモート読み込み、レビュー不能なマークアップ、人間が diff できない差分。一方で **人がテンプレートを書く** なら、LLM 出力の魅力である動的さが失われます。

AIO は第三の道です。**AI はデータを出力し、ランタイムが HTML を描画します。**

エージェントは CommonMark の Markdown と、スキーマ検証済みの 4 つの JSON ブロック——`table`、`metric-cards`、`callout`、`chart`——を書きます。ランタイムはそれらを安全に描画します。AI が実行可能コードを制御できる面は一切存在しません。

きっかけとなった議論：

- [Thariq Shihipar — Unreasonable effectiveness of HTML in Claude Code](https://thariqs.github.io/html-effectiveness/)
- [Simon Willison による議論メモ](https://simonwillison.net/2026/May/8/unreasonable-effectiveness-of-html/)
- [r/ClaudeCode のディスカッション](https://www.reddit.com/r/ClaudeCode/comments/1t8vni3/html_markdown_for_claude_code_outputs_thariqs/)

## 30 秒で試す

エージェントの skill としてインストール（Claude Code、Codex、GitHub から skill を読み込むあらゆるエージェントで動作）：

```bash
npx skills add wxkingstar/ai-output-runtime -g -y
```

あとは自然言語で依頼するだけ——*「月次レポートを作って」*、*「これらの選択肢を比較して」*、*「昨日のデータを要約して」*、*「監査をして」*。コンテンツが構造化に向く形であれば、AIO ブロックが自動的に現れます。

エージェントの Markdown を整った HTML レポートに描画：

```bash
npx aio render report.md --inline-runtime
```

出力は単一の自己完結型 `.html`——メール添付、アーカイブ、`file://` での直接オープンが可能です。ビルドステップもサーバも不要。

[**実例を見る →**](https://wxkingstar.github.io/ai-output-runtime/)

## 含まれるもの

| ステータス | コンポーネント | 用途 |
|---|---|---|
| stable | `aio:table@1` | 行 × 列、比較、項目リスト |
| stable | `aio:metric-cards@1` | 主要 KPI、ステータス概要、差分 |
| stable | `aio:callout@1` | 結論、推奨、警告 |
| candidate | `aio:chart@1` | line / bar / area / pie / donut |

<p align="center">
  <a href="https://wxkingstar.github.io/ai-output-runtime/demo-charts.html">
    <img src="docs/screenshots/charts-light.png" alt="aio:chart@1 — 5 種類のチャート" width="720">
  </a>
</p>

加えて：

- **~38 KB ランタイム、依存ゼロ**——`<script>` 一つで完結、React/Vue ロックインなし、bundler 不要
- **ライト / ダークの両テーマ**——`prefers-color-scheme` に自動追従、または属性で強制
- **i18n**——`en` と `zh-CN` を同梱。`options.locale` または `<html lang>` で切り替え
- **印刷 / PDF 対応**——`@media print` でクロムを隠し、ライトに固定、ページ分割を抑制
- **CDN + 任意の SRI**——サプライチェーン検証可能
- **MIT、エージェント中立**——Claude Code でも Codex でも

## 2 つの描画方法

**1. CDN script タグ**——任意のページに `<script>` を 1 行：

```html
<script src="https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime@v0.4.3/assets/ai-output-runtime.js"></script>
<div id="app"></div>
<script>
  AIOutputRuntime.render(markdown, { target: "#app", title: "レポート" });
</script>
```

サプライチェーンの整合性が必要なら [Subresource Integrity](https://developer.mozilla.org/ja/docs/Web/Security/Subresource_Integrity) でピン留め：

```bash
curl -s https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime@v0.4.3/assets/ai-output-runtime.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

**2. CLI**——ランタイムをインライン化した自己完結 `.html` を生成：

```bash
node scripts/aio.mjs render report.md --inline-runtime --lang en --theme dark
```

## AIO レポートの実際の中身

````md
# Q1 状況

```aio:metric-cards@1
{
  "items": [
    { "label": "売上", "value": "¥1.2 億", "note": "前年同期 +18%", "tone": "good" },
    { "label": "解約率", "value": "3.1%", "note": "−0.4pp", "tone": "good" },
    { "label": "未解決インシデント", "value": "2", "tone": "warn" }
  ]
}
```

```aio:chart@1
{
  "type": "line",
  "title": "月間アクティブユーザー",
  "x": ["1月", "2月", "3月"],
  "series": [{ "name": "MAU", "data": [120, 145, 162] }]
}
```

```aio:callout@1
{
  "tone": "success",
  "title": "Q2 拡大に進む準備が整いました",
  "body": "主要 KPI 4 つのうち 3 つが好調。スコープ拡大の前に、未解決インシデントを 1 件クローズしてください。"
}
```
````

ランタイムはこの Markdown を [デモサイト](https://wxkingstar.github.io/ai-output-runtime/) のような洗練されたレポートに描画します。Markdown は diff 可能なまま、JSON は検証済み、ページは安全。

## AI ができないこと（設計上の制約）

- HTML、CSS、JavaScript、iframe、イベントハンドラ、テンプレート式、カスタムコンポーネントを出力できない
- コンポーネントの色を上書きできない、リモートスキーマを読み込めない、新しいコンポーネントを登録できない
- 文字列フィールドに `<` や `>` を含められない
- 登録された 4 つ以外のコンポーネントを出力できない

無効なブロックは検証エラーを表示するコードブロックに安全に降格されます。詳細なセキュリティ境界は [`specs/01-security.md`](specs/01-security.md) を参照。

## 開発者向け

- **仕様 & スキーマ**：[`specs/`](specs/) · [`schemas/`](schemas/) · [`aio-registry.json`](aio-registry.json)
- **CLI**：`node scripts/aio.mjs validate report.md` · `node scripts/aio.mjs render report.md [--out PATH] [--inline-runtime] [--runtime URL] [--lang TAG] [--theme dark|light]`
- **クロスフィールド不変条件**は CLI バリデータが単一の真実の源として強制します。JSON スキーマは構造のみを記述し、詳細は各スキーマの `description` フィールドにあります。
- **CHANGELOG**：[`CHANGELOG.md`](CHANGELOG.md)
- **プロモ / launch kit**：[`docs/launch-kit.md`](docs/launch-kit.md)
- **コントリビューション**：[`CONTRIBUTING.md`](CONTRIBUTING.md)。Stable コンポーネントの追加は意図的に稀です。

## ライセンス

[MIT](LICENSE)。商用利用、フォーク、商用製品への組み込み、いずれも可能。Attribution は歓迎しますが必須ではありません。
