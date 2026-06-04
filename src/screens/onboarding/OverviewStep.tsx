import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SectionCard } from '../../components/ui/SectionCard';
import { colors, spacing, typography } from '../../theme';
import { overviewSections } from './options';

export function OverviewStep() {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.headline}>Build your Alignment Profile</Text>
      <Text style={styles.subtitle}>
        A few guided steps help us understand your values, intentions, and community fit.
      </Text>
      <View style={styles.sections}>
        {overviewSections.map((section) => (
          <SectionCard
            iconName={section.iconName}
            key={section.title}
            subtitle={section.subtitle}
            title={section.title}
          />
        ))}
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
  sections: {
    gap: spacing.md,
  },
});
