import { StyleSheet, Text, View } from 'react-native';

import { spotTypeColors, spotTypeLabels } from '../constants/categories';
import { colors, radius, spacing } from '../constants/theme';
import { SpotType } from '../types/models';

type CategoryBadgeProps = {
  type: SpotType;
};

export const CategoryBadge = ({ type }: CategoryBadgeProps) => {
  return (
    <View style={[styles.badge, { borderColor: spotTypeColors[type] }]}>
      <View style={[styles.dot, { backgroundColor: spotTypeColors[type] }]} />
      <Text style={styles.label}>{spotTypeLabels[type]}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  label: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700'
  }
});
