# @reslide-dev/core

## 0.17.0

### Minor Changes

- [#76](https://github.com/nisshi-dev/reslide/pull/76) [`eac1b9e`](https://github.com/nisshi-dev/reslide/commit/eac1b9e59b5dd9945131a6289b93a66b8dfbed17) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - 埋め込み機能の追加: ReslideRemoteEmbed、toEmbedData、embedded モード
  - `@reslide-dev/core`: URL からコンパイル済みスライドデータを fetch して描画する `ReslideRemoteEmbed` コンポーネントを追加
  - `@reslide-dev/core`: 記事内埋め込みに適したミニマルコントロールバーを表示する `embedded` prop を `Deck`/`ReslideEmbed`/`ReslideRemoteEmbed` に追加
  - `@reslide-dev/mdx`: `CompileResult` を API レスポンス用 JSON に変換する `toEmbedData` 関数と `ReslideEmbedData` 型を追加

## 0.16.0

### Patch Changes

- [#74](https://github.com/nisshi-dev/reslide/pull/74) [`51b8ee2`](https://github.com/nisshi-dev/reslide/commit/51b8ee2bcbf2ef977ee2e4ab20bf6def797b63e4) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - core: default.css に transition container/slide の height:100%を追加
  cli: parseSlideRange/generateEntryFiles を utils.ts に切り出し、ユニットテスト 15 件追加
  mdx: \_Fragment バインディングの二重宣言問題を修正、ランタイム実行テスト 3 件追加

## 0.15.4

### Patch Changes

- [#72](https://github.com/nisshi-dev/reslide/pull/72) [`904c62c`](https://github.com/nisshi-dev/reslide/commit/904c62c9651d87dac6e9a16d2cf3d2af7cc8ef53) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - core: SlideTransition の container/slide に width:100%/height:100%を追加し、export 時に要素の高さが 0 になる問題を修正
  cli: Tailwind v4 の@source でスライドディレクトリを明示指定し、Vite ルート外のクラスもスキャン対象に

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

## 0.13.1

### Patch Changes

- [#60](https://github.com/nisshi-dev/reslide/pull/60) [`02e27bf`](https://github.com/nisshi-dev/reslide/commit/02e27bfd14d4451d16009530770fb25018a24a4b) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - core: ReslideEmbed の FOUC 対策強化（rAF2 回ネスト、visibility: hidden、style 先行注入）、スケルトンプレースホルダー追加
  cli: vite を dependencies に移動し単体インストール時のエラーを解消

## 0.13.0

### Minor Changes

- [#58](https://github.com/nisshi-dev/reslide/pull/58) [`346fafa`](https://github.com/nisshi-dev/reslide/commit/346fafa2aead7a1978bdb51929acd2bd276621c6) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - core: URL ハッシュによるスライド位置保持、SlideNumber CSS 変数対応、ReslideEmbed FOUC 防止（画像読み込み待機+フェードイン）
  mdx: countSlides のレイアウト付き区切り二重カウント修正、ローカルインポートの jsx-runtime 除去、esbuild→sucrase 移行（ネイティブバイナリ依存解消）
  cli: export コマンド安定性改善（1920x1080 キャプチャ → リサイズ、待機時間延長、フォールバックセレクタ）

## 0.9.1

### Patch Changes

- [#46](https://github.com/nisshi-dev/reslide/pull/46) [`6cd2418`](https://github.com/nisshi-dev/reslide/commit/6cd2418a8571d4f7fbac505a47603eee033d75d5) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - layout: none のスライドでテーマデフォルトスタイル（p, h1〜h6, ul, ol 等のフォントサイズやマージン）を適用しないように変更。Tailwind クラス等のユーザー指定スタイルが正しく反映されるようになった。

## 0.9.0

### Minor Changes

- [#44](https://github.com/nisshi-dev/reslide/pull/44) [`893bf93`](https://github.com/nisshi-dev/reslide/commit/893bf933356b73955c7ccc6ebfaa2e0581b83e0a) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - MDX 内の`<style>`タグおよび CSS ファイル import から CSS を抽出・スコーピング注入する機能を追加。UI オーバーレイ（SlideNumber, ProgressBar, ClickNavigation, NavigationBar）をレスポンシブ対応し、モバイルでも適切にスケールされるように修正。

## 0.8.1

### Patch Changes

- [#42](https://github.com/nisshi-dev/reslide/pull/42) [`49eb8bd`](https://github.com/nisshi-dev/reslide/commit/49eb8bdff6d3b89bf79060fd5a049fa1cc66163a) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - ReslideEmbed の useMemo を早期 return の前に移動して React Rules of Hooks 違反を修正

## 0.8.0

### Minor Changes

- [#40](https://github.com/nisshi-dev/reslide/pull/40) [`0cd0cf1`](https://github.com/nisshi-dev/reslide/commit/0cd0cf105eaf168b90c878a5392f37ed61677600) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - 第 3 弾改善: Click アニメーション種別(fade/slide-up/slide-left/scale/none)、スライドごと CSS 変数上書き(vars)、GlobalLayer 除外指定(excludeSlides/from/to)、grid レイアウト、SlideIndex/TotalSlides コンポーネント、Shiki テーマカスタマイズ、印刷品質向上

## 0.7.0

### Minor Changes

- [#38](https://github.com/nisshi-dev/reslide/pull/38) [`635d053`](https://github.com/nisshi-dev/reslide/commit/635d05343253d998131c4e2296db7d4cd4256949) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - スライドカスタマイズ機能を包括的に強化: two-cols カラム比率(cols)、image 幅(imageWidth)、bare.css テーマ、font-family CSS 変数化、zoom/cover/reveal トランジション、style frontmatter、aspectRatio 転送、ProgressBar CSS 変数化

## 0.6.0

### Minor Changes

- [#36](https://github.com/nisshi-dev/reslide/pull/36) [`5519c87`](https://github.com/nisshi-dev/reslide/commit/5519c87671130ee2894bc7444be2943e42b64b4f) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - スライドデザインの自由度を向上: layout:none 追加、padding 値を 1920x1080 向けに調整、background 属性サポート、slideNumbers 制御、overflow:hidden/position:relative を baseStyle に追加、フォントサイズ調整

## 0.5.0

### Minor Changes

- [#34](https://github.com/nisshi-dev/reslide/pull/34) [`1e58aa5`](https://github.com/nisshi-dev/reslide/commit/1e58aa54df7bee4ca5c92304eef13ade9d922418) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - デザイン解像度を 960x540 → 1920x1080 に変更し、Deck / ReslideEmbed の designWidth / designHeight props で任意の解像度に上書き可能にした。テーマ CSS のフォントサイズも 1920x1080 向けに調整。

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
