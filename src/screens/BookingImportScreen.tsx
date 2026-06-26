import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Check, ClipboardPaste, FileInput, ScanText } from 'lucide-react-native';
import { useState } from 'react';

import { AppButton } from '../components/AppButton';
import { Field } from '../components/Field';
import { colors, radius, spacing } from '../constants/theme';
import { TripsStackParamList } from '../navigation/types';
import { BookingImportResult, parseBookingText } from '../services/bookingImport';
import { formatDate } from '../utils/date';

type Props = NativeStackScreenProps<TripsStackParamList, 'BookingImport'>;

export const BookingImportScreen = ({ navigation, route }: Props) => {
  const [source, setSource] = useState('');
  const [result, setResult] = useState<BookingImportResult | null>(null);

  const pasteBooking = async () => {
    const value = await Clipboard.getStringAsync();
    if (!value.trim()) {
      Alert.alert('コピーした文章がありません', '予約サイトやメールへ戻り、予約内容を選んで「コピー」してください。');
      return;
    }
    setSource(value);
    setResult(null);
  };

  const readBooking = () => {
    if (!source.trim()) {
      Alert.alert('予約情報を貼り付けてください', '予約確認メールや予約詳細画面の文章をコピーして貼り付けます。');
      return;
    }

    const parsed = parseBookingText(source);
    if (!parsed.draft.name && !parsed.draft.date && !parsed.draft.confirmationNumber) {
      Alert.alert(
        '読み取れる項目がありませんでした',
        '施設名、宿泊日、予約番号などが含まれる部分をコピーして、もう一度お試しください。'
      );
      return;
    }

    setResult(parsed);
  };

  const continueToForm = () => {
    if (!result) return;
    navigation.navigate('SpotForm', {
      tripId: route.params.tripId,
      importDraft: result.draft
    });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <FileInput size={28} color={colors.primary} />
          <Text style={styles.title}>予約情報をかんたん入力</Text>
          <Text style={styles.description}>
            Trip.com、Booking.com、Yahoo!トラベル、楽天トラベルの予約内容をコピーして取り込みます。
          </Text>
        </View>

        <View style={styles.steps}>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>予約サイトやメールで予約内容をコピー</Text>
              <Text style={styles.tipText}>施設名、住所、日付、料金、予約番号が見える部分をまとめて選びます。</Text>
            </View>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>下のボタンで貼り付け</Text>
              <Text style={styles.tipText}>貼り付けた文章は、この画面で確認してから読み取れます。</Text>
            </View>
          </View>
        </View>

        <AppButton
          label="コピーした予約情報を貼り付け"
          icon={<ClipboardPaste size={18} color={colors.surface} />}
          onPress={pasteBooking}
        />

        <Field
          label="貼り付けた予約情報"
          value={source}
          onChangeText={(value) => {
            setSource(value);
            setResult(null);
          }}
          multiline
          placeholder="ここへ予約内容が入ります。直接入力もできます。"
          inputProps={{ autoCapitalize: 'none', autoCorrect: false }}
        />

        <AppButton
          label="内容を読み取る"
          variant="secondary"
          icon={<ScanText size={18} color={colors.text} />}
          onPress={readBooking}
        />

        {result ? (
          <View style={styles.resultCard}>
            <View style={styles.resultHeading}>
              <Check size={20} color={colors.primary} />
              <Text style={styles.resultTitle}>読み取り結果</Text>
            </View>
            <Text style={styles.resultSummary}>
              {result.site || '予約情報'}から{result.foundFields.length}項目を見つけました。
            </Text>
            <ResultRow label="名前" value={result.draft.name} />
            <ResultRow label="住所" value={result.draft.address} />
            <ResultRow label="日付" value={result.draft.date ? formatDate(result.draft.date, true) : ''} />
            <ResultRow label="料金" value={result.draft.price ? `${result.draft.price.toLocaleString()} ${result.draft.currency}` : ''} />
            <ResultRow label="予約番号" value={result.draft.confirmationNumber} />
            <Text style={styles.resultNote}>次の画面ですべての項目を確認・修正してから保存します。</Text>
            <AppButton label="この内容を確認・修正する" onPress={continueToForm} />
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const ResultRow = ({ label, value }: { label: string; value?: string }) => (
  <View style={styles.resultRow}>
    <Text style={styles.resultLabel}>{label}</Text>
    <Text style={[styles.resultValue, !value && styles.emptyValue]}>{value || '見つかりませんでした'}</Text>
  </View>
);

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl
  },
  intro: {
    gap: spacing.sm
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900'
  },
  description: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 23
  },
  steps: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.lg
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    color: colors.surface,
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 14,
    fontWeight: '900'
  },
  stepText: {
    flex: 1,
    gap: spacing.xs
  },
  stepTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900'
  },
  tipText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20
  },
  resultCard: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.md
  },
  resultHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  resultTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900'
  },
  resultSummary: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800'
  },
  resultRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    gap: spacing.xs
  },
  resultLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800'
  },
  resultValue: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20
  },
  emptyValue: {
    color: colors.textMuted
  },
  resultNote: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18
  }
});
