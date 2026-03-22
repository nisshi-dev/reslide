# reslide

[![npm version](https://img.shields.io/npm/v/@reslide-dev/core?style=flat-square&color=16a34a)](https://www.npmjs.com/package/@reslide-dev/core)
[![license](https://img.shields.io/badge/license-MIT-16a34a?style=flat-square)](LICENSE)

React + MDX ベースのプレゼンテーションフレームワーク。

Markdown でスライドを書き、React コンポーネントを自由に埋め込める。Next.js / Remix / Vite 等あらゆる React プロジェクトで動作するフレームワーク非依存設計。

## 特徴

- **MDX** でスライドを記述 --- `---` で区切るだけでスライドに
- **フレームワーク非依存** --- 純粋な React コンポーネント、どの React プロジェクトにも組み込み可能
- **16:9 レスポンシブ** --- 固定アスペクト比で自動スケーリング、PC でもスマホでも同じレイアウト
- **タッチスワイプ** --- モバイルでスワイプ操作によるスライド送り・戻し
- **豊富なレイアウト** --- `default` / `center` / `two-cols` / `image-right` / `section` / `quote`
- **クリックアニメーション** --- `::click` ディレクティブで段階的コンテンツ表示
- **テキストハイライト** --- `:highlight-yellow[text]` / `:underline-blue[text]` / `:circle-red[text]`
- **KaTeX 数式** --- `$E = mc^2$` でインライン、`$$...$$` でディスプレイ数式
- **Mermaid ダイアグラム** --- `<Mermaid>` コンポーネントでフローチャート等を描画
- **Shiki コードハイライト** --- ビルド時に美しい構文ハイライトを適用
- **プレゼンターモード** --- 別ウィンドウでノート・タイマー・次スライドプレビュー表示、双方向操作対応
- **ポインターモード** --- クリックでリップルエフェクト付きの視覚ポインター
- **描画モード** --- フリーハンド注釈をスライドごとに保持
- **トランジション** --- `fade` / `slide-left` / `slide-right` / `slide-up` / `slide-down`
- **概要モード** --- サムネイルグリッドでスライド一覧を表示
- **PDF エクスポート** --- `Ctrl+P` で印刷 / PDF 保存
- **テーマ** --- CSS 変数ベース、`default` / `dark` テーマ同梱

## クイックスタート

```bash
npm install @reslide-dev/core @reslide-dev/mdx
```

### 1. スライドを書く

```mdx
---
layout: center
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
import { remarkSlides, remarkClick, remarkMark } from "@reslide-dev/mdx";
import remarkDirective from "remark-directive";

export default {
  plugins: [
    mdx({
      remarkPlugins: [remarkDirective, remarkSlides, remarkClick, remarkMark],
    }),
  ],
};
```

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

| レイアウト    | 説明                                     |
| ------------- | ---------------------------------------- |
| `default`     | 標準（左上寄せ）                         |
| `center`      | 中央寄せ                                 |
| `two-cols`    | 2カラム（`<SlotRight>` で右カラム指定）  |
| `image-right` | 左テキスト + 右画像                      |
| `image-left`  | 左画像 + 右テキスト                      |
| `section`     | セクション区切り（アクセントカラー背景） |
| `quote`       | 引用                                     |

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
  --slide-progress: #16a34a;
}
```

同梱テーマ：

- `@reslide-dev/core/themes/default.css`
- `@reslide-dev/core/themes/dark.css`

## パッケージ構成

| パッケージ                           | 役割                                                         |
| ------------------------------------ | ------------------------------------------------------------ |
| [`@reslide-dev/core`](packages/core) | React コンポーネント（Deck, Slide, Click, Mark, Notes 等）   |
| [`@reslide-dev/mdx`](packages/mdx)   | remark/rehype プラグイン（スライド分割、ディレクティブ変換） |
| [`@reslide-dev/cli`](packages/cli)   | Vite ベースの dev/build CLI                                  |

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
