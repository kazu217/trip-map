import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../constants/theme';

type Option<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  wrap?: boolean;
};

export const SegmentedControl = <T extends string>({ value, options, onChange, wrap }: SegmentedControlProps<T>) => {
  return (
    <View style={[styles.container, wrap && styles.wrappedContainer]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.item,
              wrap && styles.wrappedItem,
              selected && styles.selected,
              pressed && styles.pressed
            ]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 3,
    gap: 3
  },
  wrappedContainer: {
    flexWrap: 'wrap'
  },
  item: {
    flex: 1,
    minHeight: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm
  },
  wrappedItem: {
    flexBasis: '30%',
    minWidth: 96
  },
  selected: {
    backgroundColor: colors.surface
  },
  pressed: {
    opacity: 0.75
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center'
  },
  selectedLabel: {
    color: colors.primary
  }
});
