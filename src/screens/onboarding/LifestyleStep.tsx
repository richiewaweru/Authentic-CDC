import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { MultiSelectPill } from '../../components/ui/MultiSelectPill';
import { SingleSelect } from '../../components/ui/SingleSelect';
import { OnboardingData } from '../../types/onboarding';
import { colors, spacing, typography } from '../../theme';
import { lifestyleVisions, sharedActivities } from './options';

interface LifestyleStepProps {
  data: OnboardingData;
  updateData: (payload: Partial<OnboardingData>) => void;
}

export function LifestyleStep({ data, updateData }: LifestyleStepProps) {
  const toggleActivity = (value: string) => {
    const nextValues = data.sharedActivities.includes(value)
      ? data.sharedActivities.filter((item) => item !== value)
      : [...data.sharedActivities, value];

    updateData({ sharedActivities: nextValues });
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.headline}>Lifestyle & Fellowship</Text>
      <Text style={styles.subtitle}>
        Share the rhythms, community, and experiences you hope to build.
      </Text>
      <View style={styles.section}>
        <Text style={styles.label}>WHAT FUTURE LIFESTYLE VISION FEELS CLOSEST TO YOU?</Text>
        <SingleSelect
          onSelect={(value) => updateData({ lifestyleVision: value })}
          options={lifestyleVisions}
          selectedValue={data.lifestyleVision}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>WHAT SHARED ACTIVITIES WOULD YOU ENJOY?</Text>
        <MultiSelectPill
          onToggle={toggleActivity}
          options={sharedActivities}
          selectedValues={data.sharedActivities}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.lg,
  },
  headline: {
    ...typography.headlineLg,
    color: colors.primaryDark,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  section: {
    gap: spacing.sm,
  },
  label: {
    ...typography.labelMd,
    color: colors.primaryDark,
  },
});
