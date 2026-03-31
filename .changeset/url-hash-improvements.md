---
"@reslide-dev/core": minor
"@reslide-dev/mdx": minor
"@reslide-dev/cli": minor
---

core: URLハッシュによるスライド位置保持、SlideNumber CSS変数対応、ReslideEmbed FOUC防止（画像読み込み待機+フェードイン）
mdx: countSlidesのレイアウト付き区切り二重カウント修正、ローカルインポートのjsx-runtime除去、esbuild→sucrase移行（ネイティブバイナリ依存解消）
cli: exportコマンド安定性改善（1920x1080キャプチャ→リサイズ、待機時間延長、フォールバックセレクタ）
