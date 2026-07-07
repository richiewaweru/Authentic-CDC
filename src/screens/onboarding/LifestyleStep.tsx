import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EntranceSection } from '../../components/ui/EntranceSection';
import { MultiSelectPill } from '../../components/ui/MultiSelectPill';
import { SingleSelect } from '../../components/ui/SingleSelect';
import { SymbolicIcon } from '../../components/ui/SymbolicIcon';
import { OnboardingData } from '../../types/onboarding';
import { colors, spacing, typography } from '../../theme';
import { lifestyleVisions, sharedActivities } from './options';

interface LifestyleStepProps {
  data: OnboardingData;
  updateData: (payload: Partial<OnboardingData>) => void;
  validationMessage?: string | null;
}

export function LifestyleStep({
  data,
  updateData,
  validationMessage,
}: LifestyleStepProps) {
  const toggleActivity = (value: string) => {
    const nextValues = data.sharedActivities.includes(value)
      ? data.sharedActivities.filter((item) => item !== value)
      : [...data.sharedActivities, value];

    updateData({ sharedActivities: nextValues });
  };

  return (
    <View style={styles.wrapper}>
      <EntranceSection delay={0}>
        <Text style={styles.headline}>Lifestyle & Fellowship</Text>
        <Text style={styles.subtitle}>
          Share the rhythms, community, and experiences you hope to build.
        </Text>
      </EntranceSection>
      <EntranceSection delay={60}>
        <SymbolicIcon name="share-2" />
      </EntranceSection>
      {validationMessage ? <Text style={styles.validation}>{validationMessage}</Text> : null}
      <EntranceSection delay={120} style={styles.section}>
        <Text style={styles.label}>WHAT FUTURE LIFESTYLE VISION FEELS CLOSEST TO YOU?</Text>
        <SingleSelect
          onSelect={(value) => updateData({ lifestyleVision: value })}
          options={lifestyleVisions}
          selectedValue={data.lifestyleVision}
        />
      </EntranceSection>
      <EntranceSection delay={180} style={styles.section}>
        <Text style={styles.label}>WHAT SHARED ACTIVITIES WOULD YOU ENJOY?</Text>
        <MultiSelectPill
          onToggle={toggleActivity}
          options={sharedActivities}
          selectedValues={data.sharedActivities}
        />
      </EntranceSection>
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
  validation: {
    ...typography.bodySm,
    color: colors.error,
  },
  section: {
    gap: spacing.sm,
  },
  label: {
    ...typography.labelMd,
    color: colors.primaryDark,
  },
});
