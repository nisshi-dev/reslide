# reslide 設計ドキュメント

## 概要

React + MDX ベースの汎用プレゼンテーションフレームワーク。Slidev の主要機能を React エコシステムで再実装する。Next.js / Vite / Remix 等、React が動くあらゆる環境で使える。MDX でスライドを記述し、React コンポーネントを埋め込める。

## 背景

Slidev（Vue ベース）は優れたプレゼンツールだが、React プロジェクトとの統合に課題がある：

- ビルドパイプラインが二重（React フレームワーク + Vite/Vue）でビルド時間が長い
- React コンポーネントの埋め込みが間接的（slidev-addon-react 経由）
- Vue の依存が React プロジェクトに不要なオーバーヘッドを生む

reslide はこれらを解決し、React ネイティブのプレゼンテーション体験を提供する。

## パッケージ構成

```
reslide/
├── packages/
│   ├── core/     # @reslide-dev/core — 純粋Reactコンポーネント（フレームワーク非依存）
│   ├── mdx/      # @reslide-dev/mdx — remark/rehypeプラグイン（MDX前処理）
│   └── cli/      # @reslide-dev/cli — Viteベースの dev/build/export CLI
├── apps/
│   └── website/  # ドキュメントサイト・デモ
```

## @reslide/core

フレームワーク非依存の純粋 React コンポーネント群。

### コンポーネント

| コンポーネント | 役割                                                                   |
| -------------- | ---------------------------------------------------------------------- |
| `<Deck>`       | スライド全体のコンテナ。ステート管理（現在スライド、クリックステップ） |
| `<Slide>`      | 個別スライド。`layout` prop でバリエーション切り替え                   |
| `<Click>`      | 段階表示の単位。Deck のクリックカウンターと連動                        |
| `<Mark>`       | テキストハイライト（highlight, underline, circle）                     |
| `<Notes>`      | スピーカーノート（通常時は非表示、概要モードで表示）                   |

### レイアウト

組み込みレイアウト:

- `default` — 標準（タイトル + コンテンツ）
- `center` — 中央寄せ
- `two-cols` — 2カラム（`<SlotRight>` で右カラム開始、`cols: 6/4` で比率カスタマイズ）
- `image-right` — 右に画像、左にコンテンツ（`imageWidth: 40%` で画像幅指定）
- `image-left` — 左に画像、右にコンテンツ（`imageWidth: 40%` で画像幅指定）
- `section` — セクション区切り
- `quote` — 引用
- `grid` — CSS Grid レイアウト（`grid: "1fr 1fr 1fr"` / `rows: 2` / `gap: 40`）
- `none` — フルコントロール（padding/flex なし、absolute 配置向け）

カスタムレイアウトは React コンポーネントとして追加可能。

### headmatter layout + defaults

最初のフロントマター（headmatter）で `layout` を指定すると最初のスライドに適用される。`defaults` ブロックで全スライドのデフォルトレイアウトを設定可能:

```yaml
---
title: My Presentation
layout: none # 最初のスライドに適用
defaults:
  layout: none # 2枚目以降のデフォルト
---
```

優先順位（高い順）: 個別スライドの `layout` > `defaults.layout` > テーマデフォルト

### デザイン解像度

デフォルト 1920x1080（Full HD）。`Deck` / `ReslideEmbed` の `designWidth` / `designHeight` props で変更可能。スケーリングは `transform: scale()` でコンテナサイズに自動フィット。

### スライド属性（frontmatter）

| 属性                    | 説明                                                    |
| ----------------------- | ------------------------------------------------------- |
| `layout`                | レイアウト種別                                          |
| `background`            | 背景色 / グラデーション / 画像URL                       |
| `vars`                  | CSS 変数上書き（`slide-bg:#0f172a,slide-text:#e2e8f0`） |
| `cols`                  | two-cols のカラム比率（`6/4`）                          |
| `imageWidth`            | image-right/left の画像幅（`40%`）                      |
| `grid` / `rows` / `gap` | grid レイアウトの設定                                   |
| `style`                 | インラインCSS文字列（`background: red;`）               |
| `class`                 | CSS クラス名                                            |
| `image`                 | image-right/left の画像URL                              |

