---
"@reslide-dev/core": minor
"@reslide-dev/mdx": minor
---

埋め込み機能の追加: ReslideRemoteEmbed、toEmbedData、embedded モード

- `@reslide-dev/core`: URLからコンパイル済みスライドデータをfetchして描画する `ReslideRemoteEmbed` コンポーネントを追加
- `@reslide-dev/core`: 記事内埋め込みに適したミニマルコントロールバーを表示する `embedded` prop を `Deck`/`ReslideEmbed`/`ReslideRemoteEmbed` に追加
- `@reslide-dev/mdx`: `CompileResult` を API レスポンス用 JSON に変換する `toEmbedData` 関数と `ReslideEmbedData` 型を追加
