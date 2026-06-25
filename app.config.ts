import type { ConfigContext, ExpoConfig } from 'expo/config';

const appScheme = process.env.EXPO_PUBLIC_APP_SCHEME ?? 'authenticcdc';
const appSlug = 'authentic-cdc';
const bundleIdentifier = process.env.EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER ?? 'com.authenticcdc.app';
const androidPackage = process.env.EXPO_PUBLIC_ANDROID_PACKAGE ?? 'com.authenticcdc.app';
const easProjectId = process.env.EAS_PROJECT_ID ?? '7139d805-d575-4749-b7ea-3130f07dfa27';
const googleIosUrlScheme = process.env.GOOGLE_IOS_URL_SCHEME;
const googleSignInPlugin: [string, { iosUrlScheme: string }] | null = googleIosUrlScheme
  ? ['@react-native-google-signin/google-signin', { iosUrlScheme: googleIosUrlScheme }]
  : null;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Authentic',
  slug: appSlug,
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: appScheme,
  ios: {
    supportsTablet: true,
    bundleIdentifier,
  },
  android: {
    package: androidPackage,
    predictiveBackGestureEnabled: false,
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-font',
    'expo-status-bar',
    'expo-notifications',
    ['expo-web-browser', { experimentalLauncherActivity: false }],
    'expo-secure-store',
    '@react-native-community/datetimepicker',
    ...(googleSignInPlugin ? [googleSignInPlugin] : []),
  ],
  extra: {
    appScheme,
    eas: {
      projectId: easProjectId,
    },
  },
});
