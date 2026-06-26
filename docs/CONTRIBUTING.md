# Contributing

## 開発前

```bash
npm install
cp .env.example .env
npm run start
```

## コーディング方針

- TypeScript strictを維持
- 画面固有ロジックは `screens/`、再利用UIは `components/`
- 日付処理は `utils/date.ts` に寄せる
- Firebase直接操作は `services/` に閉じ込める
- 旅行/スポット更新は `store/tripStore.ts` を通す

## 変更確認

```bash
npm run typecheck
```

## PR前チェック

- 主要フローを実機またはExpo Goで確認
- 新規フィールドを追加したら `docs/DATA_MODEL.md` を更新
- 新規画面を追加したら `docs/SCREEN_SPEC.md` を更新
