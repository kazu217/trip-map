# Data Model

## Trip

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | string | yes | クライアント生成ID |
| title | string | yes | 旅行名 |
| destination | string | yes | 主な目的地 |
| startDate | ISO string | yes | 出発日 |
| endDate | ISO string | yes | 帰国日 |
| coverImageUrl | string | no | カバー画像 |
| isArchived | boolean | yes | アーカイブ状態 |
| createdAt | ISO string | yes | 作成日時 |
| updatedAt | ISO string | yes | 更新日時 |
| spots | Spot[] | yes | 旅行内スポット |
| notebookPages | NotebookPage[] | yes | 自由ノートのページ |
| planItems | PlanItem[] | yes | 日付確定前の「やること」 |

## Spot

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | string | yes | クライアント生成ID |
| type | hotel / attraction / tour / transport | yes | カテゴリ |
| name | string | yes | 名称 |
| address | string | no | 住所、集合場所、出発地 |
| destinationAddress | string | no | 交通機関の到着地 |
| lat | number | no | 緯度 |
| lng | number | no | 経度 |
| date | ISO string | yes | 訪問/チェックイン/出発日 |
| endDate | ISO string | no | チェックアウト/終了日 |
| startTime | string | no | 開始時刻 |
| endTime | string | no | 終了時刻 |
| price | number | no | 金額 |
| currency | string | no | 通貨 |
| bookingSite | string | no | 予約サイト |
| confirmationNumber | string | no | 確認番号 |
| officialUrl | string | no | 公式URL |
| notes | string | no | メモ |
| attachments | string[] | yes | 画像URIまたはStorage URL |
| files | FileAttachment[] | yes | PDFなどのファイル名、URI、種類、サイズ |
| transportMode | string | no | バス、電車、フェリーなど |
| cancellationFeeStartDate | ISO string | no | キャンセル料が発生する日 |
| cancellationReminderEnabled | boolean | no | 前日通知の設定 |
| cancellationNotificationId | string | no | 端末に予約した通知ID |
| eventReminderEnabled | boolean | no | 予定日の前日通知の設定 |
| eventNotificationId | string | no | 予定通知の端末内ID |
| createdAt | ISO string | yes | 作成日時 |
| updatedAt | ISO string | yes | 更新日時 |

## NotebookPage

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | string | yes | クライアント生成ID |
| title | string | no | ページ名 |
| body | string | no | 自由入力の本文 |
| links | string[] | yes | リンク集 |
| attachments | string[] | yes | 画像URIまたはStorage URL |
| createdAt | ISO string | yes | 作成日時 |
| updatedAt | ISO string | yes | 更新日時 |

## PlanItem

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | string | yes | クライアント生成ID |
| type | attraction / restaurant / tour / transport | yes | 種類 |
| title | string | yes | やること |
| address | string | no | 場所、集合場所 |
| officialUrl | string | no | 参考URL |
| notes | string | no | 天気や予約条件などのメモ |
| candidateDate1 / 2 / 3 | ISO string | no | 候補日 |
| candidateStartTime1 / 2 / 3 | string | no | 開始候補時刻 |
| candidateEndTime1 / 2 / 3 | string | no | 終了候補時刻 |
| candidateNote1 / 2 / 3 | string | no | 候補ごとのメモ |
| createdAt | ISO string | yes | 作成日時 |
| updatedAt | ISO string | yes | 更新日時 |

## Firestore

```text
users/{userId}
  trips/{tripId}
    spots/{spotId}
```

Firestoreでは日付をTimestampとして保存し、アプリ内部ではフォーム操作しやすいISO stringへ変換します。
