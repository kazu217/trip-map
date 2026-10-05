# Android / iPhone Build

TripMapはExpo + React Nativeアプリとして、Android版とiPhone版を同じコードベースから作成します。

## 1. 事前準備

```bash
npm install
cp .env.example .env
```

Google MapsとFirebaseを使う場合は `.env` に値を入れてください。APIキー未設定でもアプリは起動し、地図はフォールバック表示になります。Android本番ビルドでは `EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY`、`GOOGLE_MAPS_ANDROID_API_KEY`、または `GOOGLE_MAPS_API_KEY` のいずれかをビルド環境に設定してください。

## 2. Expo Goで確認

```bash
npm run start
```

- Android: Expo GoでQRを読み取る
- iPhone: Expo GoでQRを読み取る

## 3. ネイティブプロジェクト生成

```bash
npm run prebuild:all
```

生成物:

- `android/`: Android Studio / Gradle用プロジェクト
- `ios/`: Xcode用プロジェクト

## 4. ローカル実行

Android SDKが入っている場合:

```bash
npm run run:android
```

Xcodeが入っている場合:

```bash
npm run run:ios
```

## 5. ローカル成果物ビルド

このリポジトリでは、手元のMacで確認できるビルドコマンドも用意しています。

Android debug APK:

```bash
npm run build:android:debug:local
```

出力先:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Android local release APK:

```bash
npm run build:android:release:local
```

出力先:

```text
android/app/build/outputs/apk/release/app-release.apk
```

ローカルrelease APKは容量を抑えるため `arm64-v8a` のみをビルドし、生成時のdebug keystoreで署名されます。端末確認用として使い、Google Play提出時はEASまたは本番用keystoreで署名したAABを作成してください。

このコマンドは `ANDROID_HOME=$HOME/Library/Android/sdk` と `JAVA_HOME=/opt/homebrew/opt/openjdk@17` を前提にしています。

Android local release AAB:

```bash
npm run build:android:aab:local
```

出力先:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

このプロジェクトでは `android/keystore.properties` が存在する場合、`android/keystores/tripmap-upload-key.jks` を使ってrelease bundleを署名します。

`android/keystore.properties` と `android/keystores/` は `.gitignore` 対象です。Google Playへ提出した後は、同じ鍵がないとアプリを更新できません。別の安全な場所にも必ずバックアップしてください。

iPhoneシミュレーター用 `.app`:

```bash
npm run build:ios:simulator:local
```

このコマンドは現在のローカル環境にある `iPhone 17` シミュレーターを使い、容量を抑えるため `ONLY_ACTIVE_ARCH=YES ARCHS=arm64` でビルドします。別のシミュレーター名を使う場合は `package.json` の `build:ios:simulator:local` を変更してください。

iPhone Releaseシミュレーター用 `.app`:

```bash
npm run build:ios:release-simulator:local
```

出力先はXcodeのDerivedData配下です。確認するには次を実行します。

```bash
find ~/Library/Developer/Xcode/DerivedData -path '*TripMap.app' -type d
```

実機インストールやApp Store配布用IPAはAppleの署名が必要です。

## 6. 配布用ビルド

EASにログインしてから実行します。

```bash
npx --yes eas-cli login
```

Android APK:

```bash
npm run build:android:apk
```

Android App Bundle:

```bash
npm run build:android:aab
```

iPhoneシミュレーター用:

```bash
npm run build:ios:simulator
```

iPhone/App Store配布用IPA:

```bash
npm run build:ios:ipa
```

## 7. ストア公開に必要なもの

Android:

- Google Play Consoleアカウント
- 本番用Firebase/Google Maps設定
- Google Maps APIキーはAndroidアプリ制限に `com.tripmap.app` と本番署名証明書のSHA-1を登録
- プライバシーポリシー
- Data safety入力

iPhone:

- Apple Developer Program
- App Store Connect登録
- Bundle ID `com.tripmap.app`
- 本番用Firebase/Google Maps設定
- プライバシーポリシー

## 8. 現在のビルド設定

- Android package: `com.tripmap.app`
- iOS bundle identifier: `com.tripmap.app`
- EAS profile:
  - `preview`: Android APK
  - `simulator`: iOS simulator
  - `production`: Android AAB / iOS IPA

## 9. 今回確認済みのローカル環境

- Android SDK: `$HOME/Library/Android/sdk`
- JDK: `/opt/homebrew/opt/openjdk@17`
- CocoaPods: Homebrew経由
- iOS workspace: `ios/TripMap.xcworkspace`

## 10. 生成済み成果物

この作業時点で、確認済みの成果物は `dist/` にまとめています。

- `dist/android/TripMap-debug.apk`: Android debug APK
- `dist/android/TripMap-release-arm64.apk`: Android local release APK。`arm64-v8a`のみ、debug keystore署名
- `dist/android/TripMap-production.aab`: Android local release AAB。local upload keystore署名
- `dist/ios/TripMap.app`: iPhone Debugシミュレーター用アプリ
- `dist/ios/TripMap-release-simulator.app`: iPhone Releaseシミュレーター用アプリ

`dist/` は `.gitignore` 対象です。成果物を再生成する場合は、このドキュメントのローカルビルドコマンドを実行してください。
