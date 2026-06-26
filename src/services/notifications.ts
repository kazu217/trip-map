import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CANCELLATION_CHANNEL = 'cancellation-reminders';
const EVENT_CHANNEL = 'event-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

export const configureNotifications = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANCELLATION_CHANNEL, {
      name: 'キャンセル料のお知らせ',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 150, 250]
    });
    await Notifications.setNotificationChannelAsync(EVENT_CHANNEL, {
      name: '旅行予定のお知らせ',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 150, 250]
    });
  }
};

const ensureNotificationPermission = async () => {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
};

export const cancelReminder = async (identifier?: string) => {
  if (!identifier) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {
    // The operating system may already have delivered or removed the notification.
  }
};

export const scheduleCancellationReminder = async ({
  cancellationFeeStartDate,
  spotName,
  tripTitle,
  previousIdentifier
}: {
  cancellationFeeStartDate: string;
  spotName: string;
  tripTitle: string;
  previousIdentifier?: string;
}) => {
  const allowed = await ensureNotificationPermission();
  if (!allowed) throw new Error('通知が許可されていません。端末の設定からTripMapの通知を許可してください。');

  const triggerDate = new Date(`${cancellationFeeStartDate.slice(0, 10)}T09:00:00`);
  triggerDate.setDate(triggerDate.getDate() - 1);
  if (triggerDate.getTime() <= Date.now()) {
    throw new Error('通知予定時刻を過ぎています。キャンセル料が発生する日の2日以上前を設定してください。');
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: '明日からキャンセル料がかかります',
      body: `${tripTitle}の「${spotName}」を確認してください。`,
      data: { kind: 'cancellation-reminder' },
      sound: true
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      channelId: Platform.OS === 'android' ? CANCELLATION_CHANNEL : undefined
    }
  });
  await cancelReminder(previousIdentifier);
  return identifier;
};

export const scheduleEventReminder = async ({
  eventDate,
  eventTime,
  spotName,
  tripTitle,
  previousIdentifier
}: {
  eventDate: string;
  eventTime?: string;
  spotName: string;
  tripTitle: string;
  previousIdentifier?: string;
}) => {
  const allowed = await ensureNotificationPermission();
  if (!allowed) throw new Error('通知が許可されていません。端末の設定からTripMapの通知を許可してください。');

  const triggerDate = new Date(`${eventDate.slice(0, 10)}T09:00:00`);
  triggerDate.setDate(triggerDate.getDate() - 1);
  if (triggerDate.getTime() <= Date.now()) {
    throw new Error('通知予定時刻を過ぎています。予定日の2日以上前に設定してください。');
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: `明日は「${spotName}」の予定です`,
      body: `${tripTitle}${eventTime ? ` / ${eventTime}開始` : ''}`,
      data: { kind: 'event-reminder' },
      sound: true
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      channelId: Platform.OS === 'android' ? EVENT_CHANNEL : undefined
    }
  });
  await cancelReminder(previousIdentifier);
  return identifier;
};
