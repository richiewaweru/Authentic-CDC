import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography } from '../../theme';
import { Card } from './Card';

interface SectionCardProps {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

export function SectionCard({ iconName, title, subtitle }: SectionCardProps) {
  return (
    <Card style={styles.card}>
      <Ionicons color={colors.goldDark} name={iconName} size={20} />
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontFamily: 'Inter_600SemiBold',
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
});
