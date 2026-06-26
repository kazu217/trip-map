# Firebase Setup

## 有効化するサービス

- Authentication: Anonymous provider
- Firestore Database
- Storage

## 環境変数

`.env.example` を `.env` にコピーし、Firebase Web appの値を設定します。

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_STORAGE_ENABLED=false
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

Expoでは `EXPO_PUBLIC_` が付いた値だけがクライアントへ公開されます。Firebase Web設定値は公開前提ですが、Firestore/Storage Rulesで保護してください。

Cloud Storageを利用するにはFirebaseの有料プランが必要です。無料プランでは
`EXPO_PUBLIC_FIREBASE_STORAGE_ENABLED=false` のままにすると、添付画像を端末内へ保存します。

## Firestore Rules例

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Storage Rules例

```text
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 現在の実装

- 設定画面では利用者向けに「旅行データのバックアップ」と表示
- 匿名認証でユーザーを作成
- 「ネット上にバックアップ」でFirestoreへ旅行/スポットを保存
- 「バックアップを読み込む」で端末の旅行データをFirestoreの内容に置換
- Firebase設定済みの場合、スポットフォームの添付画像をStorageへアップロードしてURL保存
- Firebase未設定の場合、添付画像は端末ローカルURIとして保存

匿名認証のため、現在のバックアップは同じアプリ内の利用者番号にひも付きます。
別端末やアプリ再インストール後の復元には、将来Google/Apple等のログイン機能が必要です。
利用者番号はAsyncStorageへ保存されるため、通常のアプリ終了・再起動やアプリ更新では維持されます。
