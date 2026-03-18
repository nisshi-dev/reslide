---
name: changeset
description: This skill should be used when the user asks to "add a changeset", "create a changeset", "prepare a release", "bump version", or mentions changesets, versioning, or npm publishing for the reslide project.
---

# Changeset 作成

reslide モノレポの変更内容を記録し、npm リリースのバージョン管理を行う changeset ファイルを作成する。

## ワークフロー

1. `git diff main...HEAD --stat` で変更されたファイルを特定
2. 変更内容から対象パッケージとバージョン種別を判断
3. `.changeset/<説明的な名前>.md` にファイルを作成

## 対象パッケージ

publish 対象は以下の 3 パッケージ（`linked` 設定で全て同じバージョンに連動）：

| ディレクトリ     | パッケージ名        |
| ---------------- | ------------------- |
| `packages/core/` | `@reslide-dev/core` |
| `packages/mdx/`  | `@reslide-dev/mdx`  |
| `packages/cli/`  | `@reslide-dev/cli`  |

`apps/website/` と `packages/utils/` は publish 対象外。website のみの変更なら changeset 不要。

## バージョン種別

| 種別    | 用途                                             |
| ------- | ------------------------------------------------ |
| `patch` | バグ修正、内部リファクタリング、ドキュメント修正 |
| `minor` | 新機能追加、後方互換のある API 変更              |
| `major` | 破壊的変更、API の削除・変更                     |

## ファイル形式

ファイル名はケバブケースで変更内容を表す（例: `fix-mark-styles.md`）。

```markdown
---
"@reslide-dev/core": patch
"@reslide-dev/mdx": minor
---

変更内容の要約（1〜2行）
```

- frontmatter に変更があったパッケージとバージョン種別のみ記述
- linked 設定により、記載していないパッケージも自動で同じバージョンに連動する
- 複数パッケージに変更がある場合、各パッケージごとに適切な種別を指定する
