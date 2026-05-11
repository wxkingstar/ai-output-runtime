半年前、r/ClaudeCode と X で長い議論がありました：「AI にレポートを書かせるなら、HTML を出力させるべきか、Markdown だけにすべきか」。

両方とも一理あります：

- **HTML 派**：チャート、KPI ゲージ、ファネル、2×2 リスク行列 — Markdown では表現できない。
- **Markdown 派**：HTML は危険。プロンプト注入で `<style>`、`<script>`、`<iframe>` が混入したら終わり。

僕は第 3 の道を実装しました：**AI には「データ」だけ書かせて、小さなランタイムがそれを安全に HTML に変換する**。

このプロジェクトを AI Output Runtime（AIO）と呼んでいます。最新版は v0.4.3 です。

## 契約の最小例

AI が Markdown 内に書く fenced code block：

    ```aio:trend-card@1
    {
      "items": [{
        "label": "GMV",
        "value": 12345678,
        "format": "currency:JPY",
        "delta": { "value": 0.083, "format": "percent", "direction": "up" },
        "spark": [9.1, 9.6, 10.2, 11.1, 10.8, 11.7, 12.3],
        "tone": "good"
      }]
    }
    ```

ブラウザは 28 KB のランタイム（CDN から `<script>` 一行）を読み込み、この JSON を：

> **GMV** ￥12,345,678 ▲ 8.3%（前週比）
> 📈 sparkline 付き

として描画します。AI は HTML/CSS/JS を一切書きません。

## v0.4 の 15 コンポーネント

| 何のレポート | どのコンポーネント |
|---|---|
| 週報 / 月報 / 四半期レビュー | `report-header` + `trend-card` + `status-grid` + `timeline` + `action-items` |
| ポストモーテム / 振り返り | `timeline` + `action-items` + `callout` |
| KPI / OKR 達成率ダッシュボード | `gauge`（半円メーター、進捗で自動着色） |
| 損益計算書（P&L）ブリッジ | `waterfall`（start / up / down / subtotal / end） |
| 売上ファネル / 登録活性化分析 | `funnel`（自動でステップ % + 累計 %） |
| 時間帯ヒートマップ / 在庫回転 | `heatmap`（最大 32×32 グリッド） |
| リスク評価 / RICE / BCG 優先順位 | `matrix`（2×2 散布図） |
| 案件選定 / 競合比較 | `comparison`（複数選択肢 × 複数評価軸） |
| 最終判断 / 推奨 / 警告 | `callout` |

各コンポーネントには独立した JSON Schema があり、CLI 側でクロスフィールド不変条件（funnel の単調非増加、matrix 座標境界、waterfall の `start` 必須など）を強制します。

## セキュリティ境界

- すべての string フィールドは `<` と `>` を拒否（ランタイム + CLI 二重チェック）
- block は valid JSON 必須（コメント、trailing comma 拒否）
- 未登録のコンポーネント名は可視 JSON エラーにフォールバック（XSS にならない）
- ランタイム本体に `fetch` 呼び出しなし。唯一のネットワーク要求はコードハイライト用の lang/*.js 遅延ロード（URL ホワイトリスト：`https://cdn.jsdelivr.net/gh/...`）

## コードブロックハイライトも内蔵、30 言語

6 言語インライン（json / bash / js+ts / python / yaml / diff）+ 24 言語遅延ロード（go / rust / php / ruby / java / kotlin / swift / c / cpp / csharp / sql / html / css / xml / dockerfile / toml / ini / lua / perl / r / scala / dart / regex / graphql）。ランタイム本体は 28 KB gzipped のまま。

## Reader UX

- **自動エグゼクティブサマリーカード**：最初の callout と最初の trend-card を抽出して、レポート先頭に 10 秒で読める折りたたみカードを挿入
- **Locale 対応の数値フォーマット**：`Intl.NumberFormat` で千区切り / 通貨 / パーセンテージを自動切り替え（zh-CN / en / ja）
- **Sticky TOC + アクティブセクション強調**：1200px 以上の画面で右側に固定
- **印刷時の表紙ページ**：`@page` A4 + report-header が表紙化、H1 ごとに改ページ
- **CSV エクスポート**：全てのデータコンポーネントに ⤓ ボタン

## Claude Code / Codex / Cursor へのインストール

```bash
npx skills add wxkingstar/ai-output-runtime -g -y
```

インストール後、「週報を書いて」「Q1 OKR 振り返り」「営業ファネルを作って」などの自然な依頼で自動的にスキルが起動します。

## ライブデモ

このデモページ自体が AIO ドキュメントです（上部の「View source」をクリックすると生成元の Markdown が見えます）：

https://wxkingstar.github.io/ai-output-runtime/

業務レポートのフルデモ：

- 週報: https://wxkingstar.github.io/ai-output-runtime/demo-weekly.html
- Q1 ダッシュボード: https://wxkingstar.github.io/ai-output-runtime/demo-dashboard.html

## 意図的にやらないこと

- **可視化を再発明しない**：line / bar / area / pie / donut + 5 つのビジネスチャートのみ。複雑なものは ECharts / D3 に任せる。
- **リッチテキスト HTML を描画しない**：フィールドは plain text + 限定的な Markdown インラインのみ。
- **プロンプト注入経路を一切残さない**：style / script / event handler / template expression / custom component すべてスキーマで禁止。

## リポジトリ

GitHub (MIT): https://github.com/wxkingstar/ai-output-runtime
skills.sh listing: https://skills.sh/wxkingstar/ai-output-runtime

フィードバック歓迎：

- 業務レポートで 15 コンポーネントでカバーできない形は？
- スキル発動時に直感に反する挙動があれば
- Claude で本番レポートを書いている方の最大の痛点

issues でお待ちしています。
