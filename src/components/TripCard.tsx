import { CalendarDays, MapPinned } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow, spacing } from '../constants/theme';
import { Trip } from '../types/models';
import { formatDateRange, tripDays } from '../utils/date';

type TripCardProps = {
  trip: Trip;
  onPress: () => void;
};

export const TripCard = ({ trip, onPress }: TripCardProps) => {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{trip.title}</Text>
          <View style={styles.metaRow}>
            <MapPinned size={15} color={colors.textMuted} />
            <Text style={styles.meta}>{trip.destination}</Text>
          </View>
        </View>
        {trip.isArchived ? <Text style={styles.archive}>保存済み</Text> : null}
      </View>

      <View style={styles.footer}>
        <View style={styles.metaRow}>
          <CalendarDays size={15} color={colors.textMuted} />
          <Text style={styles.meta}>{formatDateRange(trip.startDate, trip.endDate)}</Text>
        </View>
        <Text style={styles.count}>{tripDays(trip.startDate, trip.endDate)}日 / {trip.spots.length}件</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.lg,
    ...shadow
  },
  pressed: {
    opacity: 0.82
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  titleBlock: {
    flex: 1,
    gap: spacing.sm
  },
  title: {
    color: colors.text,
    fontSize: 20,
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  count: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800'
  },
  archive: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800'
  }
});
