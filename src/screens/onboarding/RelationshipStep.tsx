import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { MultiSelectPill } from '../../components/ui/MultiSelectPill';
import { SingleSelect } from '../../components/ui/SingleSelect';
import { OnboardingData } from '../../types/onboarding';
import { colors, spacing, typography } from '../../theme';
import { relationshipGoals, spouseQualities } from './options';

interface RelationshipStepProps {
  data: OnboardingData;
  updateData: (payload: Partial<OnboardingData>) => void;
  validationMessage?: string | null;
}

export function RelationshipStep({
  data,
  updateData,
  validationMessage,
}: RelationshipStepProps) {
  const toggleQuality = (value: string) => {
    const nextValues = data.spouseQualities.includes(value)
      ? data.spouseQualities.filter((item) => item !== value)
      : [...data.spouseQualities, value].slice(0, 5);

    updateData({ spouseQualities: nextValues });
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.headline}>Relationship Intentions</Text>
      <Text style={styles.subtitle}>
        Tell us what kind of connection you are prayerfully open to.
      </Text>
      {validationMessage ? <Text style={styles.validation}>{validationMessage}</Text> : null}
      <View style={styles.section}>
        <Text style={styles.label}>WHAT TYPE OF RELATIONSHIP ARE YOU SEEKING?</Text>
        <SingleSelect
          onSelect={(value) => updateData({ relationshipGoal: value })}
          options={relationshipGoals}
          selectedValue={data.relationshipGoal}
        />
      </View>
      <View style={styles.section}>
        <View style={styles.counterRow}>
          <Text style={styles.label}>CHOOSE UP TO 5 QUALITIES</Text>
          <Text style={styles.counter}>{data.spouseQualities.length}/5</Text>
        </View>
        <MultiSelectPill
          limit={5}
          onToggle={toggleQuality}
          options={spouseQualities}
          selectedValues={data.spouseQualities}
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
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  counter: {
    ...typography.labelSm,
    color: colors.goldDark,
  },
});
