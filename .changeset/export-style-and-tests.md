---
"@reslide-dev/core": patch
"@reslide-dev/cli": minor
"@reslide-dev/mdx": patch
---

core: default.cssにtransition container/slideのheight:100%を追加
cli: parseSlideRange/generateEntryFilesをutils.tsに切り出し、ユニットテスト15件追加
mdx: \_Fragmentバインディングの二重宣言問題を修正、ランタイム実行テスト3件追加
