import AsyncStorage from '@react-native-async-storage/async-storage';

import type { OnboardingState } from '../types/onboarding';

export const buildOnboardingStorageKey = (userId: string) => `onboarding_progress_${userId}`;

export async function saveOnboardingProgress(userId: string, state: OnboardingState) {
  await AsyncStorage.setItem(buildOnboardingStorageKey(userId), JSON.stringify(state));
}

export async function restoreOnboardingProgress(userId: string) {
  const value = await AsyncStorage.getItem(buildOnboardingStorageKey(userId));
  return value ? (JSON.parse(value) as OnboardingState) : null;
}

export async function clearOnboardingProgress(userId: string) {
  await AsyncStorage.removeItem(buildOnboardingStorageKey(userId));
}
