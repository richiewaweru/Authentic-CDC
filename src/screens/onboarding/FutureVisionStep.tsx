import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EntranceSection } from '../../components/ui/EntranceSection';
import { MultiSelectPill } from '../../components/ui/MultiSelectPill';
import { SymbolicIcon } from '../../components/ui/SymbolicIcon';
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
      <EntranceSection delay={0}>
        <Text style={styles.headline}>Future Vision</Text>
        <Text style={styles.subtitle}>
          Reflect on the kind of relationship and life you hope to build.
        </Text>
      </EntranceSection>
      <EntranceSection delay={60}>
        <SymbolicIcon name="trending-up" />
      </EntranceSection>
      {validationMessage ? <Text style={styles.validation}>{validationMessage}</Text> : null}
      <EntranceSection delay={120} style={styles.section}>
        <Text style={styles.label}>IN THE FUTURE, I HOPE TO BUILD...</Text>
        <TextArea
          onChangeText={(value) => updateData({ futureHopes: value })}
          onFocus={() => setActiveField('futureHopes')}
          placeholder="Share your hopes for the future..."
          value={data.futureHopes}
        />
      </EntranceSection>
      <EntranceSection delay={180} style={styles.section}>
        <Text style={styles.label}>TO ME, AN AUTHENTIC RELATIONSHIP MEANS...</Text>
        <TextArea
          onChangeText={(value) => updateData({ authenticMeaning: value })}
          onFocus={() => setActiveField('authenticMeaning')}
          placeholder="Share what authenticity means to you..."
          value={data.authenticMeaning}
        />
      </EntranceSection>
      <EntranceSection delay={240} style={styles.section}>
        <Text style={styles.label}>OPTIONAL VALUE CHIPS</Text>
        <MultiSelectPill onToggle={appendChip} options={futureValueChips} selectedValues={[]} />
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
