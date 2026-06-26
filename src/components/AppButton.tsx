import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../constants/theme';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: ReactNode;
  disabled?: boolean;
};

export const AppButton = ({ label, onPress, variant = 'primary', icon, disabled }: AppButtonProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed
      ]}
    >
      <View style={styles.content}>
        {icon}
        <Text style={[styles.label, variant === 'secondary' || variant === 'ghost' ? styles.darkLabel : styles.lightLabel]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm
  },
  primary: {
    backgroundColor: colors.primary
  },
  secondary: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border
  },
  danger: {
    backgroundColor: colors.danger
  },
  ghost: {
    backgroundColor: 'transparent'
  },
  label: {
    fontSize: 15,
    fontWeight: '700'
  },
  lightLabel: {
    color: colors.surface
  },
  darkLabel: {
    color: colors.text
  },
  pressed: {
    opacity: 0.78
  },
  disabled: {
    opacity: 0.45
  }
});
