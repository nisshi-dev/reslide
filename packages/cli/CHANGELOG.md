# @reslide-dev/cli

## 0.16.0

### Minor Changes

- [#74](https://github.com/nisshi-dev/reslide/pull/74) [`51b8ee2`](https://github.com/nisshi-dev/reslide/commit/51b8ee2bcbf2ef977ee2e4ab20bf6def797b63e4) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - core: default.css に transition container/slide の height:100%を追加
  cli: parseSlideRange/generateEntryFiles を utils.ts に切り出し、ユニットテスト 15 件追加
  mdx: \_Fragment バインディングの二重宣言問題を修正、ランタイム実行テスト 3 件追加

### Patch Changes

- Updated dependencies [[`51b8ee2`](https://github.com/nisshi-dev/reslide/commit/51b8ee2bcbf2ef977ee2e4ab20bf6def797b63e4)]:
  - @reslide-dev/core@0.16.0
  - @reslide-dev/mdx@0.16.0

## 0.15.4

### Patch Changes

- [#72](https://github.com/nisshi-dev/reslide/pull/72) [`904c62c`](https://github.com/nisshi-dev/reslide/commit/904c62c9651d87dac6e9a16d2cf3d2af7cc8ef53) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - core: SlideTransition の container/slide に width:100%/height:100%を追加し、export 時に要素の高さが 0 になる問題を修正
  cli: Tailwind v4 の@source でスライドディレクトリを明示指定し、Vite ルート外のクラスもスキャン対象に
- Updated dependencies [[`904c62c`](https://github.com/nisshi-dev/reslide/commit/904c62c9651d87dac6e9a16d2cf3d2af7cc8ef53)]:
  - @reslide-dev/core@0.15.4

## 0.15.3

### Patch Changes

- [#70](https://github.com/nisshi-dev/reslide/pull/70) [`00472e3`](https://github.com/nisshi-dev/reslide/commit/00472e3666f9b2b737ad2a47e31b31e139ff85f2) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - cli: CSS background-image の読み込み待機を IIFE で正しく実行、初回+遷移後で実行
  mdx: remarkExtractCssImports を行分割処理に変更し連続 import の根本原因を修正、\_Fragment バインディング追加
  core: SlideSkelton のレイアウト改善、画像ロード待ちに 5 秒タイムアウト追加
- Updated dependencies [[`00472e3`](https://github.com/nisshi-dev/reslide/commit/00472e3666f9b2b737ad2a47e31b31e139ff85f2)]:
  - @reslide-dev/mdx@0.15.3
  - @reslide-dev/core@0.15.3

## 0.15.2

### Patch Changes

- [#68](https://github.com/nisshi-dev/reslide/pull/68) [`fb3a56f`](https://github.com/nisshi-dev/reslide/commit/fb3a56f9501889364633ee9343d575c3056f3b4e) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - cli: CSS background-image の読み込み完了を待機してからスクリーンショット撮影
  mdx: remainingLines ノードに estree 付与、\_Fragment の arguments[0]バインディング追加
  core: SlideSkelton のレイアウト改善（タイトル+本文 4 行+ページ番号インジケータ）
- Updated dependencies [[`fb3a56f`](https://github.com/nisshi-dev/reslide/commit/fb3a56f9501889364633ee9343d575c3056f3b4e)]:
  - @reslide-dev/mdx@0.15.2
  - @reslide-dev/core@0.15.2

## 0.15.1

### Patch Changes

- [#66](https://github.com/nisshi-dev/reslide/pull/66) [`4505085`](https://github.com/nisshi-dev/reslide/commit/4505085af0cab3016098040ba1b3d9f13f028c8c) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - cli: @tailwindcss/vite を dependencies に追加（--tailwind 使用時にユーザー側のインストールが不要に）
  mdx: 連続 import 文が 1 つの mdxjsEsm ノードに結合される場合も正しく処理するように修正
- Updated dependencies [[`4505085`](https://github.com/nisshi-dev/reslide/commit/4505085af0cab3016098040ba1b3d9f13f028c8c)]:
  - @reslide-dev/mdx@0.15.1

## 0.15.0

### Patch Changes

- [#64](https://github.com/nisshi-dev/reslide/pull/64) [`ddcc03d`](https://github.com/nisshi-dev/reslide/commit/ddcc03d2b2633f4e8dea70efcfb504c559bca3f3) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - mdx: recmaExcludeInlinedComponents プラグインを追加。ローカルインポートでインライン化されたコンポーネントを props.components の分割代入から除外し、ReslideEmbed の components prop への登録なしで動作するように。
  cli: Vite サーバーに server.fs.allow を追加し、スライドディレクトリ外のファイルアクセスを許可。
- Updated dependencies [[`ddcc03d`](https://github.com/nisshi-dev/reslide/commit/ddcc03d2b2633f4e8dea70efcfb504c559bca3f3)]:
  - @reslide-dev/mdx@0.15.0

## 0.14.0

### Minor Changes

- [#62](https://github.com/nisshi-dev/reslide/pull/62) [`265aaa3`](https://github.com/nisshi-dev/reslide/commit/265aaa388f6ab8491e661d29257d83d817af6e76) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - dev/build/export コマンドに --tailwind オプションを追加。Tailwind CSS v4 のユーティリティクラスを使用したスライドのレンダリング・エクスポートをサポート。

## 0.13.1

### Patch Changes

- [#60](https://github.com/nisshi-dev/reslide/pull/60) [`02e27bf`](https://github.com/nisshi-dev/reslide/commit/02e27bfd14d4451d16009530770fb25018a24a4b) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - core: ReslideEmbed の FOUC 対策強化（rAF2 回ネスト、visibility: hidden、style 先行注入）、スケルトンプレースホルダー追加
  cli: vite を dependencies に移動し単体インストール時のエラーを解消
- Updated dependencies [[`02e27bf`](https://github.com/nisshi-dev/reslide/commit/02e27bfd14d4451d16009530770fb25018a24a4b)]:
  - @reslide-dev/core@0.13.1

## 0.13.0

### Minor Changes

- [#58](https://github.com/nisshi-dev/reslide/pull/58) [`346fafa`](https://github.com/nisshi-dev/reslide/commit/346fafa2aead7a1978bdb51929acd2bd276621c6) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - core: URL ハッシュによるスライド位置保持、SlideNumber CSS 変数対応、ReslideEmbed FOUC 防止（画像読み込み待機+フェードイン）
  mdx: countSlides のレイアウト付き区切り二重カウント修正、ローカルインポートの jsx-runtime 除去、esbuild→sucrase 移行（ネイティブバイナリ依存解消）
  cli: export コマンド安定性改善（1920x1080 キャプチャ → リサイズ、待機時間延長、フォールバックセレクタ）

### Patch Changes

- Updated dependencies [[`346fafa`](https://github.com/nisshi-dev/reslide/commit/346fafa2aead7a1978bdb51929acd2bd276621c6)]:
  - @reslide-dev/core@0.13.0
  - @reslide-dev/mdx@0.13.0

## 0.12.0

### Minor Changes

- [#56](https://github.com/nisshi-dev/reslide/pull/56) [`2386185`](https://github.com/nisshi-dev/reslide/commit/23861858c328ce1a259f20bc886ad9a80bd1993d) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - MDX: data.estree の再パースでローカルインポートのインライン化を修正、headmatter の layout/defaults サポートを追加
  CLI: export コマンドのスタイル適用・コンポーネント登録・クリーンアップ等 6 点修正、--public-dir/--css/--no-slide-numbers オプション追加

### Patch Changes

- Updated dependencies [[`2386185`](https://github.com/nisshi-dev/reslide/commit/23861858c328ce1a259f20bc886ad9a80bd1993d)]:
  - @reslide-dev/mdx@0.12.0

## 0.11.1

### Patch Changes

- Updated dependencies [[`d662087`](https://github.com/nisshi-dev/reslide/commit/d66208792f6f1fca966c790c3ab358c0b63cd60c)]:
  - @reslide-dev/mdx@0.11.1

## 0.11.0

### Patch Changes

- Updated dependencies [[`88fb7e4`](https://github.com/nisshi-dev/reslide/commit/88fb7e469096350e65cfef06c73b7d3e3a46d933)]:
  - @reslide-dev/mdx@0.11.0

## 0.10.0

### Minor Changes

- [#50](https://github.com/nisshi-dev/reslide/pull/50) [`ea24db5`](https://github.com/nisshi-dev/reslide/commit/ea24db56e12aad2bec5afdbc2be086e0b5ce2bf6) Thanks [@nisshi-dev](https://github.com/nisshi-dev)! - export コマンドに画像フォーマット（png/jpg/webp/avif）、ページ範囲指定（--slides）、品質指定（--quality）オプションを追加

## 0.9.2

### Patch Changes

- Updated dependencies [[`c801a65`](https://github.com/nisshi-dev/reslide/commit/c801a651a8fb06a43df09cbc6278e715b4a1ee11)]:
  - @reslide-dev/mdx@0.9.2

## 0.9.1

### Patch Changes

- Updated dependencies [[`6cd2418`](https://github.com/nisshi-dev/reslide/commit/6cd2418a8571d4f7fbac505a47603eee033d75d5)]:
  - @reslide-dev/core@0.9.1

## 0.9.0

### Patch Changes

- Updated dependencies [[`893bf93`](https://github.com/nisshi-dev/reslide/commit/893bf933356b73955c7ccc6ebfaa2e0581b83e0a)]:
  - @reslide-dev/mdx@0.9.0
  - @reslide-dev/core@0.9.0

## 0.8.1

### Patch Changes

- Updated dependencies [[`49eb8bd`](https://github.com/nisshi-dev/reslide/commit/49eb8bdff6d3b89bf79060fd5a049fa1cc66163a)]:
  - @reslide-dev/core@0.8.1

## 0.8.0

### Patch Changes

- Updated dependencies [[`0cd0cf1`](https://github.com/nisshi-dev/reslide/commit/0cd0cf105eaf168b90c878a5392f37ed61677600)]:
  - @reslide-dev/core@0.8.0
  - @reslide-dev/mdx@0.8.0

## 0.7.0

### Patch Changes

- Updated dependencies [[`635d053`](https://github.com/nisshi-dev/reslide/commit/635d05343253d998131c4e2296db7d4cd4256949)]:
  - @reslide-dev/core@0.7.0
  - @reslide-dev/mdx@0.7.0

## 0.6.0

### Patch Changes

- Updated dependencies [[`5519c87`](https://github.com/nisshi-dev/reslide/commit/5519c87671130ee2894bc7444be2943e42b64b4f)]:
  - @reslide-dev/core@0.6.0
  - @reslide-dev/mdx@0.6.0

## 0.5.0

### Patch Changes

- Updated dependencies [[`1e58aa5`](https://github.com/nisshi-dev/reslide/commit/1e58aa54df7bee4ca5c92304eef13ade9d922418)]:
  - @reslide-dev/core@0.5.0

## 0.4.0

### Patch Changes

- Updated dependencies [[`70ec361`](https://github.com/nisshi-dev/reslide/commit/70ec361fffcdc38e58a36d70b68eda5458e21a80)]:
  - @reslide-dev/mdx@0.4.0
  - @reslide-dev/core@0.4.0

## 0.3.1

### Patch Changes

- Updated dependencies [[`3c2e2a2`](https://github.com/nisshi-dev/reslide/commit/3c2e2a26d399d3882883e301408bf78de33bcb0b)]:
  - @reslide-dev/mdx@0.3.1
  - @reslide-dev/core@0.3.1

## 0.3.0

### Patch Changes

- Updated dependencies [[`803ae84`](https://github.com/nisshi-dev/reslide/commit/803ae8485c8f4a6bc63ef70aea905df1e3edd5c1)]:
  - @reslide-dev/core@0.3.0

## 0.2.2

### Patch Changes

- Updated dependencies [[`b65269e`](https://github.com/nisshi-dev/reslide/commit/b65269e4817c1a14b26b05ed91eefab3fccedf53)]:
  - @reslide-dev/core@0.2.2

## 0.2.1

### Patch Changes

- Updated dependencies [[`9742eb6`](https://github.com/nisshi-dev/reslide/commit/9742eb661f18391008477c3d546e14ab797c4c7a)]:
  - @reslide-dev/core@0.2.1
  - @reslide-dev/mdx@0.2.1

## 0.2.0

### Patch Changes

- Updated dependencies [[`1a67508`](https://github.com/nisshi-dev/reslide/commit/1a675088067cb799f2215f7f65c847cc2003cbe5), [`3392add`](https://github.com/nisshi-dev/reslide/commit/3392addfc28e4c48550924e2e88658e39f2a6393)]:
  - @reslide-dev/mdx@0.2.0
  - @reslide-dev/core@0.2.0

## 0.1.1

### Patch Changes

- Updated dependencies [[`990cf7b`](https://github.com/nisshi-dev/reslide/commit/990cf7be6510614ebc7cf09b90208e4cfa23de99)]:
  - @reslide-dev/mdx@0.1.1

## 0.1.0

### Patch Changes

- Updated dependencies [[`8a88c02`](https://github.com/nisshi-dev/reslide/commit/8a88c021281e9b9f3c883b55a81a7a829a6d3172)]:
  - @reslide-dev/core@0.1.0
  - @reslide-dev/mdx@0.1.0

## 0.0.2

### Patch Changes

- Updated dependencies [[`0115be1`](https://github.com/nisshi-dev/reslide/commit/0115be1c5bfbff06d17b3177aa8fd9a368cf4816)]:
  - @reslide-dev/core@0.0.2
  - @reslide-dev/mdx@0.0.2
