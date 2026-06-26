# Google Maps Setup

## 必要なAPI

- Maps SDK for iOS
- Maps SDK for Android
- 必要に応じて Places API

## 環境変数

```bash
EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY=
EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY=
```

## Expo設定

`app.json` の `ios.config.googleMapsApiKey` と `android.config.googleMaps.apiKey` が環境変数を参照します。EAS Buildやローカルプリビルド時は、ビルド環境にも同じ変数を設定してください。

## フォールバック

WebまたはMap SDKが使えない環境では、座標をもとにした簡易マップを表示します。APIキー設定後の実機では `react-native-maps` がカテゴリ別ピンとルート線を表示します。
