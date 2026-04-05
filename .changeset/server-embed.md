---
"@reslide-dev/core": minor
---

ReslideServerEmbed: RSC対応の Server Component を追加。`@reslide-dev/core/server` からインポート可能。data が null/undefined 時のフォールバックUI内蔵。

`@reslide-dev/core/embed` サブパスエクスポートを追加。ReslideEmbed のみの軽量エントリポイント。

CSS テーマを composable 化。default.css のハードコード値をカスタムプロパティに切り出し、dark.css / bare.css はプロパティの上書きだけに簡素化。
