import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { MultiSelectPill } from '../../components/ui/MultiSelectPill';
import { TextArea } from '../../components/ui/TextArea';
import { OnboardingData } from '../../types/onboarding';
import { colors, spacing, typography } from '../../theme';
import { futureValueChips } from './options';

interface FutureVisionStepProps {
  data: OnboardingData;
  updateData: (payload: Partial<OnboardingData>) => void;
  validationMessage?: string | null;
}

export function FutureVisionStep({
  data,
  updateData,
  validationMessage,
}: FutureVisionStepProps) {
  const [activeField, setActiveField] = useState<'futureHopes' | 'authenticMeaning'>('futureHopes');

  const appendChip = (value: string) => {
    const fieldValue = data[activeField].trim();
    const nextValue = fieldValue ? `${fieldValue} ${value}` : value;
    updateData({ [activeField]: nextValue } as Partial<OnboardingData>);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.headline}>Future Vision</Text>
      <Text style={styles.subtitle}>
        Reflect on the kind of relationship and life you hope to build.
      </Text>
      {validationMessage ? <Text style={styles.validation}>{validationMessage}</Text> : null}
      <View style={styles.section}>
        <Text style={styles.label}>IN THE FUTURE, I HOPE TO BUILD...</Text>
        <TextArea
          onChangeText={(value) => updateData({ futureHopes: value })}
          onFocus={() => setActiveField('futureHopes')}
          placeholder="Share your hopes for the future..."
          value={data.futureHopes}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>TO ME, AN AUTHENTIC RELATIONSHIP MEANS...</Text>
        <TextArea
          onChangeText={(value) => updateData({ authenticMeaning: value })}
          onFocus={() => setActiveField('authenticMeaning')}
          placeholder="Share what authenticity means to you..."
          value={data.authenticMeaning}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>OPTIONAL VALUE CHIPS</Text>
        <MultiSelectPill onToggle={appendChip} options={futureValueChips} selectedValues={[]} />
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
});
