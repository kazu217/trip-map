import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { BellRing, CalendarClock, FilePlus2, ImagePlus, MapPin, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';

import { AppButton } from '../components/AppButton';
import { AttachmentViewer } from '../components/AttachmentViewer';
import { DatePickerField } from '../components/DatePickerField';
import { Field } from '../components/Field';
import { FileAttachmentList } from '../components/FileAttachmentList';
import { SegmentedControl } from '../components/SegmentedControl';
import { TimePickerField } from '../components/TimePickerField';
import { spotTypeHints, spotTypeLabels, spotTypes, transportModeLabels, transportModes } from '../constants/categories';
import { colors, radius, spacing } from '../constants/theme';
import { TripsStackParamList } from '../navigation/types';
import { ensureAnonymousUser, isFirebaseConfigured, isFirebaseStorageConfigured } from '../services/firebase';
import { pickFileAttachment, uploadFileAttachmentToStorage } from '../services/fileService';
import { geocodeAddress } from '../services/geocoding';
import { pickAttachment, uploadAttachmentToStorage } from '../services/imageService';
import { cancelReminder, scheduleCancellationReminder, scheduleEventReminder } from '../services/notifications';
import { useTripStore } from '../store/tripStore';
import { FileAttachment, SpotDraft, SpotType, TransportMode } from '../types/models';
import { toDateInput } from '../utils/date';
import { calculateDurationFromTimes, createGoogleMapsRouteUrl } from '../utils/transport';

type Props = NativeStackScreenProps<TripsStackParamList, 'SpotForm'>;

const parseOptionalNumber = (value: string, label: string) => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) {
    throw new Error(`${label}は数字で入力してください。`);
  }
  return parsed;
};

