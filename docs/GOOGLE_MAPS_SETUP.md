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

ネイティブビルドだけにAPIキーを渡したい場合は、次の非公開名も使えます。
JS側にはキーそのものではなく、設定済みかどうかのフラグだけが渡されます。

```bash
GOOGLE_MAPS_IOS_API_KEY=
GOOGLE_MAPS_ANDROID_API_KEY=
GOOGLE_MAPS_API_KEY=
```

`GOOGLE_MAPS_API_KEY` は Android 用の共通フォールバックです。

## Expo設定

`app.config.js` の `ios.config.googleMapsApiKey` と `android.config.googleMaps.apiKey` が環境変数を参照します。EAS Buildやローカルプリビルド時は、ビルド環境にも同じ変数を設定してください。

Androidでは、ビルド時にGoogle Mapsキーが存在したかどうかを `extra.googleMapsAndroidConfigured` としてアプリに埋め込みます。これにより、本番ビルドでJS側の公開環境変数が省略されても `react-native-maps` のネイティブ地図を表示できます。

## フォールバック

WebまたはMap SDKが使えない環境では、座標をもとにした簡易マップを表示します。APIキー設定後の実機では `react-native-maps` がカテゴリ別ピンとルート線を表示します。
