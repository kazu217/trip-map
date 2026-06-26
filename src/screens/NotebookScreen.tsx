import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image as ImageIcon, Link2, NotebookPen, Plus } from 'lucide-react-native';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { EmptyState } from '../components/EmptyState';
import { colors, radius, spacing } from '../constants/theme';
import { TripsStackParamList } from '../navigation/types';
import { useTripStore } from '../store/tripStore';

type Props = NativeStackScreenProps<TripsStackParamList, 'Notebook'>;

export const NotebookScreen = ({ navigation, route }: Props) => {
  const trip = useTripStore((state) => state.trips.find((item) => item.id === route.params.tripId));
  const pages = (trip?.notebookPages || []).slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  if (!trip) {
    return (
      <SafeAreaView style={styles.safe}>
        <EmptyState title="旅行が見つかりません" message="旅行一覧から開き直してください。" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.heading}>
            <NotebookPen size={24} color={colors.primary} />
            <View style={styles.headingText}>
              <Text style={styles.title}>自由ノート</Text>
              <Text style={styles.subtitle}>リンク、画像、メモをページごとにまとめられます。</Text>
            </View>
          </View>
          <AppButton
            label="新しいページ"
            icon={<Plus size={18} color={colors.surface} />}
            onPress={() => navigation.navigate('NotebookPage', { tripId: trip.id })}
          />
        </View>

        {pages.length === 0 ? (
          <EmptyState title="ノートはまだありません" message="旅程案、持ち物、行きたい場所などを自由に残せます。" />
        ) : (
          <View style={styles.pages}>
            {pages.map((page) => (
              <Pressable
                key={page.id}
                onPress={() => navigation.navigate('NotebookPage', { tripId: trip.id, pageId: page.id })}
                style={({ pressed }) => [styles.page, pressed && styles.pressed]}
              >
                <Text style={styles.pageTitle}>{page.title || '無題のページ'}</Text>
                <Text numberOfLines={3} style={styles.pageBody}>
                  {page.body || '本文はありません'}
                </Text>
                <View style={styles.pageMeta}>
                  {page.links.length ? (
                    <View style={styles.metaItem}>
                      <Link2 size={14} color={colors.textMuted} />
                      <Text style={styles.metaText}>{page.links.length}件</Text>
                    </View>
                  ) : null}
                  {page.attachments.length ? (
                    <View style={styles.metaItem}>
                      <ImageIcon size={14} color={colors.textMuted} />
                      <Text style={styles.metaText}>{page.attachments.length}枚</Text>
                    </View>
                  ) : null}
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
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
    gap: spacing.xl
  },
  header: {
    gap: spacing.lg
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md
  },
  headingText: {
    flex: 1,
    gap: spacing.xs
  },
  title: {
    color: colors.text,
    fontSize: 27,
    fontWeight: '900'
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21
  },
  pages: {
    gap: spacing.md
  },
  page: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.sm
  },
  pageTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900'
  },
  pageBody: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21
  },
  pageMeta: {
    flexDirection: 'row',
    gap: spacing.lg,
    minHeight: 18
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  metaText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700'
  },
  pressed: {
    opacity: 0.72
  }
});
