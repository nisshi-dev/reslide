---
"@reslide-dev/mdx": minor
"@reslide-dev/cli": patch
---

mdx: recmaExcludeInlinedComponentsプラグインを追加。ローカルインポートでインライン化されたコンポーネントをprops.componentsの分割代入から除外し、ReslideEmbedのcomponents propへの登録なしで動作するように。
cli: Viteサーバーにserver.fs.allowを追加し、スライドディレクトリ外のファイルアクセスを許可。
