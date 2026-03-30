# 0004. サインアウト処理の耐障害性確保と未使用依存の削除

## Status

Proposed

## Date

2026-03-30

## Context

サインアウト処理で `revokeUserSessions()`（Firebase Admin SDK）が失敗した場合、後続の `clearSessionCookie()` が実行されず、無効なセッションクッキーがブラウザに残り続ける問題が発生していた。この状態では再ログインが不可能になり、ユーザーはブラウザのクッキーを手動で削除する必要があった。

Firebase Admin SDK の失敗原因としては、サービスアカウントキーの失効、ネットワーク障害、Vercel サーバーレス環境でのコールドスタート時の一時的エラーなどが考えられる。

また、依存関係の調査により、`firebase`（クライアント SDK）パッケージが未使用であることが判明した。本プロジェクトではサーバーサイドで `firebase-admin` を、クライアントサイドでは Firebase REST API を直接使用しており、クライアント SDK は不要だった。

## Decision

1. **サインアウトの耐障害性**: `revokeUserSessions()` を try-catch で囲み、Firebase Admin SDK の失敗がサインアウトフロー全体をブロックしないようにした。クッキー削除とリダイレクトは常に実行される。

2. **未使用依存の削除**: `firebase` パッケージを `apps/web` の依存関係から削除した。

## Consequences

### Positive

- ユーザーがサインアウトできなくなる問題が解消される
- Firebase Admin SDK の一時的な障害がユーザー体験に影響しなくなる
- 未使用パッケージ削除によりバンドルサイズが削減される（firebase パッケージは約 45 の transitive dependencies を持つ）
- `pnpm install` の速度が向上する

### Negative

- トークン無効化が失敗した場合、Firebase のリフレッシュトークンが自然失効まで有効なまま残る（部分的サインアウト状態）
- 失敗がサイレントに処理されるため、Firebase Admin SDK の認証情報問題に気づきにくくなる可能性がある

## Compliance

- サインアウト後の再ログインが正常に動作することを E2E テストで検証可能
- 将来的にログ基盤を導入した際、catch ブロックにエラーログを追加すべき
- `firebase` パッケージの再追加を防ぐため、`pnpm --filter web list firebase` で不在を確認可能

## Notes

- Author: Claude Code
- Version: 0.1
- Changelog:
  - 0.1: Initial proposed version
