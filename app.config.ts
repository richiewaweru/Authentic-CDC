import type { ConfigContext, ExpoConfig } from 'expo/config';

const appScheme = process.env.EXPO_PUBLIC_APP_SCHEME ?? 'authenticcdc';
const appSlug = 'authentic';
const bundleIdentifier = process.env.EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER ?? 'com.richiewaweru.authenticcdc';
const androidPackage = process.env.EXPO_PUBLIC_ANDROID_PACKAGE ?? 'com.richiewaweru.authenticcdc';

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
    ['expo-web-browser', { experimentalLauncherActivity: false }],
    'expo-secure-store',
  ],
  extra: {
    appScheme,
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
});
