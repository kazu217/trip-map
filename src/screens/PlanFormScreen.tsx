import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Save, Trash2 } from 'lucide-react-native';
import { useState } from 'react';

import { AppButton } from '../components/AppButton';
import { DatePickerField } from '../components/DatePickerField';
import { Field } from '../components/Field';
import { SegmentedControl } from '../components/SegmentedControl';
import { TimePickerField } from '../components/TimePickerField';
import { colors, spacing } from '../constants/theme';
import { TripsStackParamList } from '../navigation/types';
import { useTripStore } from '../store/tripStore';
import { PlanItemDraft, PlanItemType } from '../types/models';
import { toDateInput } from '../utils/date';

type Props = NativeStackScreenProps<TripsStackParamList, 'PlanForm'>;

const typeOptions: Array<{ value: PlanItemType; label: string }> = [
  { value: 'attraction', label: '観光・遊び' },
  { value: 'tour', label: 'ツアー' },
  { value: 'restaurant', label: 'レストラン' },
  { value: 'transport', label: '交通・チケット' }
];

export const PlanFormScreen = ({ navigation, route }: Props) => {
  const { tripId, planItemId } = route.params;
  const trip = useTripStore((state) => state.trips.find((item) => item.id === tripId));
  const item = trip?.planItems?.find((planItem) => planItem.id === planItemId);
  const addPlanItem = useTripStore((state) => state.addPlanItem);
  const updatePlanItem = useTripStore((state) => state.updatePlanItem);
  const deletePlanItem = useTripStore((state) => state.deletePlanItem);

  const [type, setType] = useState<PlanItemType>(item?.type || 'attraction');
  const [title, setTitle] = useState(item?.title || '');
  const [address, setAddress] = useState(item?.address || '');
  const [officialUrl, setOfficialUrl] = useState(item?.officialUrl || '');
  const [notes, setNotes] = useState(item?.notes || '');
  const [candidateDate1, setCandidateDate1] = useState(item?.candidateDate1 ? toDateInput(item.candidateDate1) : '');
  const [candidateStartTime1, setCandidateStartTime1] = useState(item?.candidateStartTime1 || '');
  const [candidateEndTime1, setCandidateEndTime1] = useState(item?.candidateEndTime1 || '');
  const [candidateNote1, setCandidateNote1] = useState(item?.candidateNote1 || '');
  const [candidateDate2, setCandidateDate2] = useState(item?.candidateDate2 ? toDateInput(item.candidateDate2) : '');
  const [candidateStartTime2, setCandidateStartTime2] = useState(item?.candidateStartTime2 || '');
  const [candidateEndTime2, setCandidateEndTime2] = useState(item?.candidateEndTime2 || '');
  const [candidateNote2, setCandidateNote2] = useState(item?.candidateNote2 || '');
  const [candidateDate3, setCandidateDate3] = useState(item?.candidateDate3 ? toDateInput(item.candidateDate3) : '');
  const [candidateStartTime3, setCandidateStartTime3] = useState(item?.candidateStartTime3 || '');
  const [candidateEndTime3, setCandidateEndTime3] = useState(item?.candidateEndTime3 || '');
  const [candidateNote3, setCandidateNote3] = useState(item?.candidateNote3 || '');

  if (!trip) {
    return <View style={styles.content}><Text style={styles.title}>旅行が見つかりません</Text></View>;
  }

  const save = () => {
    if (!title.trim()) {
      Alert.alert('入力が足りません', 'やることの名前を入力してください。');
      return;
    }

    const draft: PlanItemDraft = {
      type,
      title,
      address,
      officialUrl,
      notes,
      candidateDate1: candidateDate1 || undefined,
      candidateStartTime1,
      candidateEndTime1,
      candidateNote1,
      candidateDate2: candidateDate2 || undefined,
      candidateStartTime2,
      candidateEndTime2,
      candidateNote2,
      candidateDate3: candidateDate3 || undefined,
      candidateStartTime3,
      candidateEndTime3,
      candidateNote3
    };

    if (planItemId) updatePlanItem(trip.id, planItemId, draft);
    else addPlanItem(trip.id, draft);
    navigation.goBack();
  };

  const confirmDelete = () => {
    if (!planItemId) return;
    Alert.alert('このやることを削除しますか？', title || '未確定の予定', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () => {
          deletePlanItem(trip.id, planItemId);
          navigation.goBack();
        }
      }
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>種類</Text>
          <SegmentedControl value={type} options={typeOptions} onChange={setType} wrap />
        </View>

        <View style={styles.section}>
          <Field label="やること" value={title} onChangeText={setTitle} placeholder="例: 雨でなければミルフォードサウンドへ行く" />
          <Field label="場所 / 集合場所" value={address} onChangeText={setAddress} placeholder="未定なら空欄でOK" />
          <Field label="参考URL" value={officialUrl} onChangeText={setOfficialUrl} placeholder="https://..." />
          <Field
            label="メモ"
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="例: 曇りでも欠航。前日に催行状況を確認する"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>候補1</Text>
          <DatePickerField label="候補日" value={candidateDate1} onChange={setCandidateDate1} optional />
          <View style={styles.twoColumns}>
            <TimePickerField label="開始候補" value={candidateStartTime1} onChange={setCandidateStartTime1} />
            <TimePickerField label="終了候補" value={candidateEndTime1} onChange={setCandidateEndTime1} />
          </View>
          <Field
            label="候補1のメモ"
            value={candidateNote1}
            onChangeText={setCandidateNote1}
            multiline
            placeholder="例: 集合場所、天気条件、代替案など"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>候補2</Text>
          <DatePickerField label="候補日" value={candidateDate2} onChange={setCandidateDate2} optional />
          <View style={styles.twoColumns}>
            <TimePickerField label="開始候補" value={candidateStartTime2} onChange={setCandidateStartTime2} />
            <TimePickerField label="終了候補" value={candidateEndTime2} onChange={setCandidateEndTime2} />
          </View>
          <Field
            label="候補2のメモ"
            value={candidateNote2}
            onChangeText={setCandidateNote2}
            multiline
            placeholder="例: ホテル移動後なら集合場所が違う"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>候補3</Text>
          <DatePickerField label="候補日" value={candidateDate3} onChange={setCandidateDate3} optional />
          <View style={styles.twoColumns}>
            <TimePickerField label="開始候補" value={candidateStartTime3} onChange={setCandidateStartTime3} />
            <TimePickerField label="終了候補" value={candidateEndTime3} onChange={setCandidateEndTime3} />
          </View>
          <Field
            label="候補3のメモ"
            value={candidateNote3}
            onChangeText={setCandidateNote3}
            multiline
            placeholder="例: 曇りでも欠航。催行会社へ前日確認"
          />
        </View>

        <AppButton label="やることを保存" icon={<Save size={18} color={colors.surface} />} onPress={save} />
        {planItemId ? (
          <AppButton
            label="削除"
            variant="danger"
            icon={<Trash2 size={18} color={colors.surface} />}
            onPress={confirmDelete}
          />
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.xl },
  title: { color: colors.text, fontSize: 22, fontWeight: '900' },
  section: { gap: spacing.md },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  twoColumns: { flexDirection: 'row', gap: spacing.md }
});
