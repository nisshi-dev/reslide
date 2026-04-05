---
"@reslide-dev/core": patch
---

fix: ReslideServerEmbed の "use client" 境界を正しく分離

ビルド出力で ReslideEmbedClient が server.mjs にインライン化され、"use client" ディレクティブが消失していた問題を修正。Next.js App Router の Server Component から使用した際に createContext エラーが発生していた。
