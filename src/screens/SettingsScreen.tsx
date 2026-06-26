import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { CloudDownload, CloudUpload, Database, Info, MapPinned, RotateCcw } from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { colors, radius, spacing } from '../constants/theme';
import { isGoogleMapsConfigured } from '../services/appConfig';
import { isFirebaseConfigured, isFirebaseStorageConfigured } from '../services/firebase';
import { useTripStore } from '../store/tripStore';

const StatusRow = ({ label, value, ready }: { label: string; value: string; ready: boolean }) => {
  return (
    <View style={styles.statusRow}>
      <View style={[styles.statusDot, { backgroundColor: ready ? colors.primary : colors.warning }]} />
      <View style={styles.statusTextBlock}>
        <Text style={styles.statusLabel}>{label}</Text>
        <Text style={styles.statusValue}>{value}</Text>
      </View>
    </View>
  );
};

export const SettingsScreen = () => {
  const trips = useTripStore((state) => state.trips);
  const resetToSample = useTripStore((state) => state.resetToSample);
  const backupToCloud = useTripStore((state) => state.backupToCloud);
  const restoreFromCloud = useTripStore((state) => state.restoreFromCloud);
  const syncStatus = useTripStore((state) => state.syncStatus);
  const syncMessage = useTripStore((state) => state.syncMessage);
  const spotCount = trips.reduce((sum, trip) => sum + trip.spots.length, 0);
  const firebaseReady = isFirebaseConfigured();
  const firebaseStorageReady = isFirebaseStorageConfigured();
  const mapsReady = isGoogleMapsConfigured();
  const appVersion = Constants.expoConfig?.version || '1.2.3';
  const buildNumber = Constants.expoConfig?.android?.versionCode;

  const confirmReset = () => {
    Alert.alert('初期データに戻しますか？', 'この端末に保存している旅行データが、見本のデータに置き換わります。', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '初期データに戻す', onPress: resetToSample }
    ]);
  };

  const confirmBackup = () => {
    Alert.alert(
      '旅行データをバックアップしますか？',
      'ネット上にある前回のバックアップを、現在の旅行データで更新します。端末保存の写真・ファイルはバックアップされません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: 'バックアップする', onPress: backupToCloud }
      ]
    );
  };

  const confirmRestore = () => {
    Alert.alert(
      'バックアップを読み込みますか？',
      'この端末の旅行データが、ネット上のバックアップに置き換わります。',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '読み込む', onPress: restoreFromCloud }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>TripMap</Text>
          <Text style={styles.title}>設定</Text>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelTitleRow}>
            <Database size={20} color={colors.primary} />
            <Text style={styles.panelTitle}>この端末のデータ</Text>
          </View>
          <Text style={styles.metric}>旅行 {trips.length}件 / 登録場所 {spotCount}件</Text>
          <AppButton
            label="初期データに戻す"
            variant="secondary"
            icon={<RotateCcw size={17} color={colors.text} />}
            onPress={confirmReset}
          />
        </View>

        <View style={styles.panel}>
          <View style={styles.panelTitleRow}>
            <CloudUpload size={20} color={colors.primary} />
            <Text style={styles.panelTitle}>旅行データのバックアップ</Text>
          </View>
          <StatusRow
            label="ネット保存"
            value={firebaseReady ? '利用できます' : '現在は利用できません'}
            ready={firebaseReady}
          />
          <StatusRow
            label="写真・ファイル"
            value={firebaseStorageReady ? '旅行データと一緒に保存されます' : 'この端末だけに保存されます'}
            ready={firebaseStorageReady}
          />
          <Text style={styles.note}>
            旅行名、日付、住所、予約番号、メモなどをネット上に保存できます。現在はこの端末専用の利用者番号で保存するため、別のスマホやアプリを削除した後は読み込めません。
          </Text>
          <AppButton
            label={syncStatus === 'syncing' ? '処理中...' : 'ネット上にバックアップ'}
            icon={<CloudUpload size={17} color={colors.surface} />}
            onPress={confirmBackup}
            disabled={syncStatus === 'syncing'}
          />
          <AppButton
            label="バックアップを読み込む"
            variant="secondary"
            icon={<CloudDownload size={17} color={colors.text} />}
            onPress={confirmRestore}
            disabled={syncStatus === 'syncing'}
          />
          {syncMessage ? (
            <Text style={[styles.message, syncStatus === 'error' && styles.errorMessage]}>{syncMessage}</Text>
          ) : null}
        </View>

        <View style={styles.panel}>
          <View style={styles.panelTitleRow}>
            <MapPinned size={20} color={colors.primary} />
            <Text style={styles.panelTitle}>地図</Text>
          </View>
          <StatusRow
            label="地図機能"
            value={mapsReady ? '利用できます' : '簡易地図で表示します'}
            ready={mapsReady}
          />
          <Text style={styles.note}>登録した場所を地図上で確認できます。</Text>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelTitleRow}>
            <Info size={20} color={colors.primary} />
            <Text style={styles.panelTitle}>アプリ情報</Text>
          </View>
          <Text style={styles.note}>
            バージョン {appVersion}{buildNumber ? `（${buildNumber}）` : ''}
          </Text>
        </View>
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
    gap: spacing.lg
  },
  header: {
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
  },
  panel: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.md
  },
  panelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  panelTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900'
  },
  metric: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900'
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5
  },
  statusTextBlock: {
    flex: 1,
    gap: 2
  },
  statusLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800'
  },
  statusValue: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19
  },
  message: {
    color: colors.primary,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700'
  },
  errorMessage: {
    color: colors.danger
  },
  note: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19
  }
});
