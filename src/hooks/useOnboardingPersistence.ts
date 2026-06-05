import { useCallback, useMemo } from 'react';

import type { OnboardingState } from '../types/onboarding';
import {
  clearOnboardingProgress,
  restoreOnboardingProgress,
  saveOnboardingProgress,
} from '../lib/onboardingStorage';

export const useOnboardingPersistence = (userId: string) => {
  const saveProgress = useCallback(
    async (state: OnboardingState) => {
      await saveOnboardingProgress(userId, state);
    },
    [userId],
  );

  const restoreProgress = useCallback(async () => restoreOnboardingProgress(userId), [userId]);

  const clearProgress = useCallback(async () => {
    await clearOnboardingProgress(userId);
  }, [userId]);

  return useMemo(
    () => ({ saveProgress, restoreProgress, clearProgress }),
    [clearProgress, restoreProgress, saveProgress],
  );
};
