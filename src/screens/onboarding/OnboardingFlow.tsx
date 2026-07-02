import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenLayout } from '../../components/layout';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useOnboardingPersistence } from '../../hooks/useOnboardingPersistence';
import { onboardingSchema, onboardingStepSchemas } from '../../lib/validation';
import { OnboardingStackParamList } from '../../navigation/types';
import { onboardingService } from '../../services/onboardingService';
import type { OnboardingSaveError } from '../../services/onboardingService';
import { useAuthStore } from '../../stores/authStore';
import { OnboardingData } from '../../types/onboarding';
import { colors, spacing, typography } from '../../theme';
import { showErrorDialog } from '../../utils/dialogs';
import { CommunicationStep } from './CommunicationStep';
import { FaithStep } from './FaithStep';
import { FutureVisionStep } from './FutureVisionStep';
import { LifestyleStep } from './LifestyleStep';
import { PersonalProfileStep } from './PersonalProfileStep';
import { PreferencesStep } from './PreferencesStep';
import { RelationshipStep } from './RelationshipStep';
import { initialOnboardingState, onboardingReducer } from './state';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Onboarding'>;

const stepMeta = [
  {
    eyebrow: 'Your Profile',
    label: 'About You',
    progress: 1 / 7,
    cta: 'Continue',
  },
  { eyebrow: 'Alignment Profile', label: 'Relationship', progress: 2 / 7, cta: 'Continue' },
  { eyebrow: 'Alignment Profile', label: 'Communication', progress: 3 / 7, cta: 'Continue' },
  { eyebrow: 'Alignment Profile', label: 'Lifestyle', progress: 4 / 7, cta: 'Continue' },
  { eyebrow: 'Alignment Profile', label: 'Faith', progress: 5 / 7, cta: 'Continue' },
  { eyebrow: 'Alignment Profile', label: 'Future Vision', progress: 6 / 7, cta: 'Continue' },
  {
    eyebrow: 'Alignment Profile',
    label: 'Preferences',
    progress: 7 / 7,
    cta: 'Complete Alignment Profile',
  },
] as const;

const recoveryStepMap = {
  profile: 0,
  preferences: 6,
} as const;

function isOnboardingSaveError(error: unknown): error is OnboardingSaveError {
  return error instanceof Error && 'action' in error;
}

