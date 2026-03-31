---
"@reslide-dev/cli": patch
"@reslide-dev/mdx": patch
"@reslide-dev/core": patch
---

cli: CSS background-imageの読み込み待機をIIFEで正しく実行、初回+遷移後で実行
mdx: remarkExtractCssImportsを行分割処理に変更し連続importの根本原因を修正、\_Fragmentバインディング追加
core: SlideSkeltonのレイアウト改善、画像ロード待ちに5秒タイムアウト追加
