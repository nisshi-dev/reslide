---
"@reslide-dev/cli": patch
"@reslide-dev/mdx": patch
---

cli: @tailwindcss/viteをdependenciesに追加（--tailwind使用時にユーザー側のインストールが不要に）
mdx: 連続import文が1つのmdxjsEsmノードに結合される場合も正しく処理するように修正