export const SpotFormScreen = ({ navigation, route }: Props) => {
  const { tripId, spotId, planItemId } = route.params;
  const importDraft = route.params.importDraft;
  const trip = useTripStore((state) => state.trips.find((item) => item.id === tripId));
  const spot = trip?.spots.find((item) => item.id === spotId);
  const addSpot = useTripStore((state) => state.addSpot);
  const updateSpot = useTripStore((state) => state.updateSpot);
  const deletePlanItem = useTripStore((state) => state.deletePlanItem);

  const [type, setType] = useState<SpotType>(spot?.type || importDraft?.type || 'hotel');
  const [transportMode, setTransportMode] = useState<TransportMode>(spot?.transportMode || importDraft?.transportMode || 'bus');
  const [name, setName] = useState(spot?.name || importDraft?.name || '');
  const [address, setAddress] = useState(spot?.address || importDraft?.address || '');
  const [destinationAddress, setDestinationAddress] = useState(spot?.destinationAddress || importDraft?.destinationAddress || '');
  const [lat, setLat] = useState((spot?.lat ?? importDraft?.lat)?.toString() || '');
  const [lng, setLng] = useState((spot?.lng ?? importDraft?.lng)?.toString() || '');
  const [destinationLat, setDestinationLat] = useState((spot?.destinationLat ?? importDraft?.destinationLat)?.toString() || '');
  const [destinationLng, setDestinationLng] = useState((spot?.destinationLng ?? importDraft?.destinationLng)?.toString() || '');
  const [lastGeocodedAddress, setLastGeocodedAddress] = useState(spot?.address?.trim() || '');
  const [lastGeocodedDestinationAddress, setLastGeocodedDestinationAddress] = useState(
    spot?.destinationAddress?.trim() || ''
  );
  const [coordinatesTouched, setCoordinatesTouched] = useState(false);
  const [destinationCoordinatesTouched, setDestinationCoordinatesTouched] = useState(false);
  const [date, setDate] = useState(
    spot ? toDateInput(spot.date) : importDraft?.date ? toDateInput(importDraft.date) : toDateInput(trip?.startDate)
  );
  const [endDate, setEndDate] = useState(
    spot?.endDate ? toDateInput(spot.endDate) : importDraft?.endDate ? toDateInput(importDraft.endDate) : ''
  );
  const [startTime, setStartTime] = useState(spot?.startTime || importDraft?.startTime || '');
  const [endTime, setEndTime] = useState(spot?.endTime || importDraft?.endTime || '');
  const [price, setPrice] = useState((spot?.price ?? importDraft?.price)?.toString() || '');
  const [currency, setCurrency] = useState(spot?.currency || importDraft?.currency || 'JPY');
  const [bookingSite, setBookingSite] = useState(spot?.bookingSite || importDraft?.bookingSite || '');
  const [confirmationNumber, setConfirmationNumber] = useState(spot?.confirmationNumber || importDraft?.confirmationNumber || '');
  const [officialUrl, setOfficialUrl] = useState(spot?.officialUrl || importDraft?.officialUrl || '');
  const [phone, setPhone] = useState(spot?.phone || importDraft?.phone || '');
  const [businessHours, setBusinessHours] = useState(spot?.businessHours || importDraft?.businessHours || '');
  const [placeDetails, setPlaceDetails] = useState(spot?.placeDetails || importDraft?.placeDetails || '');
  const [travelDuration, setTravelDuration] = useState(spot?.travelDuration || importDraft?.travelDuration || '');
  const [routeUrl, setRouteUrl] = useState(spot?.routeUrl || importDraft?.routeUrl || '');
  const [notes, setNotes] = useState(spot?.notes || importDraft?.notes || '');
  const [attachments, setAttachments] = useState<string[]>(spot?.attachments || importDraft?.attachments || []);
  const [files, setFiles] = useState<FileAttachment[]>(spot?.files || importDraft?.files || []);
  const [selectedAttachment, setSelectedAttachment] = useState<number | null>(null);
  const [cancellationFeeStartDate, setCancellationFeeStartDate] = useState(
    spot?.cancellationFeeStartDate
      ? toDateInput(spot.cancellationFeeStartDate)
      : importDraft?.cancellationFeeStartDate
        ? toDateInput(importDraft.cancellationFeeStartDate)
        : ''
  );
  const [cancellationReminderEnabled, setCancellationReminderEnabled] = useState(
    spot?.cancellationReminderEnabled ??
      Boolean(spot?.cancellationNotificationId || importDraft?.cancellationFeeStartDate)
  );
  const [eventReminderEnabled, setEventReminderEnabled] = useState(
    spot?.eventReminderEnabled ?? Boolean(spot?.eventNotificationId)
  );
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const typeOptions = useMemo(
    () => spotTypes.map((spotType) => ({ value: spotType, label: spotTypeLabels[spotType] })),
    []
  );

  if (!trip) {
    return (
      <View style={styles.content}>
        <Text style={styles.title}>旅行が見つかりません</Text>
      </View>
    );
  }

  const addAttachment = async () => {
    try {
      const uri = await pickAttachment();
      if (!uri) return;

      if (isFirebaseConfigured()) {
        const user = await ensureAnonymousUser();
        const storagePath = `users/${user.uid}/trips/${trip.id}/attachments/${Date.now()}.jpg`;
        const downloadUrl = await uploadAttachmentToStorage(uri, storagePath);
        setAttachments((current) => [...current, downloadUrl]);
        return;
      }

      setAttachments((current) => [...current, uri]);
    } catch (error) {
      Alert.alert('添付できませんでした', error instanceof Error ? error.message : '画像の選択に失敗しました。');
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const addFile = async () => {
    try {
      const selectedFile = await pickFileAttachment();
      if (!selectedFile) return;

      if (isFirebaseStorageConfigured()) {
        const user = await ensureAnonymousUser();
        const storagePath = `users/${user.uid}/trips/${trip.id}/files/${selectedFile.id}_${selectedFile.name}`;
        const uploadedFile = await uploadFileAttachmentToStorage(selectedFile, storagePath);
        setFiles((current) => [...current, uploadedFile]);
        return;
      }

      setFiles((current) => [...current, selectedFile]);
    } catch (error) {
      Alert.alert(
        'ファイルを添付できませんでした',
        error instanceof Error ? error.message : 'ファイルの選択に失敗しました。'
      );
    }
  };

  const hasCompleteCoordinates = (latitude: string, longitude: string) => {
    const parsedLat = Number(latitude.trim());
    const parsedLng = Number(longitude.trim());
    return Number.isFinite(parsedLat) && Number.isFinite(parsedLng);
  };

  const locateFromAddress = async () => {
    if (!address.trim()) {
      Alert.alert('住所がありません', '住所 / 集合場所を入力してください。');
      return false;
    }

    setIsLocating(true);
    try {
      const origin = await geocodeAddress(address, { destination: trip.destination, name });
      if (!origin) {
        if (hasCompleteCoordinates(lat, lng)) {
          Alert.alert(
            '入力済みの座標があります',
            '住所からの再取得はできませんでしたが、緯度・経度が入っているため保存すると地図に表示できます。別の場所に出る場合は住所を詳しくするか、Googleマップの緯度・経度を貼ってください。'
          );
          return true;
        }

        Alert.alert(
          '座標を取得できませんでした',
          '施設名と住所をもう少し詳しく入力するか、緯度・経度を手入力してください。'
        );
        return false;
      }

      setLat(origin.lat.toFixed(6));
      setLng(origin.lng.toFixed(6));
      setLastGeocodedAddress(address.trim());
      setCoordinatesTouched(false);

      if (type === 'transport' && destinationAddress.trim()) {
        const destination = await geocodeAddress(destinationAddress, {
          destination: trip.destination,
          name: destinationAddress
        });
        if (destination) {
          setDestinationLat(destination.lat.toFixed(6));
          setDestinationLng(destination.lng.toFixed(6));
          setLastGeocodedDestinationAddress(destinationAddress.trim());
          setDestinationCoordinatesTouched(false);
        }
      }

      Alert.alert('座標を取得しました', 'このスポットを地図に表示できます。');
      return true;
    } catch (error) {
      Alert.alert('座標を取得できませんでした', error instanceof Error ? error.message : '住所の変換に失敗しました。');
      return false;
    } finally {
      setIsLocating(false);
    }
  };

  const resolveCoordinatesForSave = async () => {
    let nextLat = parseOptionalNumber(lat, '緯度');
    let nextLng = parseOptionalNumber(lng, '経度');
    let nextDestinationLat = parseOptionalNumber(destinationLat, '到着地の緯度');
    let nextDestinationLng = parseOptionalNumber(destinationLng, '到着地の経度');
    const trimmedAddress = address.trim();
    const trimmedDestinationAddress = destinationAddress.trim();
    const shouldGeocodeOrigin =
      Boolean(trimmedAddress) &&
      ((nextLat === undefined || nextLng === undefined) ||
        (!coordinatesTouched && lastGeocodedAddress !== trimmedAddress));
    let originGeocoded = false;

    if (shouldGeocodeOrigin) {
      const origin = await geocodeAddress(trimmedAddress, { destination: trip.destination, name });
      if (origin) {
        nextLat = origin.lat;
        nextLng = origin.lng;
        setLat(origin.lat.toFixed(6));
        setLng(origin.lng.toFixed(6));
        setLastGeocodedAddress(trimmedAddress);
        setCoordinatesTouched(false);
        originGeocoded = true;
      }
    }

    if (trimmedAddress && (nextLat === undefined || nextLng === undefined)) {
      throw new Error(
        '住所を地図用の座標に変換できませんでした。施設名と住所を詳しく入力するか、緯度・経度を手入力してください。'
      );
    }

    if (shouldGeocodeOrigin && !originGeocoded && !coordinatesTouched) {
      throw new Error(
        '住所が変わったため座標を更新しようとしましたが、変換できませんでした。施設名を含めて入力するか、緯度・経度を手入力してください。'
      );
    }

    const shouldGeocodeDestination =
      type === 'transport' &&
      Boolean(trimmedDestinationAddress) &&
      ((nextDestinationLat === undefined || nextDestinationLng === undefined) ||
        (!destinationCoordinatesTouched && lastGeocodedDestinationAddress !== trimmedDestinationAddress));

    if (
      shouldGeocodeDestination
    ) {
      const destination = await geocodeAddress(trimmedDestinationAddress, {
        destination: trip.destination,
        name: trimmedDestinationAddress
      });
      if (destination) {
        nextDestinationLat = destination.lat;
        nextDestinationLng = destination.lng;
        setDestinationLat(destination.lat.toFixed(6));
        setDestinationLng(destination.lng.toFixed(6));
        setLastGeocodedDestinationAddress(trimmedDestinationAddress);
        setDestinationCoordinatesTouched(false);
      }
    }

    return { nextLat, nextLng, nextDestinationLat, nextDestinationLng };
  };

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('入力が足りません', 'スポット名を入力してください。');
      return;
    }

    setIsSaving(true);
    try {
      const { nextLat, nextLng, nextDestinationLat, nextDestinationLng } = await resolveCoordinatesForSave();
      const nextTravelDuration = travelDuration.trim() || calculateDurationFromTimes(startTime, endTime);
      const nextRouteUrl =
        type === 'transport'
          ? routeUrl.trim() || createGoogleMapsRouteUrl(address, destinationAddress, transportMode)
          : '';

      let cancellationNotificationId = spot?.cancellationNotificationId || '';
      let savedCancellationReminderEnabled = cancellationReminderEnabled;
      let eventNotificationId = spot?.eventNotificationId || '';
      let savedEventReminderEnabled = eventReminderEnabled;
      const notificationWarnings: string[] = [];

      if (eventReminderEnabled) {
        try {
          eventNotificationId = await scheduleEventReminder({
            eventDate: date,
            eventTime: startTime,
            spotName: name.trim(),
            tripTitle: trip.title,
            previousIdentifier: spot?.eventNotificationId
          });
        } catch (error) {
          notificationWarnings.push(error instanceof Error ? error.message : '予定の通知を設定できませんでした。');
          await cancelReminder(spot?.eventNotificationId);
          eventNotificationId = '';
          savedEventReminderEnabled = false;
        }
      } else if (spot?.eventNotificationId) {
        await cancelReminder(spot.eventNotificationId);
        eventNotificationId = '';
        savedEventReminderEnabled = false;
      }

      if (cancellationFeeStartDate && cancellationReminderEnabled) {
        try {
          cancellationNotificationId = await scheduleCancellationReminder({
            cancellationFeeStartDate,
            spotName: name.trim(),
            tripTitle: trip.title,
            previousIdentifier: spot?.cancellationNotificationId
          });
        } catch (error) {
          notificationWarnings.push(error instanceof Error ? error.message : 'キャンセル料の通知を設定できませんでした。');
          await cancelReminder(spot?.cancellationNotificationId);
          cancellationNotificationId = '';
          savedCancellationReminderEnabled = false;
        }
      } else if (spot?.cancellationNotificationId) {
        await cancelReminder(spot.cancellationNotificationId);
        cancellationNotificationId = '';
        savedCancellationReminderEnabled = false;
      }

      const draft: SpotDraft = {
        type,
        transportMode: type === 'transport' ? transportMode : undefined,
        name,
        address,
        destinationAddress: type === 'transport' ? destinationAddress : '',
        lat: nextLat,
        lng: nextLng,
        destinationLat: type === 'transport' ? nextDestinationLat : undefined,
        destinationLng: type === 'transport' ? nextDestinationLng : undefined,
        date,
        endDate: endDate || undefined,
        startTime,
        endTime,
        price: parseOptionalNumber(price, '料金'),
        currency,
        bookingSite,
        confirmationNumber,
        officialUrl,
        phone,
        businessHours,
        placeDetails,
        travelDuration: type === 'transport' ? nextTravelDuration : '',
        routeUrl: nextRouteUrl,
        cancellationFeeStartDate: cancellationFeeStartDate || undefined,
        cancellationReminderEnabled: savedCancellationReminderEnabled,
        cancellationNotificationId,
        eventReminderEnabled: savedEventReminderEnabled,
        eventNotificationId,
        notes,
        attachments,
        files
      };

      if (spotId) {
        updateSpot(trip.id, spotId, draft);
        if (notificationWarnings.length) {
          Alert.alert('スポットを保存しました', `通知のみ設定できませんでした。\n${notificationWarnings.join('\n')}`, [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        } else {
          navigation.goBack();
        }
        return;
      }

      const newSpotId = addSpot(trip.id, draft);
      if (planItemId) {
        deletePlanItem(trip.id, planItemId);
      }
      if (notificationWarnings.length) {
        Alert.alert('スポットを追加しました', `通知のみ設定できませんでした。\n${notificationWarnings.join('\n')}`, [
          { text: 'OK', onPress: () => navigation.replace('SpotDetail', { tripId: trip.id, spotId: newSpotId }) }
        ]);
      } else {
        navigation.replace('SpotDetail', { tripId: trip.id, spotId: newSpotId });
      }
    } catch (error) {
      Alert.alert('入力を確認してください', error instanceof Error ? error.message : '保存できませんでした。');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>カテゴリ</Text>
          <SegmentedControl value={type} options={typeOptions} onChange={setType} wrap />
          <Text style={styles.helper}>{spotTypeHints[type]}</Text>
        </View>

        {type === 'transport' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>交通種別</Text>
            <View style={styles.chips}>
              {transportModes.map((mode) => {
                const selected = transportMode === mode;
                return (
                  <Pressable
                    key={mode}
                    onPress={() => setTransportMode(mode)}
                    style={[styles.chip, selected && styles.chipSelected]}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{transportModeLabels[mode]}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Field label="名前" value={name} onChangeText={setName} placeholder="例: Lakefront Stay Queenstown" />
          <Field
            label={type === 'transport' ? '出発地 / 集合場所' : '住所 / 集合場所'}
            value={address}
            onChangeText={setAddress}
            placeholder="例: Queenstown Airport"
          />
          {type === 'transport' ? (
            <Field
              label="到着地"
              value={destinationAddress}
              onChangeText={setDestinationAddress}
              placeholder="例: Queenstown CBD"
            />
          ) : null}
          <View style={styles.twoColumns}>
            <Field
              label="緯度"
              value={lat}
              onChangeText={(value) => {
                setCoordinatesTouched(true);
                setLat(value);
              }}
              placeholder="-45.0313"
              keyboardType="decimal-pad"
            />
            <Field
              label="経度"
              value={lng}
              onChangeText={(value) => {
                setCoordinatesTouched(true);
                setLng(value);
              }}
              placeholder="168.6542"
              keyboardType="decimal-pad"
            />
          </View>
          <AppButton
            label={isLocating ? '座標取得中...' : '住所から座標取得'}
            variant="secondary"
            icon={<MapPin size={18} color={colors.text} />}
            disabled={isLocating}
            onPress={locateFromAddress}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.twoColumns}>
            <DatePickerField label="日付" value={date} onChange={setDate} />
            <DatePickerField label="終了日" value={endDate} onChange={setEndDate} optional />
          </View>
          <View style={styles.twoColumns}>
            <TimePickerField label="開始時刻" value={startTime} onChange={setStartTime} />
            <TimePickerField label="終了時刻" value={endTime} onChange={setEndTime} />
          </View>
          {type === 'transport' ? (
            <Field
              label="所要時間"
              value={travelDuration}
              onChangeText={setTravelDuration}
              placeholder={calculateDurationFromTimes(startTime, endTime) || '例: 3時間53分'}
            />
          ) : null}
        </View>

        <View style={styles.section}>
          <View style={styles.twoColumns}>
            <Field label="料金" value={price} onChangeText={setPrice} placeholder="12000" keyboardType="numeric" />
            <Field label="通貨" value={currency} onChangeText={setCurrency} placeholder="JPY" />
          </View>
          <Field label="予約サイト" value={bookingSite} onChangeText={setBookingSite} placeholder="Trip.com / Expedia" />
          <Field label="確認番号" value={confirmationNumber} onChangeText={setConfirmationNumber} placeholder="ABC-1234" />
          <Field label="公式/チケットURL" value={officialUrl} onChangeText={setOfficialUrl} placeholder="https://..." />
          <Field label="電話番号" value={phone} onChangeText={setPhone} placeholder="+64 ..." keyboardType="phone-pad" />
          <Field
            label={
              type === 'hotel'
                ? 'フロント / チェックイン案内'
                : type === 'transport'
                  ? '運行時間'
                  : '営業時間'
            }
            value={businessHours}
            onChangeText={setBusinessHours}
            placeholder={type === 'hotel' ? '例: フロント24時間 / チェックイン15:00以降' : '例: 09:00 - 21:00'}
          />
          <Field
            label="施設情報"
            value={placeDetails}
            onChangeText={setPlaceDetails}
            multiline
            placeholder="設備、予約条件、見どころ、食事内容など"
          />
          {type === 'transport' ? (
            <Field
              label="Google MapsルートURL"
              value={routeUrl}
              onChangeText={setRouteUrl}
              placeholder={createGoogleMapsRouteUrl(address, destinationAddress, transportMode) || '保存時に自動作成'}
            />
          ) : null}
          <Field label="メモ" value={notes} onChangeText={setNotes} multiline placeholder="持ち物、注意点、現地で確認すること" />
        </View>

        <View style={styles.section}>
          <View style={styles.notificationHeading}>
            <CalendarClock size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>予定のお知らせ</Text>
          </View>
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>予定日の前日午前9時に知らせる</Text>
              <Text style={styles.helper}>
                {startTime ? `「明日は${startTime}から${name || '予定'}です」と表示します。` : '前日に予定名を端末へ表示します。'}
              </Text>
            </View>
            <Switch
              value={eventReminderEnabled}
              onValueChange={setEventReminderEnabled}
              trackColor={{ false: colors.border, true: colors.primarySoft }}
              thumbColor={eventReminderEnabled ? colors.primary : colors.surfaceMuted}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.notificationHeading}>
            <BellRing size={20} color={colors.warning} />
            <Text style={styles.sectionTitle}>キャンセル料のお知らせ</Text>
          </View>
          <DatePickerField
            label="キャンセル料が発生する日"
            value={cancellationFeeStartDate}
            onChange={setCancellationFeeStartDate}
            optional
          />
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>前日の午前9時に知らせる</Text>
              <Text style={styles.helper}>端末に「明日からキャンセル料がかかります」と表示します。</Text>
            </View>
            <Switch
              value={cancellationReminderEnabled}
              onValueChange={setCancellationReminderEnabled}
              disabled={!cancellationFeeStartDate}
              trackColor={{ false: colors.border, true: colors.primarySoft }}
              thumbColor={cancellationReminderEnabled ? colors.primary : colors.surfaceMuted}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>画像・ファイル</Text>
          <Text style={styles.helper}>予約確認書、PDF、文書などをこのスポットに保存できます。</Text>
          <AppButton
            label="PDF・ファイルを追加"
            icon={<FilePlus2 size={18} color={colors.surface} />}
            onPress={addFile}
          />
          <AppButton
            label="画像を追加"
            variant="secondary"
            icon={<ImagePlus size={18} color={colors.text} />}
            onPress={addAttachment}
          />
          {attachments.length ? (
            <View style={styles.attachments}>
              {attachments.map((uri, index) => (
                <View key={`${uri}-${index}`} style={styles.attachment}>
                  <Pressable
                    accessibilityLabel={`画像 ${index + 1} を拡大`}
                    accessibilityRole="imagebutton"
                    onPress={() => setSelectedAttachment(index)}
                  >
                    <Image source={{ uri }} resizeMode="contain" style={styles.attachmentImage} />
                  </Pressable>
                  <Pressable
                    accessibilityLabel="画像を削除"
                    onPress={() => removeAttachment(index)}
                    style={styles.removeAttachment}
                  >
                    <X size={16} color={colors.surface} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
          <FileAttachmentList
            files={files}
            onRemove={(id) => setFiles((current) => current.filter((file) => file.id !== id))}
          />
        </View>

        <AttachmentViewer
          attachments={attachments}
          initialIndex={selectedAttachment}
          onClose={() => setSelectedAttachment(null)}
        />

        <AppButton
          label={isSaving ? '保存中...' : spotId ? 'スポットを保存' : 'スポットを追加'}
          disabled={isSaving || isLocating}
          onPress={save}
        />
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
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900'
  },
  section: {
    gap: spacing.md
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900'
  },
  notificationHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  switchRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  switchText: {
    flex: 1,
    gap: spacing.xs
  },
  switchLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800'
  },
  helper: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19
  },
  twoColumns: {
    flexDirection: 'row',
    gap: spacing.md
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '800'
  },
  chipTextSelected: {
    color: colors.primary
  },
  attachments: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md
  },
  attachment: {
    position: 'relative'
  },
  attachmentImage: {
    width: 112,
    height: 84,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  removeAttachment: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
