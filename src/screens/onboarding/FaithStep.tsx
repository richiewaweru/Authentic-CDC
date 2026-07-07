import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EntranceSection } from '../../components/ui/EntranceSection';
import { SingleSelect } from '../../components/ui/SingleSelect';
import { SymbolicIcon } from '../../components/ui/SymbolicIcon';
import { TextArea } from '../../components/ui/TextArea';
import { OnboardingData } from '../../types/onboarding';
import { colors, spacing, typography } from '../../theme';
import { churchInvolvementOptions, faithStarterTags, sharedFaithOptions } from './options';

interface FaithStepProps {
  data: OnboardingData;
  updateData: (payload: Partial<OnboardingData>) => void;
  validationMessage?: string | null;
}

export function FaithStep({ data, updateData, validationMessage }: FaithStepProps) {
  return (
    <View style={styles.wrapper}>
      <EntranceSection delay={0}>
        <Text style={styles.headline}>Faith Foundation</Text>
        <Text style={styles.subtitle}>
          Faith is central to how we understand alignment, community, and commitment.
        </Text>
      </EntranceSection>
      <EntranceSection delay={60}>
        <SymbolicIcon name="book-open" />
      </EntranceSection>
      {validationMessage ? <Text style={styles.validation}>{validationMessage}</Text> : null}
      <EntranceSection delay={120} style={styles.section}>
        <Text style={styles.label}>HOW IMPORTANT IS SHARED CHRISTIAN FAITH TO YOU?</Text>
        <SingleSelect
          onSelect={(value) => updateData({ sharedFaith: value })}
          options={sharedFaithOptions}
          selectedValue={data.sharedFaith}
        />
      </EntranceSection>
      <EntranceSection delay={180} style={styles.section}>
        <Text style={styles.label}>HOW INVOLVED ARE YOU IN CHURCH COMMUNITY?</Text>
        <SingleSelect
          onSelect={(value) => updateData({ churchInvolvement: value })}
          options={churchInvolvementOptions}
          selectedValue={data.churchInvolvement}
        />
      </EntranceSection>
      <EntranceSection delay={240} style={styles.section}>
        <Text style={styles.label}>FAITH SHOULD GUIDE A RELATIONSHIP BY...</Text>
        <TextArea
          onChangeText={(value) => updateData({ faithRole: value })}
          placeholder="Share your thoughts..."
          starterTags={faithStarterTags}
          value={data.faithRole}
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