### ナビゲーション

- `useDeck()` フック — 現在スライド、次/前、クリックステップ、概要モード切替を提供
- キーボード: ←→（スライド移動）、Space（次のクリック/スライド）、Escape（概要モード）、f（フルスクリーン）
- Fullscreen API によるフルスクリーン表示
- URLハッシュ同期 — `#5` で5枚目表示、`replaceState` でスライド移動時に自動更新、リロードでも位置を維持

### プレゼンテーション機能

- フルスクリーン表示
- キーボードナビゲーション + タッチスワイプ
- スライド番号表示（CSS変数でカスタマイズ: `--slide-number-bottom`, `--slide-number-right`, `--slide-number-font-size`, `--slide-number-letter-spacing`, `--slide-number-color`）
- 概要モード（全スライドのサムネイルグリッド、クリックでジャンプ）
- プレゼンターモード（別ウィンドウ、ノート・タイマー・次スライドプレビュー）
- ポインターモード（リップルエフェクト付き視覚ポインター）
- 描画モード（フリーハンド注釈、スライドごとに保持）
- URLハッシュによるスライド位置の保持・共有

### ビルトインコンポーネント

| コンポーネント  | 役割                                                                         |
| --------------- | ---------------------------------------------------------------------------- |
| `<GlobalLayer>` | 全スライド共通オーバーレイ（`excludeSlides` / `from` / `to` で除外指定可能） |
| `<SlideIndex>`  | 現在のスライド番号（1始まり）をインラインテキストで表示                      |
| `<TotalSlides>` | 総スライド数をインラインテキストで表示                                       |
| `<CodeEditor>`  | インタラクティブなコードエディタ                                             |
| `<Mermaid>`     | Mermaid ダイアグラム描画                                                     |
| `<Draggable>`   | ドラッグ可能な要素                                                           |
| `<Toc>`         | 目次                                                                         |

### スタイリング

- Tailwind CSS v4
- CSS 変数でテーマカスタマイズ（`--slide-bg`, `--slide-text`, `--slide-accent`, `--slide-font-family`, `--slide-progress`, `--slide-progress-height`, `--slide-number-*` 等）
- テーマは CSS 変数セットとして定義・切り替え
- `bare.css` テーマ: 装飾なしの最小限テーマ（カスタムデザイン向け）
- スライドごとに `vars` frontmatter で CSS 変数を上書き可能

## @reslide/mdx

MDX の前処理を行う remark/rehype プラグイン群。

### remark プラグイン

| プラグイン                  | 役割                                                                                                |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| `remarkSlides`              | `---` でスライド分割。フロントマターからレイアウト・クラスを抽出。headmatter layout + defaults 対応 |
| `remarkClick`               | `::click{animation=slide-up}` を `<Click>` コンポーネントに変換（アニメーション指定対応）           |
| `remarkMark`                | `::mark[テキスト]{.highlight.orange}` を `<Mark>` に変換                                            |
| `remarkDirectiveFallback`   | 未知のディレクティブを元のテキストに復元（時刻表記 `13:00` 等の誤検出防止）                         |
| `remarkExtractCssImports`   | CSS ファイルインポートを検出・読み込み・`vfile.data.css` に格納（`compileMdxSlides()` 用）          |
| `remarkExtractLocalImports` | ローカル .tsx/.ts/.jsx/.js インポートを検出・esbuild でコンパイル・インライン化（拡張子省略可）     |

### rehype プラグイン

| プラグイン           | 役割                                           |
| -------------------- | ---------------------------------------------- |
| `rehypeExtractStyle` | `<style>` タグを抽出し `vfile.data.css` に格納 |
| `rehypeShiki`        | Shiki によるコードハイライト                   |
| `rehypeKatex`        | KaTeX による数式レンダリング                   |

### コンパイル API

