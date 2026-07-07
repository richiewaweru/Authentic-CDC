import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, sizes, spacing, typography } from '../../theme';
import { JourneyPath } from './JourneyPath';
import { ProgressBar } from './ProgressBar';

interface ScreenHeaderProps {
  eyebrow?: string;
  stepLabel?: string;
  onBack?: () => void;
  progress?: number;
  currentStep?: number;
  totalSteps?: number;
}

export function ScreenHeader({
  eyebrow,
  stepLabel,
  onBack,
  progress,
  currentStep,
  totalSteps,
}: ScreenHeaderProps) {
  return (
    <View style={styles.wrapper}>
      {typeof currentStep === 'number' && typeof totalSteps === 'number' ? (
        <JourneyPath currentStep={currentStep} totalSteps={totalSteps} label={stepLabel} />
      ) : null}
      <View style={styles.row}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          accessibilityRole="button"
          accessibilityState={{ disabled: !onBack }}
          disabled={!onBack}
          onPress={onBack}
          style={styles.backButton}
        >
          {onBack ? <Ionicons name="arrow-back" size={22} color={colors.primary} /> : null}
        </TouchableOpacity>
        <View style={styles.center}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          {stepLabel ? <Text style={styles.stepLabel}>{stepLabel}</Text> : null}
        </View>
        <View style={styles.backButton} />
      </View>
      {typeof progress === 'number' && typeof currentStep !== 'number' ? (
        <View style={styles.progress}>
          <ProgressBar progress={progress} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.goldDark,
  },
  stepLabel: {
    ...typography.labelSm,
    color: colors.primaryDark,
    fontFamily: 'PlayfairDisplay_600SemiBold',
  },
  progress: {
    paddingHorizontal: sizes.hitSlop,
  },
});
