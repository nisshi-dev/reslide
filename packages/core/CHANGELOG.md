# @reslide-dev/core

## 0.4.0

### Minor Changes

- [#32](https://github.com/nisshi-dev/reslide/pull/32) [`70ec361`](https://github.com/nisshi-dev/reslide/commit/70ec361fffcdc38e58a36d70b68eda5458e21a80) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - MDX 内の相対 import 文が正しく解決されるよう、compileMdxSlides と ReslideEmbed に baseUrl オプションを追加

## 0.3.1

### Patch Changes

- [#30](https://github.com/nisshi-dev/reslide/pull/30) [`3c2e2a2`](https://github.com/nisshi-dev/reslide/commit/3c2e2a26d399d3882883e301408bf78de33bcb0b) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - MDX の image frontmatter が Slide に渡されない問題を修正し、CSS リセット環境でリストマーカーが表示されるよう list-style-type を追加

## 0.3.0

### Minor Changes

- スライド表示・ナビゲーション・印刷機能の強化
  - スライドのアスペクト比を 16:9 に固定し、レターボックス表示に対応
  - タッチスワイプによるスライド操作を追加
  - プレゼンテーションポインター機能を追加
  - プレゼンタービューのスライド表示を 16:9 にスケーリング
  - 印刷モード（?mode=print）のルーティングとナビゲーションバーの印刷ボタンを追加
  - 印刷時の背景色保持（print-color-adjust: exact）とスケーリングを修正
  - クリックナビゲーションのホバー表示改善

### Patch Changes

- [#29](https://github.com/nisshi-dev/reslide/pull/29) [`803ae84`](https://github.com/nisshi-dev/reslide/commit/803ae8485c8f4a6bc63ef70aea905df1e3edd5c1) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - MDX 内の `<Mermaid>` コンポーネントでダイアグラムが描画されない問題を修正

## 0.2.2

### Patch Changes

- [#26](https://github.com/nisshi-dev/reslide/pull/26) [`b65269e`](https://github.com/nisshi-dev/reslide/commit/b65269e4817c1a14b26b05ed91eefab3fccedf53) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - ReslideEmbed の builtinComponents に Mermaid, Toc, CodeEditor を追加。スライド番号の常時表示を追加

## 0.2.1

### Patch Changes

- [#24](https://github.com/nisshi-dev/reslide/pull/24) [`9742eb6`](https://github.com/nisshi-dev/reslide/commit/9742eb661f18391008477c3d546e14ab797c4c7a) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - package.json の exports を dist 成果物に修正し、npm 公開パッケージで型解決が失敗する問題を修正

## 0.2.0

### Minor Changes

- [#22](https://github.com/nisshi-dev/reslide/pull/22) [`3392add`](https://github.com/nisshi-dev/reslide/commit/3392addfc28e4c48550924e2e88658e39f2a6393) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - プレゼンターモードの双方向操作、描画モードのスライド別保持、ナビゲーションバーを追加

## 0.1.0

### Minor Changes

- [#12](https://github.com/nisshi-dev/reslide/pull/12) [`8a88c02`](https://github.com/nisshi-dev/reslide/commit/8a88c021281e9b9f3c883b55a81a7a829a6d3172) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - プログレスバー、目次 (Toc)、Mermaid 図表コンポーネントを追加。KaTeX 数式と Shiki 構文ハイライトをサポート。

## 0.0.2

### Patch Changes

- [#10](https://github.com/nisshi-dev/reslide/pull/10) [`0115be1`](https://github.com/nisshi-dev/reslide/commit/0115be1c5bfbff06d17b3177aa8fd9a368cf4816) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - Mark コンポーネントの CSS 変数名バグを修正し、MDX 互換のディレクティブ構文を追加
