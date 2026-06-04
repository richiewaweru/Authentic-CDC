import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { OnboardingState } from '../types/onboarding';

const buildKey = (userId: string) => `onboarding_progress_${userId}`;

export const useOnboardingPersistence = (userId: string) => {
  const saveProgress = useCallback(
    async (state: OnboardingState) => {
      await AsyncStorage.setItem(buildKey(userId), JSON.stringify(state));
    },
    [userId],
  );

  const restoreProgress = useCallback(async () => {
    const value = await AsyncStorage.getItem(buildKey(userId));
    return value ? (JSON.parse(value) as OnboardingState) : null;
  }, [userId]);

  const clearProgress = useCallback(async () => {
    await AsyncStorage.removeItem(buildKey(userId));
  }, [userId]);

  return { saveProgress, restoreProgress, clearProgress };
};
