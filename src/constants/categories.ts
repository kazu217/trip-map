import { colors } from './theme';
import { SpotType, TransportMode } from '../types/models';

export const spotTypeLabels: Record<SpotType, string> = {
  hotel: 'ホテル',
  attraction: '観光地',
  restaurant: 'レストラン',
  tour: 'ツアー',
  transport: '交通'
};

export const spotTypeColors: Record<SpotType, string> = {
  hotel: colors.hotel,
  attraction: colors.attraction,
  restaurant: colors.restaurant,
  tour: colors.tour,
  transport: colors.transport
};

export const spotTypeHints: Record<SpotType, string> = {
  hotel: 'チェックイン、予約番号、宿泊料金',
  attraction: '訪問予定、営業時間、入場料',
  restaurant: '予約時刻、営業時間、予約情報',
  tour: '集合場所、集合時間、予約番号',
  transport: '出発地、到着地、チケットURL'
};

export const transportModeLabels: Record<TransportMode, string> = {
  bus: 'バス',
  train: '電車',
  ferry: 'フェリー',
  flight: '飛行機',
  taxi: 'タクシー',
  walk: '徒歩',
  other: 'その他'
};

export const spotTypes: SpotType[] = ['hotel', 'attraction', 'restaurant', 'tour', 'transport'];

export const transportModes: TransportMode[] = ['bus', 'train', 'ferry', 'flight', 'taxi', 'walk', 'other'];
