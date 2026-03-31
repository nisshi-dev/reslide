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
│   ├── core/     # @reslide/core — 純粋Reactコンポーネント（フレームワーク非依存）
│   ├── mdx/      # @reslide/mdx — remark/rehypeプラグイン（MDX前処理）
│   └── cli/      # @reslide/cli — Viteベースの dev/build CLI
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

### プレゼンテーション機能（MVP）

- フルスクリーン表示
- キーボードナビゲーション
- スライド番号表示
- 概要モード（全スライドのサムネイルグリッド、クリックでジャンプ）

### ビルトインコンポーネント（追加）

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
- CSS 変数でテーマカスタマイズ（`--slide-bg`, `--slide-text`, `--slide-accent`, `--slide-font-family`, `--slide-progress`, `--slide-progress-height` 等）
- テーマは CSS 変数セットとして定義・切り替え
- `bare.css` テーマ: 装飾なしの最小限テーマ（カスタムデザイン向け）
- スライドごとに `vars` frontmatter で CSS 変数を上書き可能

## @reslide/mdx

MDX の前処理を行う remark/rehype プラグイン群。

### remark プラグイン

| プラグイン     | 役割                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------- |
| `remarkSlides` | `---` でスライド分割。フロントマターからレイアウト・クラスを抽出                          |
| `remarkClick`  | `::click{animation=slide-up}` を `<Click>` コンポーネントに変換（アニメーション指定対応） |
| `remarkMark`   | `::mark[テキスト]{.highlight.orange}` を `<Mark>` に変換                                  |

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

## @reslide/cli

Vite ベースの開発・ビルド CLI ツール。

```bash
npx reslide dev slides.mdx       # 開発サーバー（HMR）
npx reslide build slides.mdx     # 静的SPA出力
npx reslide overview slides.mdx  # 概要モード
```

- Vite + React + MDX プラグインを内蔵
- `reslide.config.ts` でテーマ・フォント・プラグイン設定
- ビルド出力は静的 HTML（SPA）— デプロイ先を選ばない

## 使用方法

### CLI（スタンドアロン）

```bash
npx reslide dev slides.mdx
```

### Next.js 統合

Fumadocs 等の MDX パイプラインに remark プラグインを追加するだけ。CLI は不要。

```ts
// source.config.ts
import { remarkSlides, remarkClick, remarkMark } from "@reslide/mdx";

export const slides = defineCollections({
  dir: "content/slides",
  mdxOptions: {
    remarkPlugins: [remarkSlides, remarkClick, remarkMark],
  },
});
```

```tsx
// app/slides/[slug]/page.tsx
import { Deck } from "@reslide/core";
// MDX が <Deck><Slide>...</Slide></Deck> を出力するので、そのままレンダリング
```

### Vite React プロジェクト

```ts
// vite.config.ts
import { reslide } from "@reslide/cli/vite";

export default defineConfig({
  plugins: [reslide()],
});
```

## 将来の拡張

- レコーダー
- テーマパッケージ（`@reslide/theme-seriph` 等）
- スライドごとのトランジション指定（frontmatter `transition` が各スライド入場時に適用）
- リモートコントロール（WebSocket / WebRTC 経由）

## 技術スタック

- React 19
- TypeScript
- Tailwind CSS v4
- Vite+（モノレポ・ビルド基盤）
- tsdown（ライブラリビルド）
- remark / rehype（MDX プラグイン）
- remark-directive（`::click`, `::mark` 記法）
- Vitest（テスト）
