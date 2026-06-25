import * as ExpoConstants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from '../config/supabase';

const Constants =
  ('default' in ExpoConstants ? ExpoConstants.default : ExpoConstants) ?? ExpoConstants;

function getExecutionEnvironment() {
  return Constants?.executionEnvironment ?? ExpoConstants.executionEnvironment;
}

function getAppOwnership() {
  return Constants?.appOwnership ?? ExpoConstants.appOwnership;
}

function getProjectId() {
  return (
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId ??
    ExpoConstants.expoConfig?.extra?.eas?.projectId ??
    ExpoConstants.easConfig?.projectId
  );
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function isExpoGoLikeEnvironment() {
  return getExecutionEnvironment() === 'storeClient' || getAppOwnership() === 'expo';
}

export async function registerForPushNotifications(userId: string): Promise<void> {
  if (!Device.isDevice || isExpoGoLikeEnvironment()) {
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Authentic CDC',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C6A85E',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return;
  }

  const projectId = getProjectId();

  if (!projectId) {
    console.warn('[Push] No EAS project ID found in app config.');
    return;
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    const { error } = await supabase
      .from('profiles')
      .update({ expo_push_token: token })
      .eq('id', userId);

    if (error) {
      console.warn('[Push] Could not save push token:', error.message);
    }
  } catch (error) {
    console.warn('[Push] Could not get push token:', error);
  }
}