```ts
import { compileMdxSlides, parseSlideMetadata } from "@reslide-dev/mdx";

// サーバーサイドでMDXをコンパイル
const { code, metadata, css } = await compileMdxSlides(source, {
  baseUrl: "file:///path/to/slides/", // ローカルインポート解決に必要
  shikiTheme: "github-dark",
});

// メタデータのみ抽出（一覧ページ用）
const { title, slideCount } = parseSlideMetadata(source);
```

### 記法

```mdx
---
layout: two-cols
---

# 左カラム

::click
この行が段階表示される

::click
::mark[ここがハイライト]{.highlight.orange}

::right

# 右カラム

画像やコードなど
```

- `---` でスライド区切り
- 各スライドの先頭フロントマターでレイアウト・トランジション等を指定
- `::click` で段階表示（remark-directive 記法）
- `::mark[text]{.style}` でテキストハイライト
- `::right` で2カラムレイアウトの右カラム開始
- `import "./styles.css"` で CSS ファイルインポート（compileMdxSlides 時に抽出）
- `import { X } from "./components/x"` でローカルコンポーネントインポート（拡張子省略可）

## @reslide/cli

Vite ベースの開発・ビルド・エクスポート CLI ツール。

```bash
npx reslide dev slides.mdx          # 開発サーバー（HMR）
npx reslide build slides.mdx        # 静的SPA出力
npx reslide export slides.mdx       # PDF/画像エクスポート
```

### export コマンド

Playwright を使ってスライドを PDF や画像にエクスポート:

```bash
reslide export slides.mdx --format png --slides 1,3-5 --quality 85
reslide export slides.mdx --format avif --no-slide-numbers --css ./globals.css
```

対応形式: `pdf`, `png`, `jpg`, `webp`, `avif`
オプション: `--slides`, `--quality`, `--public-dir`, `--css`, `--no-slide-numbers`, `--width`, `--height`

- テーマ CSS を自動インポート（`@reslide-dev/core/themes/default.css`）
- 全ビルトインコンポーネントを自動登録
- `--public-dir` で静的アセットディレクトリ指定（自動検出あり）
- 処理完了後に一時ディレクトリ `.reslide/` を自動クリーンアップ

### Vite プラグイン

```ts
import { reslide } from "@reslide-dev/cli/vite";
export default defineConfig({ plugins: [reslide()] });
```

内蔵 remark プラグイン: `remarkDirective`, `remarkGfm`, `remarkFrontmatter`, `remarkMath`, `remarkSlides`, `remarkClick`, `remarkMark`, `remarkDirectiveFallback`

## 使用方法

### CLI（スタンドアロン）

```bash
npx reslide dev slides.mdx
```

### Next.js 統合

Fumadocs 等の MDX パイプラインに remark プラグインを追加するだけ。CLI は不要。

```ts
// source.config.ts
import { remarkSlides, remarkClick, remarkMark } from "@reslide-dev/mdx";

export const slides = defineCollections({
  dir: "content/slides",
  mdxOptions: {
    remarkPlugins: [remarkSlides, remarkClick, remarkMark],
  },
});
```

```tsx
// app/slides/[slug]/page.tsx
import { Deck } from "@reslide-dev/core";
// MDX が <Deck><Slide>...</Slide></Deck> を出力するので、そのままレンダリング
```

### Vite React プロジェクト

```ts
// vite.config.ts
import { reslide } from "@reslide-dev/cli/vite";

export default defineConfig({
  plugins: [reslide()],
});
```

## 将来の拡張

- レコーダー
- テーマパッケージ（`@reslide-dev/theme-seriph` 等）
- スライドごとのトランジション指定（frontmatter `transition` が各スライド入場時に適用）
- リモートコントロール（WebSocket / WebRTC 経由）

## 技術スタック

- React 19
- TypeScript
- Tailwind CSS v4
- Vite+（モノレポ・ビルド基盤）
- tsdown（ライブラリビルド）
- esbuild（ローカルコンポーネントのトランスパイル）
- acorn（ESTree 再パース）
- remark / rehype（MDX プラグイン）
- remark-directive（`::click`, `::mark` 記法）
- Shiki（コードハイライト）
- KaTeX（数式レンダリング）
- Vitest（テスト）
