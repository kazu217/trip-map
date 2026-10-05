# Google Play Console Submission

TripMap Android版をGoogle Play Consoleへ登録するための入力メモです。

## App Creation

- App name: `TripMap`
- Default language: `Japanese - ja-JP`
- App or game: `App`
- Free or paid: `Free`
- Declarations:
  - Developer Program Policies: checked
  - US export laws: checked

Package name:

```text
com.tripmap.app
```

Upload file:

```text
dist/android/TripMap-production.aab
```

## Store Listing

Short description:

```text
旅行予約・行き先・日程を地図とタイムラインでまとめて管理
```

Full description:

```text
TripMapは、複数の予約サイトやメールに散らばりがちな旅行情報を、旅行単位でまとめて管理できる旅行管理アプリです。

ホテル、観光地、オプショナルツアー、バスや電車などの移動予定を登録し、地図と日程表で確認できます。旅行中に「次はどこへ行くのか」「何時にチェックインするのか」「予約番号はどこか」をすぐ見返せるように設計しています。

主な機能:
- 旅行の作成、編集、アーカイブ
- ホテル、観光地、ツアー、交通機関の予定登録
- 住所、日時、料金、予約サイト、確認番号、公式URL、メモの保存
- 地図上でカテゴリ別ピンを表示
- 日付別タイムラインで予定を確認
- チケット画像やQRコード画像の添付
- Firebase設定時のクラウド同期
- Firebase未設定時の端末内保存

TripMapは、旅行前の準備から旅行中の確認まで、予約情報をひとつの場所にまとめたい人のためのアプリです。
```

## Categorization

- App category: `Travel & Local`
- Tags候補:
  - `Travel planner`
  - `Itinerary`
  - `Maps`

## Contact Details

- Website: 未定
- Email: Google Play Consoleで利用する連絡先メールを入力
- Phone: 任意

## Privacy Policy

ローカル下書き:

```text
docs/PRIVACY_POLICY.md
```

Google Playには公開URLが必要です。GitHub Pages、Google Sites、Notion公開ページ、または自分のWebサイトに掲載してURLを入力してください。

## Screenshots

Google Play ConsoleのPhone screenshotsには、次の画像をアップロードします。

```text
dist/play-console/screenshots/android-phone-01-home.png
dist/play-console/screenshots/android-phone-02-trip-map.png
dist/play-console/screenshots/android-phone-03-itinerary.png
dist/play-console/screenshots/android-phone-04-itinerary-list.png
dist/play-console/screenshots/android-phone-05-spot-detail.png
```

Graphic assets:

```text
assets/icon.png
dist/play-console/feature-graphic.png
```

## App Access

- All functionality is available without special access: `Yes`
- Login credentials required: `No`

TripMapはFirebase設定時に匿名認証を使いますが、ユーザーがログイン情報を入力する画面はありません。

## Ads

- Contains ads: `No`

## Content Rating

想定回答:

- App type: utility/travel planning
- Violence, sexual content, controlled substances, gambling: `No`
- User-generated content shared publicly: `No`
- Online interaction with other users: `No`

## Target Audience

推奨:

- Target age group: `18+`
- Designed for children: `No`

旅行予約番号、宿泊先、移動予定など大人向けの旅行管理情報を扱うためです。

## Data Safety Draft

Data collected:

- Personal info:
  - User IDs: Firebase匿名認証IDをクラウド同期時に使用
- Photos and videos:
  - Photos: ユーザーが選択したチケット画像やQRコード画像
- App activity:
  - App interactions / in-app content: 旅行、スポット、予約番号、メモなどユーザー入力データ

Data shared:

- No third-party sharing for advertising or sale
- Google/Firebase services are used as backend service providers when cloud sync is enabled

Security practices:

- Data is encrypted in transit: `Yes`
- Users can request data deletion: `Yes`, by contacting the developer email listed in the privacy policy
- Data collection is optional where applicable: image attachment and Firebase sync are optional

## Internal Testing

2026-07-21にGoogle Play Developer APIで内部テストを更新済みです。

- Track: `internal`
- Release name: `TripMap 1.2.3 (23)`
- Version code: `23`
- Status: `completed`
- Release notes: `Android版でGoogle Mapsの地図タイルが表示されない問題に対応しました。`

手動で更新する場合:

1. `Internal testing` を開く
2. 新しいリリースを作成
3. `dist/android/TripMap-production.aab` をアップロード
4. Release name: `TripMap 1.2.3 (23)`
5. Release notes:

```text
Android版でGoogle Mapsの地図タイルが表示されない問題に対応しました。
```

6. Review release
7. Start rollout to internal testing

最終送信はGoogle Play上の状態変更になるため、送信直前に内容を確認してください。

## Closed Testing

新しい個人デベロッパーアカウントで本番公開を申請する場合は、Closed testingで12人以上のテスターが14日連続でopt-inしている必要があります。

テスターはPlay Consoleの `Testing > Closed testing > Manage track > Testers` でメールリストとして追加できます。CSVを使う場合は、次の形式で1行1メールアドレスにします。

```text
tester1@example.com
tester2@example.com
```

ローカル確認用のCSVは `dist/play-console/closed-testers.csv` に置きます。`dist/` はgit管理外なので、メールアドレスをリポジトリへコミットしないでください。

Closed testingの公開後は、テスターへopt-inリンクを共有し、各Googleアカウントで14日間連続してopt-in状態を維持してもらってから本番アクセスを申請してください。
