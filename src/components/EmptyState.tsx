import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../constants/theme';

type EmptyStateProps = {
  title: string;
  message: string;
  action?: ReactNode;
};

export const EmptyState = ({ title, message, action }: EmptyStateProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.xl,
    backgroundColor: colors.surface,
    alignItems: 'center',
    gap: spacing.sm
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center'
  },
  message: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center'
  },
  action: {
    marginTop: spacing.md,
    alignSelf: 'stretch'
  }
});
