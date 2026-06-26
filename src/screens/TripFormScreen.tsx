import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { Field } from '../components/Field';
import { colors, spacing } from '../constants/theme';
import { TripsStackParamList } from '../navigation/types';
import { useTripStore } from '../store/tripStore';
import { toDateInput, todayInput } from '../utils/date';
import { useMemo, useState } from 'react';

type Props = NativeStackScreenProps<TripsStackParamList, 'TripForm'>;

export const TripFormScreen = ({ navigation, route }: Props) => {
  const tripId = route.params?.tripId;
  const trip = useTripStore((state) => state.trips.find((item) => item.id === tripId));
  const createTrip = useTripStore((state) => state.createTrip);
  const updateTrip = useTripStore((state) => state.updateTrip);

  const defaultEndDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toISOString().slice(0, 10);
  }, []);

  const [title, setTitle] = useState(trip?.title || '');
  const [destination, setDestination] = useState(trip?.destination || '');
  const [startDate, setStartDate] = useState(trip ? toDateInput(trip.startDate) : todayInput());
  const [endDate, setEndDate] = useState(trip ? toDateInput(trip.endDate) : defaultEndDate);
  const [coverImageUrl, setCoverImageUrl] = useState(trip?.coverImageUrl || '');

  const save = () => {
    if (!title.trim() || !destination.trim()) {
      Alert.alert('入力が足りません', '旅行タイトルと目的地を入力してください。');
      return;
    }

    const draft = { title, destination, startDate, endDate, coverImageUrl };
    if (tripId) {
      updateTrip(tripId, draft);
      navigation.goBack();
      return;
    }

    const newTripId = createTrip(draft);
    navigation.replace('TripDetail', { tripId: newTripId });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Field label="旅行タイトル" value={title} onChangeText={setTitle} placeholder="例: ニュージーランド南島 6日間" />
          <Field label="目的地" value={destination} onChangeText={setDestination} placeholder="例: Queenstown" />
          <Field
            label="出発日"
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
            helper="例: 2026-08-12"
          />
          <Field
            label="帰国日"
            value={endDate}
            onChangeText={setEndDate}
            placeholder="YYYY-MM-DD"
            helper="例: 2026-08-17"
          />
          <Field
            label="カバー画像URL"
            value={coverImageUrl}
            onChangeText={setCoverImageUrl}
            placeholder="https://..."
            helper="任意。旅行カードの画像表示拡張用に保存します。"
          />
        </View>
        <AppButton label={tripId ? '旅行を保存' : '旅行を作成'} onPress={save} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl
  },
  form: {
    gap: spacing.lg
  }
});
