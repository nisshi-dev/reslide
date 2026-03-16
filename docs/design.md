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
- `two-cols` — 2カラム（`::right` で右カラム開始）
- `image-right` — 右に画像、左にコンテンツ
- `image-left` — 左に画像、右にコンテンツ
- `section` — セクション区切り
- `quote` — 引用

カスタムレイアウトは React コンポーネントとして追加可能。

### ナビゲーション

- `useDeck()` フック — 現在スライド、次/前、クリックステップ、概要モード切替を提供
- キーボード: ←→（スライド移動）、Space（次のクリック/スライド）、Escape（概要モード）、f（フルスクリーン）
- Fullscreen API によるフルスクリーン表示

### プレゼンテーション機能（MVP）

- フルスクリーン表示
- キーボードナビゲーション
- スライド番号表示
- 概要モード（全スライドのサムネイルグリッド、クリックでジャンプ）

### スタイリング

- Tailwind CSS v4
- CSS 変数でテーマカスタマイズ（`--slide-bg`, `--slide-text`, `--slide-accent` 等）
- テーマは CSS 変数セットとして定義・切り替え

## @reslide/mdx

MDX の前処理を行う remark/rehype プラグイン群。

### remark プラグイン

| プラグイン     | 役割                                                             |
| -------------- | ---------------------------------------------------------------- |
| `remarkSlides` | `---` でスライド分割。フロントマターからレイアウト・クラスを抽出 |
| `remarkClick`  | `::click` ディレクティブを `<Click>` コンポーネントに変換        |
| `remarkMark`   | `::mark[テキスト]{.highlight.orange}` を `<Mark>` に変換         |

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

## 将来の拡張（MVP 後）

- スピーカーノート（別ウィンドウ表示）
- タイマー（経過/残り時間）
- レーザーポインター
- PDF エクスポート（Playwright）
- レコーダー
- トランジションアニメーション（slide-left, fade 等）
- シンタックスハイライト（Shiki 統合）
- テーマパッケージ（`@reslide/theme-seriph` 等）

## 技術スタック

- React 19
- TypeScript
- Tailwind CSS v4
- Vite+（モノレポ・ビルド基盤）
- tsdown（ライブラリビルド）
- remark / rehype（MDX プラグイン）
- remark-directive（`::click`, `::mark` 記法）
- Vitest（テスト）
