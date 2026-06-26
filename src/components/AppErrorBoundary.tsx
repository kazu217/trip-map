import AsyncStorage from '@react-native-async-storage/async-storage';
import { Component, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../constants/theme';
import { useTripStore } from '../store/tripStore';

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  private resetLocalData = async () => {
    await AsyncStorage.removeItem('trip-map-store');
    useTripStore.setState({ trips: [], hasHydrated: true });
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>TripMapを開けませんでした</Text>
        <Text style={styles.message}>
          端末内の保存データを読み込む途中で問題が起きました。ネット保存を使っている場合は、開き直したあと設定から復元できます。
        </Text>
        <Pressable style={styles.button} onPress={this.resetLocalData}>
          <Text style={styles.buttonText}>端末内データを初期化して開く</Text>
        </Pressable>
        <Text style={styles.detail}>{this.state.error.message}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.background
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900'
  },
  message: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22
  },
  button: {
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg
  },
  buttonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '900'
  },
  detail: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18
  }
});
