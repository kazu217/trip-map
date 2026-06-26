# Architecture

## 技術構成

| 領域 | 採用 |
| --- | --- |
| モバイル | Expo + React Native + TypeScript |
| ナビゲーション | React Navigation |
| 状態管理 | Zustand + AsyncStorage persist |
| 地図 | react-native-maps、Web/未設定時はフォールバック地図 |
| バックエンド | Firebase Auth、Firestore、Storage |
| 添付 | expo-image-picker、Firebase Storage連携予定 |

## ディレクトリ

```text
src/
  components/   再利用UI
  constants/    色、カテゴリ、テーマ
  data/         初期サンプル
  navigation/   画面遷移
  screens/      画面
  services/     Firebase、クラウド同期、画像選択
  store/        Zustandストア
  types/        型定義
  utils/        日付/表示ヘルパー
```

## 状態の流れ

1. アプリ起動時にAsyncStorageから旅行データを復元
2. 初回のみサンプル旅行を投入
3. フォーム画面で旅行/スポットを更新
4. Zustand persistがローカル保存
5. 設定画面からFirebase同期を実行すると、匿名認証後にFirestoreへ保存/読込

## Firebase同期方針

現時点のMVPはローカル保存を主導にし、Firebaseは明示同期です。APIキーやルール調整が済んだら、自動同期、競合解決、Storageアップロードを追加します。
