import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Archive, Plus } from 'lucide-react-native';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';

import { AppButton } from '../components/AppButton';
import { EmptyState } from '../components/EmptyState';
import { SegmentedControl } from '../components/SegmentedControl';
import { TripCard } from '../components/TripCard';
import { colors, spacing } from '../constants/theme';
import { useTripStore } from '../store/tripStore';
import { TripsStackParamList } from '../navigation/types';

type Navigation = NativeStackNavigationProp<TripsStackParamList, 'Home'>;

export const HomeScreen = () => {
  const navigation = useNavigation<Navigation>();
  const trips = useTripStore((state) => state.trips);
  const [mode, setMode] = useState<'active' | 'archived'>('active');

  const visibleTrips = useMemo(() => {
    return trips
      .filter((trip) => (mode === 'archived' ? trip.isArchived : !trip.isArchived))
      .sort((a, b) => b.startDate.localeCompare(a.startDate));
  }, [mode, trips]);

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={visibleTrips}
        keyExtractor={(trip) => trip.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <Text style={styles.eyebrow}>旅程を一箇所に</Text>
              <Text style={styles.title}>次の旅行</Text>
            </View>
            <AppButton
              label="作成"
              icon={<Plus size={18} color={colors.surface} />}
              onPress={() => navigation.navigate('TripForm')}
            />
            <SegmentedControl
              value={mode}
              onChange={setMode}
              options={[
                { value: 'active', label: '進行中' },
                { value: 'archived', label: 'アーカイブ' }
              ]}
            />
          </View>
        }
        renderItem={({ item }) => (
          <TripCard trip={item} onPress={() => navigation.navigate('TripDetail', { tripId: item.id })} />
        )}
        ListEmptyComponent={
          <EmptyState
            title={mode === 'active' ? '旅行がまだありません' : 'アーカイブは空です'}
            message={
              mode === 'active'
                ? '旅行を作ると、ホテル、観光地、ツアー、交通をまとめて管理できます。'
                : '過去の旅行は詳細画面からアーカイブできます。'
            }
            action={
              mode === 'active' ? (
                <AppButton
                  label="旅行を作成"
                  icon={<Plus size={18} color={colors.surface} />}
                  onPress={() => navigation.navigate('TripForm')}
                />
              ) : (
                <AppButton
                  label="進行中を見る"
                  variant="secondary"
                  icon={<Archive size={18} color={colors.text} />}
                  onPress={() => setMode('active')}
                />
              )
            }
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md
  },
  header: {
    gap: spacing.lg,
    marginBottom: spacing.sm
  },
  titleBlock: {
    gap: spacing.xs
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900'
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900'
  }
});
