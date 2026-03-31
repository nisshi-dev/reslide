# @reslide-dev/mdx

## 0.16.0

### Patch Changes

- [#74](https://github.com/nisshi-dev/reslide/pull/74) [`51b8ee2`](https://github.com/nisshi-dev/reslide/commit/51b8ee2bcbf2ef977ee2e4ab20bf6def797b63e4) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - core: default.css に transition container/slide の height:100%を追加
  cli: parseSlideRange/generateEntryFiles を utils.ts に切り出し、ユニットテスト 15 件追加
  mdx: \_Fragment バインディングの二重宣言問題を修正、ランタイム実行テスト 3 件追加

## 0.15.3

### Patch Changes

- [#70](https://github.com/nisshi-dev/reslide/pull/70) [`00472e3`](https://github.com/nisshi-dev/reslide/commit/00472e3666f9b2b737ad2a47e31b31e139ff85f2) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - cli: CSS background-image の読み込み待機を IIFE で正しく実行、初回+遷移後で実行
  mdx: remarkExtractCssImports を行分割処理に変更し連続 import の根本原因を修正、\_Fragment バインディング追加
  core: SlideSkelton のレイアウト改善、画像ロード待ちに 5 秒タイムアウト追加

## 0.15.2

### Patch Changes

- [#68](https://github.com/nisshi-dev/reslide/pull/68) [`fb3a56f`](https://github.com/nisshi-dev/reslide/commit/fb3a56f9501889364633ee9343d575c3056f3b4e) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - cli: CSS background-image の読み込み完了を待機してからスクリーンショット撮影
  mdx: remainingLines ノードに estree 付与、\_Fragment の arguments[0]バインディング追加
  core: SlideSkelton のレイアウト改善（タイトル+本文 4 行+ページ番号インジケータ）

## 0.15.1

### Patch Changes

- [#66](https://github.com/nisshi-dev/reslide/pull/66) [`4505085`](https://github.com/nisshi-dev/reslide/commit/4505085af0cab3016098040ba1b3d9f13f028c8c) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - cli: @tailwindcss/vite を dependencies に追加（--tailwind 使用時にユーザー側のインストールが不要に）
  mdx: 連続 import 文が 1 つの mdxjsEsm ノードに結合される場合も正しく処理するように修正

## 0.15.0

### Minor Changes

- [#64](https://github.com/nisshi-dev/reslide/pull/64) [`ddcc03d`](https://github.com/nisshi-dev/reslide/commit/ddcc03d2b2633f4e8dea70efcfb504c559bca3f3) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - mdx: recmaExcludeInlinedComponents プラグインを追加。ローカルインポートでインライン化されたコンポーネントを props.components の分割代入から除外し、ReslideEmbed の components prop への登録なしで動作するように。
  cli: Vite サーバーに server.fs.allow を追加し、スライドディレクトリ外のファイルアクセスを許可。

## 0.13.0

### Minor Changes

- [#58](https://github.com/nisshi-dev/reslide/pull/58) [`346fafa`](https://github.com/nisshi-dev/reslide/commit/346fafa2aead7a1978bdb51929acd2bd276621c6) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - core: URL ハッシュによるスライド位置保持、SlideNumber CSS 変数対応、ReslideEmbed FOUC 防止（画像読み込み待機+フェードイン）
  mdx: countSlides のレイアウト付き区切り二重カウント修正、ローカルインポートの jsx-runtime 除去、esbuild→sucrase 移行（ネイティブバイナリ依存解消）
  cli: export コマンド安定性改善（1920x1080 キャプチャ → リサイズ、待機時間延長、フォールバックセレクタ）

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
