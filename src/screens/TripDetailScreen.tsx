import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Archive, CalendarDays, FileInput, ListTodo, NotebookPen, Pencil, Plus, Share2, Trash2 } from 'lucide-react-native';
import { useLayoutEffect, useState } from 'react';

import { AppButton } from '../components/AppButton';
import { EmptyState } from '../components/EmptyState';
import { SegmentedControl } from '../components/SegmentedControl';
import { colors, spacing } from '../constants/theme';
import { TripsStackParamList } from '../navigation/types';
import { useTripStore } from '../store/tripStore';
import { formatDateRange, tripDays } from '../utils/date';
import { ItineraryScreen } from './ItineraryScreen';
import { MapScreen } from './MapScreen';
import { cancelReminder } from '../services/notifications';
import { shareTrip } from '../services/tripShare';

type Props = NativeStackScreenProps<TripsStackParamList, 'TripDetail'>;

export const TripDetailScreen = ({ navigation, route }: Props) => {
  const { tripId } = route.params;
  const trip = useTripStore((state) => state.trips.find((item) => item.id === tripId));
  const deleteTrip = useTripStore((state) => state.deleteTrip);
  const toggleArchive = useTripStore((state) => state.toggleTripArchive);
  const [tab, setTab] = useState<'map' | 'itinerary'>('map');

  useLayoutEffect(() => {
    navigation.setOptions({ title: trip?.title || '旅行詳細' });
  }, [navigation, trip?.title]);

  if (!trip) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <EmptyState title="旅行が見つかりません" message="一覧へ戻って旅行を選び直してください。" />
        </View>
      </SafeAreaView>
    );
  }

  const confirmDelete = () => {
    Alert.alert('旅行を削除しますか？', 'この旅行に登録したスポットも削除されます。', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          await Promise.all(
            trip.spots.flatMap((spot) => [
              cancelReminder(spot.cancellationNotificationId),
              cancelReminder(spot.eventNotificationId)
            ])
          );
          deleteTrip(trip.id);
          navigation.popToTop();
        }
      }
    ]);
  };

  const share = async () => {
    try {
      await shareTrip(trip);
    } catch {
      Alert.alert('共有できませんでした', 'もう一度お試しください。');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.destination}>{trip.destination}</Text>
          <Text style={styles.title}>{trip.title}</Text>
          <View style={styles.metaRow}>
            <CalendarDays size={17} color={colors.textMuted} />
            <Text style={styles.meta}>{formatDateRange(trip.startDate, trip.endDate)}</Text>
          </View>
          <Text style={styles.summary}>
            {tripDays(trip.startDate, trip.endDate)}日間 / スポット{trip.spots.length}件 / やること
            {(trip.planItems || []).length}件
          </Text>
        </View>

        <View style={styles.actions}>
          <AppButton
            label="スポット追加"
            icon={<Plus size={18} color={colors.surface} />}
            onPress={() => navigation.navigate('SpotForm', { tripId: trip.id })}
          />
          <AppButton
            label="編集"
            variant="secondary"
            icon={<Pencil size={17} color={colors.text} />}
            onPress={() => navigation.navigate('TripForm', { tripId: trip.id })}
          />
          <AppButton
            label="予約を読み取る"
            variant="secondary"
            icon={<FileInput size={17} color={colors.text} />}
            onPress={() => navigation.navigate('BookingImport', { tripId: trip.id })}
          />
          <AppButton
            label={`やること${trip.planItems?.length ? ` ${trip.planItems.length}` : ''}`}
            variant="secondary"
            icon={<ListTodo size={17} color={colors.text} />}
            onPress={() => navigation.navigate('PlanList', { tripId: trip.id })}
          />
          <AppButton
            label={`自由ノート${trip.notebookPages?.length ? ` ${trip.notebookPages.length}` : ''}`}
            variant="secondary"
            icon={<NotebookPen size={17} color={colors.text} />}
            onPress={() => navigation.navigate('Notebook', { tripId: trip.id })}
          />
          <AppButton
            label="旅行内容を共有"
            variant="secondary"
            icon={<Share2 size={17} color={colors.text} />}
            onPress={share}
          />
        </View>

        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { value: 'map', label: '地図' },
            { value: 'itinerary', label: '日程' }
          ]}
        />

        {tab === 'map' ? (
          <MapScreen trip={trip} onSpotPress={(spot) => navigation.navigate('SpotDetail', { tripId: trip.id, spotId: spot.id })} />
        ) : (
          <ItineraryScreen
            trip={trip}
            onSpotPress={(spot) => navigation.navigate('SpotDetail', { tripId: trip.id, spotId: spot.id })}
            onAddSpot={() => navigation.navigate('SpotForm', { tripId: trip.id })}
          />
        )}

        <View style={styles.dangerZone}>
          <AppButton
            label={trip.isArchived ? 'アーカイブ解除' : 'アーカイブ'}
            variant="secondary"
            icon={<Archive size={17} color={colors.text} />}
            onPress={() => toggleArchive(trip.id)}
          />
          <AppButton label="削除" variant="danger" icon={<Trash2 size={17} color={colors.surface} />} onPress={confirmDelete} />
        </View>
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
  destination: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900'
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900'
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  meta: {
    color: colors.textMuted,
    fontSize: 14,
    flexShrink: 1
  },
  summary: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800'
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md
  },
  dangerZone: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
    gap: spacing.md
  }
});
