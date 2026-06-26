import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarClock, Check, ListTodo, Pencil, Plus } from 'lucide-react-native';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { CategoryBadge } from '../components/CategoryBadge';
import { EmptyState } from '../components/EmptyState';
import { colors, radius, spacing } from '../constants/theme';
import { TripsStackParamList } from '../navigation/types';
import { useTripStore } from '../store/tripStore';
import { PlanItem, SpotDraft } from '../types/models';
import { displayTimeRange, formatDate } from '../utils/date';

type Props = NativeStackScreenProps<TripsStackParamList, 'PlanList'>;

export const PlanListScreen = ({ navigation, route }: Props) => {
  const trip = useTripStore((state) => state.trips.find((item) => item.id === route.params.tripId));
  const items = (trip?.planItems || []).slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  if (!trip) {
    return <SafeAreaView style={styles.safe}><EmptyState title="旅行が見つかりません" message="旅行一覧から開き直してください。" /></SafeAreaView>;
  }

  const hasCandidate = (item: PlanItem, candidate: 1 | 2 | 3) => {
    if (candidate === 1) {
      return Boolean(item.candidateDate1 || item.candidateStartTime1 || item.candidateEndTime1 || item.candidateNote1);
    }
    if (candidate === 2) {
      return Boolean(item.candidateDate2 || item.candidateStartTime2 || item.candidateEndTime2 || item.candidateNote2);
    }
    return Boolean(item.candidateDate3 || item.candidateStartTime3 || item.candidateEndTime3 || item.candidateNote3);
  };

  const confirmPlan = (item: PlanItem, candidate: 1 | 2 | 3) => {
    const candidateDate =
      candidate === 1 ? item.candidateDate1 : candidate === 2 ? item.candidateDate2 : item.candidateDate3;
    const startTime =
      candidate === 1
        ? item.candidateStartTime1
        : candidate === 2
          ? item.candidateStartTime2
          : item.candidateStartTime3;
    const endTime =
      candidate === 1
        ? item.candidateEndTime1
        : candidate === 2
          ? item.candidateEndTime2
          : item.candidateEndTime3;
    const candidateNote =
      candidate === 1 ? item.candidateNote1 : candidate === 2 ? item.candidateNote2 : item.candidateNote3;
    const notes = [item.notes, candidateNote ? `候補${candidate}メモ: ${candidateNote}` : ''].filter(Boolean).join('\n');
    const importDraft: Partial<SpotDraft> = {
      type: item.type,
      name: item.title,
      address: item.address || '',
      officialUrl: item.officialUrl || '',
      notes,
      date: candidateDate || trip.startDate,
      startTime: startTime || '',
      endTime: endTime || '',
      attachments: [],
      files: []
    };
    navigation.navigate('SpotForm', { tripId: trip.id, planItemId: item.id, importDraft });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.heading}>
            <ListTodo size={25} color={colors.primary} />
            <View style={styles.headingText}>
              <Text style={styles.title}>やること</Text>
              <Text style={styles.subtitle}>天気や空き時間を見てから決めたい予定を、候補のまま残せます。</Text>
            </View>
          </View>
          <AppButton
            label="やることを追加"
            icon={<Plus size={18} color={colors.surface} />}
            onPress={() => navigation.navigate('PlanForm', { tripId: trip.id })}
          />
        </View>

        {items.length === 0 ? (
          <EmptyState
            title="やることはまだありません"
            message="観光、ツアー、レストラン、交通など、日付をあとで決める予定を追加できます。"
          />
        ) : (
          <View style={styles.items}>
            {items.map((item) => (
              <View key={item.id} style={styles.item}>
                <CategoryBadge type={item.type} />
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.address ? <Text style={styles.itemText}>{item.address}</Text> : null}
                <CandidateLine
                  number={1}
                  date={item.candidateDate1}
                  startTime={item.candidateStartTime1}
                  endTime={item.candidateEndTime1}
                  note={item.candidateNote1}
                />
                {hasCandidate(item, 2) ? (
                  <CandidateLine
                    number={2}
                    date={item.candidateDate2}
                    startTime={item.candidateStartTime2}
                    endTime={item.candidateEndTime2}
                    note={item.candidateNote2}
                  />
                ) : null}
                {hasCandidate(item, 3) ? (
                  <CandidateLine
                    number={3}
                    date={item.candidateDate3}
                    startTime={item.candidateStartTime3}
                    endTime={item.candidateEndTime3}
                    note={item.candidateNote3}
                  />
                ) : null}
                {item.notes ? <Text numberOfLines={3} style={styles.notes}>{item.notes}</Text> : null}
                <View style={styles.actions}>
                  <AppButton
                    label={item.candidateDate1 ? '候補1で予定にする' : '予定にする'}
                    icon={<Check size={17} color={colors.surface} />}
                    onPress={() => confirmPlan(item, 1)}
                  />
                  {hasCandidate(item, 2) ? (
                    <AppButton
                      label="候補2で予定にする"
                      variant="secondary"
                      icon={<CalendarClock size={17} color={colors.text} />}
                      onPress={() => confirmPlan(item, 2)}
                    />
                  ) : null}
                  {hasCandidate(item, 3) ? (
                    <AppButton
                      label="候補3で予定にする"
                      variant="secondary"
                      icon={<CalendarClock size={17} color={colors.text} />}
                      onPress={() => confirmPlan(item, 3)}
                    />
                  ) : null}
                  <AppButton
                    label="編集"
                    variant="ghost"
                    icon={<Pencil size={17} color={colors.text} />}
                    onPress={() => navigation.navigate('PlanForm', { tripId: trip.id, planItemId: item.id })}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const CandidateLine = ({
  number,
  date,
  startTime,
  endTime,
  note
}: {
  number: number;
  date?: string;
  startTime?: string;
  endTime?: string;
  note?: string;
}) => (
  <View style={styles.candidate}>
    <CalendarClock size={16} color={colors.primary} />
    <View style={styles.candidateContent}>
      <Text style={styles.candidateText}>
        候補{number}: {date ? formatDate(date, true) : '日付未定'} / {displayTimeRange(startTime, endTime)}
      </Text>
      {note ? <Text style={styles.candidateNote}>{note}</Text> : null}
    </View>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.xl },
  header: { gap: spacing.lg },
  heading: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  headingText: { flex: 1, gap: spacing.xs },
  title: { color: colors.text, fontSize: 27, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: 14, lineHeight: 21 },
  items: { gap: spacing.md },
  item: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.sm
  },
  itemTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },
  itemText: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  candidate: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  candidateContent: { flex: 1, gap: 2 },
  candidateText: { color: colors.text, fontSize: 13, lineHeight: 19, fontWeight: '700' },
  candidateNote: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  notes: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  actions: { gap: spacing.sm, marginTop: spacing.sm }
});
