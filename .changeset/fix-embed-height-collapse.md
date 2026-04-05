---
"@reslide-dev/core": patch
---

fix: ReslideEmbed が高さ固定の親なしで高さ0になるバグを修正

aspectRatio が指定されている場合、最外コンテナに height:100% ではなく aspect-ratio を設定するよう変更。Deck の letterbox-inner からも height:100% を削除し、aspect-ratio との競合を解消。ブログ記事等のフローレイアウトに埋め込んだ際にスライドが正しく表示されるようになった。