export function OnboardingFlow({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const setProfileStatus = useAuthStore((state) => state.setProfileStatus);
  const [state, dispatch] = useReducer(onboardingReducer, initialOnboardingState);
  const [restoring, setRestoring] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const firstRender = useRef(true);
  const scrollRef = useRef<ScrollView>(null);
  const persistence = useOnboardingPersistence(user?.id ?? 'guest');

  const currentMeta = stepMeta[state.step];

  useEffect(() => {
    let mounted = true;

    const restore = async () => {
      const savedState = await persistence.restoreProgress();

      if (savedState && mounted) {
        dispatch({ type: 'HYDRATE', payload: savedState });
      }

      if (mounted) {
        setRestoring(false);
      }
    };

    void restore();

    return () => {
      mounted = false;
    };
  }, [persistence]);

  useEffect(() => {
    if (restoring) {
      return;
    }

    void persistence.saveProgress(state);
  }, [persistence, restoring, state]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });

    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    slideAnim.setValue(state.direction === 'forward' ? 32 : -32);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [slideAnim, state.direction, state.step]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (state.step > 0) {
        dispatch({ type: 'PREV_STEP' });
        return true;
      }

      signOut();
      return true;
    });

    return () => subscription.remove();
  }, [signOut, state.step]);

  const updateData = (payload: Partial<OnboardingData>) => {
    dispatch({ type: 'UPDATE_DATA', payload });
  };

  const handleBack = () => {
    if (state.step === 0) {
      signOut();
      return;
    }

    dispatch({ type: 'PREV_STEP' });
  };

  const validationStepMap: Record<string, number> = {
    firstName: 0,
    dateOfBirth: 0,
    gender: 0,
    relationshipGoal: 1,
    communicationStyle: 2,
    conflictStyle: 2,
    lifestyleVision: 3,
    sharedFaith: 4,
    churchInvolvement: 4,
    futureHopes: 5,
    ageRange: 6,
    distanceRange: 6,
    distanceType: 6,
    distanceRadiusMiles: 6,
  };

  const getValidationStep = (path: string) => validationStepMap[path] ?? 6;

  const validateCurrentStep = () => {
    const result = onboardingStepSchemas[state.step].safeParse(state.data);

    if (result.success) {
      return true;
    }

    const issue = result.error.issues[0];
    dispatch({ type: 'SET_VALIDATION', message: issue.message, step: state.step });
    return false;
  };

  const completeFlow = async () => {
    const result = onboardingSchema.safeParse(state.data);

    if (!result.success) {
      console.error(
        '[Onboarding] Zod validation failed:',
        JSON.stringify(result.error.issues, null, 2),
      );
      console.error('[Onboarding] Current state.data:', JSON.stringify(state.data, null, 2));

      const issue = result.error.issues[0];
      const path = String(issue.path[0] ?? 'ageRange');
      const step = getValidationStep(path);
      dispatch({ type: 'GO_TO_STEP', step });
      dispatch({ type: 'SET_VALIDATION', message: issue.message, step });
      return;
    }

    if (!user) {
      throw new Error('You must be signed in to complete your alignment profile.');
    }

    setSubmitting(true);

    try {
      const profileStatus = await onboardingService.saveCompletedOnboarding(user.id, state.data);
      await persistence.clearProgress();
      setProfileStatus(profileStatus);
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (state.step === 6) {
      try {
        await completeFlow();
      } catch (error) {
        console.error('Unable to complete Alignment Profile:', error);
        if (isOnboardingSaveError(error)) {
          if (error.action === 'goToStep') {
            const step = error.step ? recoveryStepMap[error.step] : state.step;
            dispatch({ type: 'GO_TO_STEP', step });
            dispatch({ type: 'SET_VALIDATION', message: error.message, step });
          } else if (error.action === 'reauth') {
            await signOut();
          }

          showErrorDialog('Could not complete your Alignment Profile', error.message);
          return;
        }

        showErrorDialog(
          'Could not complete your Alignment Profile',
          'Please try again in a moment.',
        );
      }
      return;
    }

    dispatch({ type: 'NEXT_STEP' });
  };

  const content = useMemo(() => {
    switch (state.step) {
      case 0:
        return (
          <PersonalProfileStep
            data={state.data}
            updateData={updateData}
            validationMessage={state.validationStep === 0 ? state.validationMessage : null}
          />
        );
      case 1:
        return (
          <RelationshipStep
            data={state.data}
            updateData={updateData}
            validationMessage={state.validationStep === 1 ? state.validationMessage : null}
          />
        );
      case 2:
        return (
          <CommunicationStep
            data={state.data}
            updateData={updateData}
            validationMessage={state.validationStep === 2 ? state.validationMessage : null}
          />
        );
      case 3:
        return (
          <LifestyleStep
            data={state.data}
            updateData={updateData}
            validationMessage={state.validationStep === 3 ? state.validationMessage : null}
          />
        );
      case 4:
        return (
          <FaithStep
            data={state.data}
            updateData={updateData}
            validationMessage={state.validationStep === 4 ? state.validationMessage : null}
          />
        );
      case 5:
        return (
          <FutureVisionStep
            data={state.data}
            updateData={updateData}
            validationMessage={state.validationStep === 5 ? state.validationMessage : null}
          />
        );
      case 6:
      default:
        return (
          <PreferencesStep
            data={state.data}
            updateData={updateData}
            validationMessage={state.validationStep === 6 ? state.validationMessage : null}
          />
        );
    }
  }, [state.data, state.step, state.validationMessage, state.validationStep]);

  if (restoring) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScreenLayout
      footer={
        <>
          <Button
            loading={state.step === 6 && submitting}
            onPress={() => void handleContinue()}
            title={currentMeta.cta}
          />
          <Text style={styles.helper}>Your progress is saved as you go.</Text>
        </>
      }
      header={
        <ScreenHeader
          eyebrow={currentMeta.eyebrow}
          onBack={handleBack}
          progress={currentMeta.progress}
          stepLabel={currentMeta.label}
        />
      }
      scrollContentStyle={styles.scrollContent}
      scrollRef={scrollRef}
    >
      <Animated.View style={[styles.stepContent, { transform: [{ translateX: slideAnim }] }]}>
        {content}
      </Animated.View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxl * 2,
    gap: spacing.lg,
  },
  stepContent: {
    width: '100%',
  },
  helper: {
    ...typography.bodySm,
    color: colors.outline,
    textAlign: 'center',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
