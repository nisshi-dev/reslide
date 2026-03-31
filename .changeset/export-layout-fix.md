---
"@reslide-dev/core": patch
"@reslide-dev/cli": patch
---

core: SlideTransitionのcontainer/slideにwidth:100%/height:100%を追加し、export時に要素の高さが0になる問題を修正
cli: Tailwind v4の@sourceでスライドディレクトリを明示指定し、Viteルート外のクラスもスキャン対象に
