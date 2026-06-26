import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { Navigation, Plus } from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { EmptyState } from '../components/EmptyState';
import { SpotCard } from '../components/SpotCard';
import { colors, spacing } from '../constants/theme';
import { Spot, Trip } from '../types/models';
import { compareSpotsByTime, dateKey, groupSpotsByDate } from '../utils/date';
import { createGoogleMapsNavigationUrl, spotLocationText } from '../utils/transport';

type ItineraryScreenProps = {
  trip: Trip;
  onSpotPress: (spot: Spot) => void;
  onAddSpot: () => void;
};

export const ItineraryScreen = ({ trip, onSpotPress, onAddSpot }: ItineraryScreenProps) => {
  const groups = groupSpotsByDate(trip.spots);
  const orderedSpots = trip.spots.slice().sort(compareSpotsByTime);
  const nextSpotById = new Map<string, Spot>();

  orderedSpots.forEach((spot, index) => {
    const nextSpot = orderedSpots[index + 1];
    if (nextSpot && dateKey(nextSpot.date) === dateKey(spot.date)) {
      nextSpotById.set(spot.id, nextSpot);
    }
  });

  const startNavigation = async (nextSpot: Spot) => {
    const destination = spotLocationText(nextSpot);
    const navigationUrl = createGoogleMapsNavigationUrl(destination, nextSpot.transportMode);
    if (!navigationUrl) {
      Alert.alert('ナビを開始できません', '次の予定に住所を登録してください。');
      return;
    }
    await Linking.openURL(navigationUrl);
  };

  if (!groups.length) {
    return (
      <EmptyState
        title="日程がまだありません"
        message="ホテル、観光、ツアー、交通を追加すると日付別に並びます。"
        action={<AppButton label="スポット追加" icon={<Plus size={18} color={colors.surface} />} onPress={onAddSpot} />}
      />
    );
  }

  return (
    <View style={styles.container}>
      {groups.map((group) => (
        <View key={group.key} style={styles.group}>
          <Text style={styles.date}>{group.label}</Text>
          <View style={styles.spots}>
            {group.items.map((spot) => {
              const nextSpot = nextSpotById.get(spot.id);
              return (
                <View key={spot.id} style={styles.spotBlock}>
                  <SpotCard spot={spot} onPress={() => onSpotPress(spot)} />
                  {nextSpot ? (
                    <AppButton
                      label={`次の場所へナビ: ${nextSpot.name}`}
                      variant="secondary"
                      icon={<Navigation size={17} color={colors.text} />}
                      onPress={() => startNavigation(nextSpot)}
                    />
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl
  },
  group: {
    gap: spacing.md
  },
  date: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '900'
  },
  spots: {
    gap: spacing.md
  },
  spotBlock: {
    gap: spacing.sm
  }
});
