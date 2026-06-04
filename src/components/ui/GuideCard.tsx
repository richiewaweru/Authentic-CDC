import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Guide } from '../../types/booking';
import { colors, radii, spacing, typography } from '../../theme';
import { Card } from './Card';

interface GuideCardProps {
  guide: Guide;
}

export function GuideCard({ guide }: GuideCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{guide.initials}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.name}>{guide.name}</Text>
        <Text style={styles.title}>{guide.title}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surfaceLow,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    ...typography.bodyMd,
    color: colors.onPrimary,
    fontFamily: 'Inter_600SemiBold',
  },
  copy: {
    gap: spacing.xs,
  },
  name: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontFamily: 'Inter_600SemiBold',
  },
  title: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
});
