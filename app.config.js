const { withEntitlementsPlist } = require('@expo/config-plugins');

const optionalValue = (value) => (value && value.trim().length > 0 ? value : undefined);

const googleMapsIosApiKey = optionalValue(
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY || process.env.GOOGLE_MAPS_IOS_API_KEY
);
const googleMapsAndroidApiKey = optionalValue(
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY ||
    process.env.GOOGLE_MAPS_ANDROID_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY
);

const base = {
  name: 'TripMap',
  slug: 'trip-map',
  version: '1.2.3',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'tripmap',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.uri.tripmap',
    buildNumber: '21'
  },
  android: {
    package: 'com.tripmap.app',
    versionCode: 23,
    adaptiveIcon: {
      backgroundColor: '#F8F6F1',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png'
    },
    predictiveBackGestureEnabled: false
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro'
  }
};

const withoutRemotePushEntitlement = (config) =>
  withEntitlementsPlist(config, (configWithEntitlements) => {
    delete configWithEntitlements.modResults['aps-environment'];
    return configWithEntitlements;
  });

module.exports = {
  ...base,
  plugins: [
    'expo-sharing',
    [
      'expo-image-picker',
      {
        photosPermission: 'チケット画像やQRコードを旅行スポットに添付するために写真へのアクセスを使用します。',
        cameraPermission: false,
        microphonePermission: false
      }
    ],
    withoutRemotePushEntitlement
  ],
  ios: {
    ...base.ios,
    infoPlist: {
      NSPhotoLibraryUsageDescription: 'チケット画像やQRコードを旅行スポットに添付するために写真へのアクセスを使用します。'
    },
    config: {
      usesNonExemptEncryption: false,
      ...(googleMapsIosApiKey ? { googleMapsApiKey: googleMapsIosApiKey } : {})
    }
  },
  android: {
    ...base.android,
    permissions: ['READ_MEDIA_IMAGES', 'READ_EXTERNAL_STORAGE', 'POST_NOTIFICATIONS'],
    config: {
      ...(googleMapsAndroidApiKey
        ? {
            googleMaps: {
              apiKey: googleMapsAndroidApiKey
            }
          }
        : {})
    }
  },
  extra: {
    ...base.extra,
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
    googleMapsIosConfigured: Boolean(googleMapsIosApiKey),
    googleMapsAndroidConfigured: Boolean(googleMapsAndroidApiKey)
  }
};
