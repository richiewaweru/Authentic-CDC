import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../../components/ui/Button';
import { PinnedFooter } from '../../components/ui/PinnedFooter';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useOnboardingPersistence } from '../../hooks/useOnboardingPersistence';
import { onboardingSchema } from '../../lib/validation';
import { OnboardingStackParamList } from '../../navigation/types';
import { onboardingService } from '../../services/onboardingService';
import { useAuthStore } from '../../stores/authStore';
import { OnboardingData } from '../../types/onboarding';
import { colors, spacing, typography } from '../../theme';
import { CommunicationStep } from './CommunicationStep';
import { FaithStep } from './FaithStep';
import { FutureVisionStep } from './FutureVisionStep';
import { LifestyleStep } from './LifestyleStep';
import { OverviewStep } from './OverviewStep';
import { PreferencesStep } from './PreferencesStep';
import { RelationshipStep } from './RelationshipStep';
import { initialOnboardingState, onboardingReducer } from './state';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Onboarding'>;

const stepMeta = [
  { label: 'Step 2 of 9', progress: 2 / 9, cta: 'Start Alignment Profile' },
  { label: 'Step 3 of 9', progress: 3 / 9, cta: 'Continue ->' },
  { label: 'Step 4 of 9', progress: 4 / 9, cta: 'Continue ->' },
  { label: 'Step 5 of 9', progress: 5 / 9, cta: 'Continue ->' },
  { label: 'Step 6 of 9', progress: 6 / 9, cta: 'Continue ->' },
  { label: 'Step 7 of 9', progress: 7 / 9, cta: 'Continue ->' },
  { label: 'Step 8 of 9', progress: 8 / 9, cta: 'Complete Alignment Profile' },
] as const;

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

  const getValidationStep = (path: string) => {
    if (path === 'relationshipGoal') {
      return 1;
    }

    if (path === 'sharedFaith') {
      return 4;
    }

    return 6;
  };

  const completeFlow = async () => {
    const result = onboardingSchema.safeParse(state.data);

    if (!result.success) {
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
    if (state.step === 6) {
      try {
        await completeFlow();
      } catch (error) {
        Alert.alert('Unable to complete profile', 'Please try again in a moment.');
      }
      return;
    }

    dispatch({ type: 'NEXT_STEP' });
  };

  const content = useMemo(() => {
    switch (state.step) {
      case 0:
        return <OverviewStep />;
      case 1:
        return (
          <RelationshipStep
            data={state.data}
            updateData={updateData}
            validationMessage={state.validationStep === 1 ? state.validationMessage : null}
          />
        );
      case 2:
        return <CommunicationStep data={state.data} updateData={updateData} />;
      case 3:
        return <LifestyleStep data={state.data} updateData={updateData} />;
      case 4:
        return (
          <FaithStep
            data={state.data}
            updateData={updateData}
            validationMessage={state.validationStep === 4 ? state.validationMessage : null}
          />
        );
      case 5:
        return <FutureVisionStep data={state.data} updateData={updateData} />;
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <ScreenHeader
        onBack={handleBack}
        progress={currentMeta.progress}
        stepLabel={currentMeta.label}
      />
      <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }] }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      </Animated.View>
      <PinnedFooter>
        <Button
          loading={state.step === 6 && submitting}
          onPress={() => void handleContinue()}
          title={currentMeta.cta}
        />
        {state.step === 0 ? (
          <Text style={styles.helper}>Your progress is saved as you go.</Text>
        ) : null}
      </PinnedFooter>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl * 2,
    gap: spacing.lg,
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
