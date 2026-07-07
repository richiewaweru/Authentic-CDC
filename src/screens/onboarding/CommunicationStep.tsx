import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EntranceSection } from '../../components/ui/EntranceSection';
import { SingleSelect } from '../../components/ui/SingleSelect';
import { SymbolicIcon } from '../../components/ui/SymbolicIcon';
import { OnboardingData } from '../../types/onboarding';
import { colors, spacing, typography } from '../../theme';
import { communicationStyles, conflictStyles } from './options';

interface CommunicationStepProps {
  data: OnboardingData;
  updateData: (payload: Partial<OnboardingData>) => void;
  validationMessage?: string | null;
}

export function CommunicationStep({
  data,
  updateData,
  validationMessage,
}: CommunicationStepProps) {
  return (
    <View style={styles.wrapper}>
      <EntranceSection delay={0}>
        <Text style={styles.headline}>Communication & Growth</Text>
        <Text style={styles.subtitle}>
          Healthy connection grows through honesty, patience, and self-awareness.
        </Text>
      </EntranceSection>
      <EntranceSection delay={60}>
        <SymbolicIcon name="message-circle" />
      </EntranceSection>
      {validationMessage ? <Text style={styles.validation}>{validationMessage}</Text> : null}
      <EntranceSection delay={120} style={styles.section}>
        <Text style={styles.label}>HOW WOULD YOU DESCRIBE YOUR COMMUNICATION STYLE?</Text>
        <SingleSelect
          onSelect={(value) => updateData({ communicationStyle: value })}
          options={communicationStyles}
          selectedValue={data.communicationStyle}
        />
      </EntranceSection>
      <EntranceSection delay={180} style={styles.section}>
        <Text style={styles.label}>HOW DO YOU TYPICALLY HANDLE CONFLICT?</Text>
        <SingleSelect
          onSelect={(value) => updateData({ conflictStyle: value })}
          options={conflictStyles}
          selectedValue={data.conflictStyle}
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
