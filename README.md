# reslide

[![npm version](https://img.shields.io/npm/v/@reslide-dev/core?style=flat-square&color=16a34a)](https://www.npmjs.com/package/@reslide-dev/core)
[![license](https://img.shields.io/badge/license-MIT-16a34a?style=flat-square)](LICENSE)

React + MDX ベースのプレゼンテーションフレームワーク。

Markdown でスライドを書き、React コンポーネントを自由に埋め込める。Next.js / Remix / Vite 等あらゆる React プロジェクトで動作するフレームワーク非依存設計。

## 特徴

- **MDX** でスライドを記述 --- `---` で区切るだけでスライドに
- **フレームワーク非依存** --- 純粋な React コンポーネント、どの React プロジェクトにも組み込み可能
- **1920x1080 デザイン解像度** --- Full HD ベースのスライド設計、`designWidth` / `designHeight` props で上書き可能
- **16:9 レスポンシブ** --- 固定アスペクト比で自動スケーリング、PC でもスマホでも同じレイアウト
- **URLハッシュ同期** --- `#5` で5枚目表示、リロードしても現在位置を維持、特定スライドのURL共有
- **タッチスワイプ** --- モバイルでスワイプ操作によるスライド送り・戻し
- **豊富なレイアウト** --- `default` / `center` / `two-cols` / `image-right` / `section` / `quote` / `grid` / `none`
- **headmatter layout + defaults** --- 最初のスライドに `layout` 指定、`defaults` で全スライドのデフォルト設定
- **カラム比率** --- `two-cols` で `cols: 6/4` による非対称分割、`image-right` で `imageWidth: 40%`
- **ローカルコンポーネントインポート** --- MDX からスライドディレクトリ内の `.tsx` / `.ts` を直接 import（拡張子省略可）
- **クリックアニメーション** --- `::click{animation=slide-up}` で fade / slide-up / slide-left / scale / none
- **テキストハイライト** --- `:highlight-yellow[text]` / `:underline-blue[text]` / `:circle-red[text]`
- **KaTeX 数式** --- `$E = mc^2$` でインライン、`$$...$$` でディスプレイ数式
- **Mermaid ダイアグラム** --- `<Mermaid>` コンポーネントでフローチャート等を描画
- **Shiki コードハイライト** --- ビルド時に美しい構文ハイライトを適用、テーマ変更可能
- **プレゼンターモード** --- 別ウィンドウでノート・タイマー・次スライドプレビュー表示、双方向操作対応
- **ポインターモード** --- クリックでリップルエフェクト付きの視覚ポインター
- **描画モード** --- フリーハンド注釈をスライドごとに保持
- **トランジション** --- `fade` / `slide-left` / `slide-right` / `slide-up` / `slide-down` / `zoom` / `cover` / `reveal`
- **概要モード** --- サムネイルグリッドでスライド一覧を表示
- **画像エクスポート** --- PNG / JPG / WebP / AVIF 形式、ページ範囲・品質指定可能
- **PDF エクスポート** --- `Ctrl+P` で印刷 / PDF 保存、CLI からもエクスポート可能
- **テーマ** --- CSS 変数ベース、`default` / `dark` / `bare`（最小限）テーマ同梱
- **スライドごとのテーマ切替** --- `vars` frontmatter で CSS 変数をスライド単位で上書き
- **背景カスタマイズ** --- `background` frontmatter でスライドごとに背景色・画像・グラデーション
- **スライドナンバー制御** --- `slideNumbers` props で表示 / 非表示 / 最初のスライド除外、CSS変数でスタイルカスタマイズ
- **GlobalLayer 制御** --- `excludeSlides` / `from` / `to` で表示範囲指定
- **カスタムページナンバー** --- `<SlideIndex />` / `<TotalSlides />` で自由な位置にページ番号配置

## クイックスタート

```bash
npm install @reslide-dev/core @reslide-dev/mdx
```

### 1. スライドを書く

```mdx
---
layout: center
defaults:
  layout: none
---

# Hello reslide

React + MDX のプレゼンテーション

---

## 特徴

::click

- 段階的に表示される項目

::click

- もう一つの項目

---

---

## layout: two-cols

## 左カラム

コード例やテキスト

<SlotRight>

## 右カラム

画像やリストなど

</SlotRight>
```

### 2. レンダリング

```tsx
import { reslideComponents } from "@reslide-dev/core/mdx-components";
import Slides from "./slides.mdx";

import "@reslide-dev/core/themes/default.css";
import "@reslide-dev/core/transitions.css";

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100dvh" }}>
      <Slides components={reslideComponents} />
    </div>
  );
}
```

### 3. Vite の設定（MDX プラグイン）

```ts
import mdx from "@mdx-js/rollup";
import { remarkSlides, remarkClick, remarkMark, remarkDirectiveFallback } from "@reslide-dev/mdx";
import remarkDirective from "remark-directive";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

export default {
  plugins: [
    mdx({
      remarkPlugins: [
        remarkDirective,
        remarkGfm,
        [remarkFrontmatter, ["yaml"]],
        remarkMath,
        remarkSlides,
        remarkClick,
        remarkMark,
        remarkDirectiveFallback,
      ],
    }),
  ],
};
```

## ローカルコンポーネントインポート

スライドディレクトリ内の `.tsx` / `.ts` / `.jsx` / `.js` ファイルを MDX から直接インポートできる（拡張子省略可）:

```
content/slides/my-presentation/
├── slides.mdx
├── slides.css
└── components/
    ├── feature-card.tsx
    └── timeline-item.tsx
```

```mdx
import { FeatureCard } from "./components/feature-card";
import { TimelineItem } from "./components/timeline-item";

<FeatureCard icon="🚀" title="高速">
  Turbopack HMR
</FeatureCard>
```

コンパイル時（`compileMdxSlides()`）に esbuild でトランスパイルしてインライン化されるため、ホストアプリ側での `components` prop 登録は不要。

> **Note**: CLI の `reslide dev` / `reslide build` では Vite が直接 `.tsx` インポートを解決するため、この機能は `compileMdxSlides()` 経由（`ReslideEmbed`）で使用する場合に必要です。

## headmatter layout + defaults

最初のフロントマター（headmatter）で `layout` を指定すると、最初のスライドに適用される。`defaults` ブロックで全スライドのデフォルトレイアウトを設定可能:

```mdx
---
title: My Presentation
layout: none
defaults:
  layout: none
---

# Slide 1 (layout: none — headmatterから)

---

# Slide 2 (layout: none — defaultsから)

---

## layout: center

# Slide 3 (layout: center — 個別指定で上書き)
```

優先順位（高い順）: 個別スライドの `layout` > `defaults.layout` > テーマデフォルト

## キーボードショートカット

| キー     | 機能                       |
| -------- | -------------------------- |
| `← →`    | スライド移動               |
| `Space`  | 次のクリック / スライド    |
| `Escape` | 概要モード                 |
| `f`      | フルスクリーン             |
| `p`      | プレゼンターウィンドウ     |
| `d`      | 描画モード                 |
| `q`      | ポインターモード           |
| `c`      | 描画クリア（描画モード中） |

画面の左端 / 右端クリック、タッチスワイプでもスライド送り・戻しが可能。

## レイアウト

MDX のフロントマターで `layout` を指定：

```mdx
---
layout: center
---
```

| レイアウト    | 説明                                                      |
| ------------- | --------------------------------------------------------- |
| `default`     | 標準（左上寄せ）                                          |
| `center`      | 中央寄せ                                                  |
| `two-cols`    | 2カラム（`<SlotRight>` で右カラム、`cols: 6/4` で比率）   |
| `image-right` | 左テキスト + 右画像（`imageWidth: 40%` で幅指定）         |
| `image-left`  | 左画像 + 右テキスト（`imageWidth: 40%` で幅指定）         |
| `section`     | セクション区切り（アクセントカラー背景）                  |
| `quote`       | 引用                                                      |
| `grid`        | CSS Grid（`grid: "1fr 1fr 1fr"` / `rows: 2` / `gap: 40`） |
| `none`        | フルコントロール（padding/flex なし、absolute配置向け）   |

## カスタムコンポーネント

MDX の `components` prop で任意の React コンポーネントを渡せる：

```tsx
const components = {
  ...reslideComponents,
  Speaker: ({ name, avatar }) => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <img src={avatar} style={{ width: 64, borderRadius: "50%" }} />
      <span>{name}</span>
    </div>
  ),
};

<Slides components={components} />;
```

MDX 内で直接使用可能：

```mdx
<Speaker name="田中太郎" avatar="/tanaka.jpg" />
```

## テーマ

CSS 変数でカスタマイズ可能：

```css
:root {
  --slide-bg: #ffffff;
  --slide-text: #1a1a1a;
  --slide-accent: #16a34a;
  --slide-section-text: #ffffff;
  --slide-font-family: "Noto Sans CJK JP", system-ui, sans-serif;
  --slide-progress: #16a34a;
  --slide-progress-height: 3px;

  /* スライド番号 */
  --slide-number-bottom: 36px;
  --slide-number-right: 64px;
  --slide-number-font-size: 16px;
  --slide-number-letter-spacing: 0.08em;
  --slide-number-color: #ccc;
}
```

同梱テーマ：

- `@reslide-dev/core/themes/default.css` --- 標準テーマ（Inter フォント、装飾スタイル付き）
- `@reslide-dev/core/themes/dark.css` --- ダークテーマ
- `@reslide-dev/core/themes/bare.css` --- 最小限テーマ（CSS変数のみ、カスタムデザイン向け）

スライドごとに CSS 変数を上書き：

```mdx
---
layout: center
vars: slide-bg:#0f172a,slide-text:#e2e8f0,slide-accent:#60a5fa
---

# ダークなセクションスライド
```

## CLI

```bash
npx reslide dev slides.mdx          # 開発サーバー（HMR）
npx reslide build slides.mdx        # 静的SPA出力
npx reslide export slides.mdx       # PDF/画像エクスポート
```

### export コマンド

Playwright を使ってスライドを PDF や画像にエクスポートする:

```bash
# PDF（デフォルト）
reslide export slides.mdx

# PNG で全スライド
reslide export slides.mdx --format png

# タイトルスライドだけ WebP で書き出し
reslide export slides.mdx --format webp --slides 1 --quality 85

# 特定ページ範囲を AVIF で
reslide export slides.mdx --format avif --slides 1,3-5 --quality 50

# スライド番号非表示 + 追加CSS + public ディレクトリ指定
reslide export slides.mdx --format png --no-slide-numbers --css ./src/globals.css --public-dir ./public
```

| オプション            | 説明                                 | デフォルト |
| --------------------- | ------------------------------------ | ---------- |
| `--format <format>`   | `pdf`, `png`, `jpg`, `webp`, `avif`  | `pdf`      |
| `--out <dir>`         | 出力ディレクトリ                     | `export`   |
| `--width <width>`     | ビューポート幅                       | `1920`     |
| `--height <height>`   | ビューポート高                       | `1080`     |
| `--slides <range>`    | ページ範囲 (例: `1`, `1,3-5`, `2-8`) | 全ページ   |
| `--quality <quality>` | jpg/webp/avif の品質 (1-100)         | 形式依存   |
| `--public-dir <dir>`  | 静的アセットディレクトリ（自動検出） | 自動       |
| `--css <path>`        | 追加 CSS ファイル                    | なし       |
| `--no-slide-numbers`  | スライド番号を非表示                 | 表示       |

依存: PNG/JPG/PDF は `playwright` のみ、WebP/AVIF は `playwright` + `sharp` が必要。

## パッケージ構成

| パッケージ                           | 役割                                                         |
| ------------------------------------ | ------------------------------------------------------------ |
| [`@reslide-dev/core`](packages/core) | React コンポーネント（Deck, Slide, Click, Mark, Notes 等）   |
| [`@reslide-dev/mdx`](packages/mdx)   | remark/rehype プラグイン（スライド分割、ディレクティブ変換） |
| [`@reslide-dev/cli`](packages/cli)   | Vite ベースの dev/build/export CLI                           |

## 開発

```bash
vp install          # 依存インストール
vp dev              # 開発サーバー
vp test             # テスト実行
vp check            # lint + format + 型チェック
vp run ready        # 全チェック（fmt, build, lint, test）
```

## ライセンス

[MIT](LICENSE)
