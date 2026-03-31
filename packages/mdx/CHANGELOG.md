# @reslide-dev/mdx

## 0.12.0

### Minor Changes

- [#56](https://github.com/nisshi-dev/reslide/pull/56) [`2386185`](https://github.com/nisshi-dev/reslide/commit/23861858c328ce1a259f20bc886ad9a80bd1993d) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - MDX: data.estree の再パースでローカルインポートのインライン化を修正、headmatter の layout/defaults サポートを追加
  CLI: export コマンドのスタイル適用・コンポーネント登録・クリーンアップ等 6 点修正、--public-dir/--css/--no-slide-numbers オプション追加

## 0.11.1

### Patch Changes

- [#54](https://github.com/nisshi-dev/reslide/pull/54) [`d662087`](https://github.com/nisshi-dev/reslide/commit/d66208792f6f1fca966c790c3ab358c0b63cd60c) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - 拡張子なし相対インポート（`import { X } from "./components/x"`）の自動解決をサポート。.tsx → .ts → .jsx → .js の順で探索。

## 0.11.0

### Minor Changes

- [#52](https://github.com/nisshi-dev/reslide/pull/52) [`88fb7e4`](https://github.com/nisshi-dev/reslide/commit/88fb7e469096350e65cfef06c73b7d3e3a46d933) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - MDX からのローカルコンポーネントインポートをサポート。スライドディレクトリ内の.tsx/.ts/.jsx/.js ファイルを import 文で直接参照可能に。

## 0.9.2

### Patch Changes

- [#48](https://github.com/nisshi-dev/reslide/pull/48) [`c801a65`](https://github.com/nisshi-dev/reslide/commit/c801a651a8fb06a43df09cbc6278e715b4a1ee11) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - CI 環境での css-extraction テストタイムアウトを修正（Shiki 初回読み込みに 30 秒のタイムアウトを設定）。

## 0.9.0

### Minor Changes

- [#44](https://github.com/nisshi-dev/reslide/pull/44) [`893bf93`](https://github.com/nisshi-dev/reslide/commit/893bf933356b73955c7ccc6ebfaa2e0581b83e0a) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - MDX 内の`<style>`タグおよび CSS ファイル import から CSS を抽出・スコーピング注入する機能を追加。UI オーバーレイ（SlideNumber, ProgressBar, ClickNavigation, NavigationBar）をレスポンシブ対応し、モバイルでも適切にスケールされるように修正。

## 0.8.0

### Minor Changes

- [#40](https://github.com/nisshi-dev/reslide/pull/40) [`0cd0cf1`](https://github.com/nisshi-dev/reslide/commit/0cd0cf105eaf168b90c878a5392f37ed61677600) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - 第 3 弾改善: Click アニメーション種別(fade/slide-up/slide-left/scale/none)、スライドごと CSS 変数上書き(vars)、GlobalLayer 除外指定(excludeSlides/from/to)、grid レイアウト、SlideIndex/TotalSlides コンポーネント、Shiki テーマカスタマイズ、印刷品質向上

## 0.7.0

### Minor Changes

- [#38](https://github.com/nisshi-dev/reslide/pull/38) [`635d053`](https://github.com/nisshi-dev/reslide/commit/635d05343253d998131c4e2296db7d4cd4256949) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - スライドカスタマイズ機能を包括的に強化: two-cols カラム比率(cols)、image 幅(imageWidth)、bare.css テーマ、font-family CSS 変数化、zoom/cover/reveal トランジション、style frontmatter、aspectRatio 転送、ProgressBar CSS 変数化

## 0.6.0

### Minor Changes

- [#36](https://github.com/nisshi-dev/reslide/pull/36) [`5519c87`](https://github.com/nisshi-dev/reslide/commit/5519c87671130ee2894bc7444be2943e42b64b4f) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - スライドデザインの自由度を向上: layout:none 追加、padding 値を 1920x1080 向けに調整、background 属性サポート、slideNumbers 制御、overflow:hidden/position:relative を baseStyle に追加、フォントサイズ調整

## 0.4.0

### Minor Changes

- [#32](https://github.com/nisshi-dev/reslide/pull/32) [`70ec361`](https://github.com/nisshi-dev/reslide/commit/70ec361fffcdc38e58a36d70b68eda5458e21a80) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - MDX 内の相対 import 文が正しく解決されるよう、compileMdxSlides と ReslideEmbed に baseUrl オプションを追加

## 0.3.1

### Patch Changes

- [#30](https://github.com/nisshi-dev/reslide/pull/30) [`3c2e2a2`](https://github.com/nisshi-dev/reslide/commit/3c2e2a26d399d3882883e301408bf78de33bcb0b) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - MDX の image frontmatter が Slide に渡されない問題を修正し、CSS リセット環境でリストマーカーが表示されるよう list-style-type を追加

## 0.2.1

### Patch Changes

- [#24](https://github.com/nisshi-dev/reslide/pull/24) [`9742eb6`](https://github.com/nisshi-dev/reslide/commit/9742eb661f18391008477c3d546e14ab797c4c7a) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - package.json の exports を dist 成果物に修正し、npm 公開パッケージで型解決が失敗する問題を修正

## 0.2.0

### Patch Changes

- [#22](https://github.com/nisshi-dev/reslide/pull/22) [`1a67508`](https://github.com/nisshi-dev/reslide/commit/1a675088067cb799f2215f7f65c847cc2003cbe5) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - 時間表記（13:00）やポート番号（:3000）が remark-directive により消失する問題を修正

## 0.1.1

### Patch Changes

- [#19](https://github.com/nisshi-dev/reslide/pull/19) [`990cf7b`](https://github.com/nisshi-dev/reslide/commit/990cf7be6510614ebc7cf09b90208e4cfa23de99) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - npm publish の version 衝突を回避するためのパッチバンプ

## 0.1.0

### Minor Changes

- [#12](https://github.com/nisshi-dev/reslide/pull/12) [`8a88c02`](https://github.com/nisshi-dev/reslide/commit/8a88c021281e9b9f3c883b55a81a7a829a6d3172) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - プログレスバー、目次 (Toc)、Mermaid 図表コンポーネントを追加。KaTeX 数式と Shiki 構文ハイライトをサポート。

## 0.0.2

### Patch Changes

- [#10](https://github.com/nisshi-dev/reslide/pull/10) [`0115be1`](https://github.com/nisshi-dev/reslide/commit/0115be1c5bfbff06d17b3177aa8fd9a368cf4816) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - Mark コンポーネントの CSS 変数名バグを修正し、MDX 互換のディレクティブ構文を追加
