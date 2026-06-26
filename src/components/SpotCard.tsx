import { Clock, MapPin } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CategoryBadge } from './CategoryBadge';
import { colors, radius, spacing } from '../constants/theme';
import { Spot } from '../types/models';
import { displayTimeRange, formatDate } from '../utils/date';
import { compactText, formatPrice } from '../utils/format';
import { calculateDurationFromTimes } from '../utils/transport';

type SpotCardProps = {
  spot: Spot;
  onPress?: () => void;
};

export const SpotCard = ({ spot, onPress }: SpotCardProps) => {
  const price = formatPrice(spot.price, spot.currency);
  const travelDuration = spot.travelDuration || calculateDurationFromTimes(spot.startTime, spot.endTime);
  const secondary = compactText(
    spot.type === 'transport' ? travelDuration : undefined,
    spot.bookingSite,
    spot.confirmationNumber,
    price
  );

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && onPress && styles.pressed]}
    >
      <View style={styles.top}>
        <CategoryBadge type={spot.type} />
        <Text style={styles.date}>{formatDate(spot.date)}</Text>
      </View>
      <Text style={styles.title}>{spot.name}</Text>
      <View style={styles.row}>
        <Clock size={14} color={colors.textMuted} />
        <Text style={styles.meta}>{displayTimeRange(spot.startTime, spot.endTime)}</Text>
      </View>
      {spot.address ? (
        <View style={styles.row}>
          <MapPin size={14} color={colors.textMuted} />
          <Text style={styles.meta}>{spot.address}</Text>
        </View>
      ) : null}
      {secondary ? <Text style={styles.secondary}>{secondary}</Text> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm
  },
  pressed: {
    opacity: 0.8
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm
  },
  date: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700'
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
    flexShrink: 1
  },
  secondary: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700'
  }
});
