---
"@reslide-dev/core": minor
---

feat: 埋め込みモード UI のカスタマイズ対応

EmbeddedOptions に `toolbar`, `progressBar`, `clickNavigation`, `slideNumbers`, `toolbarComponent` オプションを追加。埋め込み時のツールバー・プログレスバー・クリックナビゲーション等を個別に表示/非表示でき、カスタムツールバーコンポーネントで完全に差し替え可能に。ReslideServerEmbed にも `toolbar`, `progressBar`, `clickNavigation` props を追加。
