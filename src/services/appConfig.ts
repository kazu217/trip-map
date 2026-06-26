import { Platform } from 'react-native';

declare const process: {
  env: Record<string, string | undefined>;
};

const googleMapsIosApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY;
const googleMapsAndroidApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY;

export const googleMapsApiKeyForPlatform = () => {
  if (Platform.OS === 'ios') return googleMapsIosApiKey;
  if (Platform.OS === 'android') return googleMapsAndroidApiKey;
  return undefined;
};

export const isGoogleMapsConfigured = () => {
  return Boolean(googleMapsApiKeyForPlatform());
};
