import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Linking, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ExternalLink, MapPinned, Navigation, Pencil, Trash2 } from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { AttachmentStrip } from '../components/AttachmentStrip';
import { CategoryBadge } from '../components/CategoryBadge';
import { EmptyState } from '../components/EmptyState';
import { FileAttachmentList } from '../components/FileAttachmentList';
import { colors, radius, spacing } from '../constants/theme';
import { spotTypeLabels, transportModeLabels } from '../constants/categories';
import { TripsStackParamList } from '../navigation/types';
import { useTripStore } from '../store/tripStore';
import { cancelReminder } from '../services/notifications';
import { compareSpotsByTime, displayTimeRange, formatDate } from '../utils/date';
import { formatPrice, normalizeUrl } from '../utils/format';
import {
  calculateDurationFromTimes,
  createGoogleMapsNavigationUrl,
  createGoogleMapsRouteUrl,
  spotDestinationText,
  spotLocationText
} from '../utils/transport';

type Props = NativeStackScreenProps<TripsStackParamList, 'SpotDetail'>;

const DetailRow = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
};

export const SpotDetailScreen = ({ navigation, route }: Props) => {
  const { tripId, spotId } = route.params;
  const trip = useTripStore((state) => state.trips.find((item) => item.id === tripId));
  const spot = trip?.spots.find((item) => item.id === spotId);
  const deleteSpot = useTripStore((state) => state.deleteSpot);

  if (!trip || !spot) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <EmptyState title="スポットが見つかりません" message="旅行詳細から選び直してください。" />
        </View>
      </SafeAreaView>
    );
  }

  const openUrl = async (value?: string) => {
    const url = normalizeUrl(value);
    if (!url) return;

    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert('URLを開けません', url);
      return;
    }

    await Linking.openURL(url);
  };

  const openOfficialUrl = () => openUrl(spot.officialUrl);

  const confirmDelete = () => {
    Alert.alert('スポットを削除しますか？', 'この操作は元に戻せません。', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          await Promise.all([
            cancelReminder(spot.cancellationNotificationId),
            cancelReminder(spot.eventNotificationId)
          ]);
          deleteSpot(trip.id, spot.id);
          navigation.goBack();
        }
      }
    ]);
  };

  const price = formatPrice(spot.price, spot.currency);
  const transportMode = spot.transportMode ? transportModeLabels[spot.transportMode] : '';
  const routeUrl =
    spot.routeUrl ||
    (spot.type === 'transport' ? createGoogleMapsRouteUrl(spot.address, spot.destinationAddress || '', spot.transportMode) : '');
  const travelDuration =
    spot.travelDuration || (spot.type === 'transport' ? calculateDurationFromTimes(spot.startTime, spot.endTime) : '');
  const navigationUrl = createGoogleMapsNavigationUrl(spotLocationText(spot), spot.transportMode);
  const arrivalNavigationUrl =
    spot.type === 'transport' && (spot.destinationAddress || spot.destinationLat !== undefined)
      ? createGoogleMapsNavigationUrl(spotDestinationText(spot), spot.transportMode)
      : '';
  const orderedSpots = trip.spots.slice().sort(compareSpotsByTime);
  const currentIndex = orderedSpots.findIndex((item) => item.id === spot.id);
  const nextSpot = currentIndex >= 0 ? orderedSpots[currentIndex + 1] : undefined;
  const nextRouteUrl = nextSpot
    ? createGoogleMapsRouteUrl(spotLocationText(spot), spotLocationText(nextSpot))
    : '';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <CategoryBadge type={spot.type} />
          <Text style={styles.title}>{spot.name}</Text>
          <Text style={styles.meta}>
            {formatDate(spot.date, true)} / {displayTimeRange(spot.startTime, spot.endTime)}
          </Text>
        </View>

        <View style={styles.actions}>
          {navigationUrl ? (
            <AppButton
              label={spot.type === 'transport' ? '出発地へナビ' : 'この場所へナビ'}
              icon={<Navigation size={17} color={colors.surface} />}
              onPress={() => openUrl(navigationUrl)}
            />
          ) : null}
          {arrivalNavigationUrl ? (
            <AppButton
              label="到着地へナビ"
              variant="secondary"
              icon={<Navigation size={17} color={colors.text} />}
              onPress={() => openUrl(arrivalNavigationUrl)}
            />
          ) : null}
          <AppButton
            label="編集"
            variant="secondary"
            icon={<Pencil size={17} color={colors.text} />}
            onPress={() => navigation.navigate('SpotForm', { tripId: trip.id, spotId: spot.id })}
          />
          {spot.officialUrl ? (
            <AppButton
              label="URLを開く"
              icon={<ExternalLink size={17} color={colors.surface} />}
              onPress={openOfficialUrl}
            />
          ) : null}
          {routeUrl ? (
            <AppButton
              label="ルートを見る"
              variant="secondary"
              icon={<MapPinned size={17} color={colors.text} />}
              onPress={() => openUrl(routeUrl)}
            />
          ) : null}
          {nextRouteUrl && nextSpot ? (
            <AppButton
              label="次の予定までのルート"
              variant="secondary"
              icon={<MapPinned size={17} color={colors.text} />}
              onPress={() => openUrl(nextRouteUrl)}
            />
          ) : null}
        </View>

        <View style={styles.panel}>
          <DetailRow label={spot.type === 'transport' ? '出発地' : '住所 / 集合場所'} value={spot.address} />
          <DetailRow label="到着地" value={spot.destinationAddress} />
          <DetailRow label="交通種別" value={transportMode} />
          <DetailRow label="所要時間" value={travelDuration} />
          <DetailRow label="終了日" value={spot.endDate ? formatDate(spot.endDate, true) : ''} />
          <DetailRow label="料金" value={price} />
          <DetailRow label="予約サイト" value={spot.bookingSite} />
          <DetailRow label="確認番号" value={spot.confirmationNumber} />
          <DetailRow
            label="キャンセル料が発生する日"
            value={spot.cancellationFeeStartDate ? formatDate(spot.cancellationFeeStartDate, true) : ''}
          />
          <DetailRow
            label="予定の通知"
            value={spot.eventReminderEnabled ? '予定日の前日午前9時に通知' : ''}
          />
          <DetailRow
            label="キャンセル通知"
            value={spot.cancellationReminderEnabled ? '前日の午前9時に通知' : ''}
          />
          <DetailRow label="電話番号" value={spot.phone} />
          <DetailRow label={spot.type === 'hotel' ? 'フロント / チェックイン案内' : '営業時間'} value={spot.businessHours} />
          <DetailRow label="施設情報" value={spot.placeDetails} />
          <DetailRow label="公式/チケットURL" value={spot.officialUrl} />
          <DetailRow label="Google MapsルートURL" value={routeUrl} />
          <DetailRow label="緯度経度" value={spot.lat !== undefined && spot.lng !== undefined ? `${spot.lat}, ${spot.lng}` : ''} />
          <DetailRow
            label="到着地の緯度経度"
            value={
              spot.destinationLat !== undefined && spot.destinationLng !== undefined
                ? `${spot.destinationLat}, ${spot.destinationLng}`
                : ''
            }
          />
          <DetailRow label="メモ" value={spot.notes} />
          <DetailRow
            label="次の予定"
            value={
              nextSpot
                ? `${spotTypeLabels[nextSpot.type]} / ${nextSpot.name} / ${formatDate(nextSpot.date, true)} ${nextSpot.startTime || ''}`.trim()
                : ''
            }
          />
        </View>

        <AttachmentStrip attachments={spot.attachments} />
        <FileAttachmentList files={spot.files || []} />

        <AppButton label="スポットを削除" variant="danger" icon={<Trash2 size={17} color={colors.surface} />} onPress={confirmDelete} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg
  },
  hero: {
    gap: spacing.sm
  },
  title: {
    color: colors.text,
    fontSize: 29,
    fontWeight: '900'
  },
  meta: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md
  },
  panel: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden'
  },
  detailRow: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.xs
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800'
  },
  detailValue: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600'
  }
});
