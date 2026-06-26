import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { AppErrorBoundary } from './src/components/AppErrorBoundary';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors, spacing } from './src/constants/theme';
import { useTripStore } from './src/store/tripStore';
import { configureNotifications } from './src/services/notifications';

export default function App() {
  const hasHydrated = useTripStore((state) => state.hasHydrated);
  const setHydrated = useTripStore((state) => state.setHydrated);
  const seedIfEmpty = useTripStore((state) => state.seedIfEmpty);

  useEffect(() => {
    if (hasHydrated) seedIfEmpty();
  }, [hasHydrated, seedIfEmpty]);

  useEffect(() => {
    if (hasHydrated) return undefined;

    const timeout = setTimeout(() => {
      setHydrated(true);
    }, 4000);

    return () => clearTimeout(timeout);
  }, [hasHydrated, setHydrated]);

  useEffect(() => {
    configureNotifications().catch(() => undefined);
  }, []);

  if (!hasHydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>TripMapを準備中...</Text>
      </View>
    );
  }

  return (
    <AppErrorBoundary>
      <StatusBar style="dark" />
      <AppNavigator />
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.background
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700'
  }
});
