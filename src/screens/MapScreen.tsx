import { StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../components/EmptyState';
import { MapPreview } from '../components/MapPreview';
import { SpotCard } from '../components/SpotCard';
import { spotTypeColors, spotTypeLabels } from '../constants/categories';
import { colors, spacing } from '../constants/theme';
import { Spot, Trip } from '../types/models';

type MapScreenProps = {
  trip: Trip;
  onSpotPress: (spot: Spot) => void;
};

export const MapScreen = ({ trip, onSpotPress }: MapScreenProps) => {
  if (!trip.spots.length) {
    return <EmptyState title="地図に表示するスポットがありません" message="スポットを追加するとカテゴリ別ピンが表示されます。" />;
  }

  return (
    <View style={styles.container}>
      <MapPreview spots={trip.spots} onSpotPress={onSpotPress} />
      <View style={styles.legend}>
        {Object.entries(spotTypeLabels).map(([type, label]) => (
          <View key={type} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: spotTypeColors[type as keyof typeof spotTypeColors] }]} />
            <Text style={styles.legendText}>{label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.list}>
        <Text style={styles.sectionTitle}>スポット</Text>
        {trip.spots.map((spot) => (
          <SpotCard key={spot.id} spot={spot} onPress={() => onSpotPress(spot)} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  legendText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800'
  },
  list: {
    gap: spacing.md
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900'
  }
});
