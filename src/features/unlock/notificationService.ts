import { Platform } from 'react-native';
import Constants from 'expo-constants';

import type { MeaningLanguage, Pronunciation, Verse } from '@/types/deen';

export const UNLOCK_CHANNEL_ID = 'deen-unlock';

type NotificationsModule = typeof import('expo-notifications');
type NotificationData = Record<string, unknown>;

function isAndroidExpoGo(): boolean {
  if (Platform.OS !== 'android') {
    return false;
  }
  return (
    Constants.executionEnvironment === 'storeClient' || Constants.appOwnership === 'expo'
  );
}

function loadNotifications(): NotificationsModule | null {
  // Importing expo-notifications throws in Expo Go on Android (SDK 53+).
  // Local and remote notifications still work in a development build.
  if (Platform.OS === 'web' || isAndroidExpoGo()) {
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-notifications') as NotificationsModule;
  } catch {
    return null;
  }
}

const Notifications = loadNotifications();

if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export function areNotificationsAvailable(): boolean {
  return Notifications != null;
}

export async function ensureUnlockChannel(): Promise<void> {
  if (!Notifications || Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(UNLOCK_CHANNEL_ID, {
    name: 'Unlock verses',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 40],
    lightColor: '#52685A',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

export async function getNotificationPermission(): Promise<boolean> {
  if (!Notifications) {
    return false;
  }
  const settings = await Notifications.getPermissionsAsync();
  return (
    settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Notifications) {
    return false;
  }
  await ensureUnlockChannel();
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) {
    return true;
  }
  const result = await Notifications.requestPermissionsAsync();
  return result.granted;
}

export function verseNotificationBody(
  verse: Verse,
  pronunciation: Pronunciation,
  meaningLanguage: MeaningLanguage = 'english'
): string {
  const lines = [verse.arabic];
  if (pronunciation === 'english' || pronunciation === 'both') {
    lines.push(verse.transliterationEn);
  }
  if (pronunciation === 'bengali' || pronunciation === 'both') {
    lines.push(verse.transliterationBn);
  }
  if ((meaningLanguage === 'english' || meaningLanguage === 'both') && verse.meaningEn) {
    lines.push(verse.meaningEn);
  }
  if ((meaningLanguage === 'bengali' || meaningLanguage === 'both') && verse.meaningBn) {
    lines.push(verse.meaningBn);
  }
  return lines.join('\n');
}

export async function previewUnlockNotification(
  verse: Verse,
  pronunciation: Pronunciation,
  meaningLanguage: MeaningLanguage = 'english'
): Promise<void> {
  if (!Notifications) {
    return;
  }
  await ensureUnlockChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Deen  ·  ${verse.surahId} : ${verse.ayahNumber}`,
      subtitle: 'A verse for your day',
      body: verseNotificationBody(verse, pronunciation, meaningLanguage),
      data: { url: `/verse/${verse.id}`, verseId: verse.id },
      color: '#17231D',
    },
    trigger: Platform.OS === 'android' ? { channelId: UNLOCK_CHANNEL_ID } : null,
  });
}

export function subscribeToNotificationOpens(onOpen: (data: NotificationData) => void): () => void {
  if (!Notifications) {
    return () => {};
  }

  void ensureUnlockChannel();

  const response = Notifications.getLastNotificationResponse();
  if (response?.notification) {
    onOpen((response.notification.request.content.data ?? {}) as NotificationData);
  }

  const subscription = Notifications.addNotificationResponseReceivedListener((event) => {
    onOpen((event.notification.request.content.data ?? {}) as NotificationData);
  });

  return () => subscription.remove();
}
