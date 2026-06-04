import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SingleSelect } from '../../components/ui/SingleSelect';
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
      <Text style={styles.headline}>Faith Foundation</Text>
      <Text style={styles.subtitle}>
        Faith is central to how we understand alignment, community, and commitment.
      </Text>
      {validationMessage ? <Text style={styles.validation}>{validationMessage}</Text> : null}
      <View style={styles.section}>
        <Text style={styles.label}>HOW IMPORTANT IS SHARED CHRISTIAN FAITH TO YOU?</Text>
        <SingleSelect
          onSelect={(value) => updateData({ sharedFaith: value })}
          options={sharedFaithOptions}
          selectedValue={data.sharedFaith}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>HOW INVOLVED ARE YOU IN CHURCH COMMUNITY?</Text>
        <SingleSelect
          onSelect={(value) => updateData({ churchInvolvement: value })}
          options={churchInvolvementOptions}
          selectedValue={data.churchInvolvement}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>FAITH SHOULD GUIDE A RELATIONSHIP BY...</Text>
        <TextArea
          onChangeText={(value) => updateData({ faithRole: value })}
          placeholder="Share your thoughts..."
          starterTags={faithStarterTags}
          value={data.faithRole}
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
});
