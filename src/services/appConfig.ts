import { Platform } from 'react-native';
import Constants from 'expo-constants';

declare const process: {
  env: Record<string, string | undefined>;
};

const googleMapsIosApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY;
const googleMapsAndroidApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY;

type AppExtra = {
  googleMapsIosConfigured?: boolean;
  googleMapsAndroidConfigured?: boolean;
};

const hasValue = (value: string | undefined) => Boolean(value && value.trim().length > 0);

const appExtra = (Constants.expoConfig?.extra || {}) as AppExtra;

export const googleMapsApiKeyForPlatform = () => {
  if (Platform.OS === 'ios') return googleMapsIosApiKey;
  if (Platform.OS === 'android') return googleMapsAndroidApiKey;
  return undefined;
};

export const isGoogleMapsConfigured = () => {
  if (hasValue(googleMapsApiKeyForPlatform())) return true;
  if (Platform.OS === 'ios') return Boolean(appExtra.googleMapsIosConfigured);
  if (Platform.OS === 'android') return Boolean(appExtra.googleMapsAndroidConfigured);
  return false;
};
