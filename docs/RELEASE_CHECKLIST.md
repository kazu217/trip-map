# Release Checklist

## 共通

- [ ] `.env` を本番Firebase/Mapsに設定
- [ ] Firestore Rulesを本番用に更新
- [ ] Storage Rulesを本番用に更新
- [ ] `npm run prebuild:all` が通る
- [ ] `npm run typecheck` が通る
- [ ] 実機で旅行/スポットCRUDを確認
- [ ] 実機で地図表示を確認
- [ ] 添付画像の権限文言を確認
- [ ] プライバシーポリシーを用意

## iOS

- [ ] Apple Developer Account
- [ ] Bundle Identifier確認
- [ ] App Store Connect登録
- [ ] スクリーンショット作成
- [ ] TestFlight確認

## Android

- [ ] Google Play Console
- [ ] Package name確認
- [ ] 署名鍵管理
- [ ] `android/keystores/tripmap-upload-key.jks` と `android/keystore.properties` を安全な場所にバックアップ
- [ ] Internal testing確認
- [ ] Data safety記入
