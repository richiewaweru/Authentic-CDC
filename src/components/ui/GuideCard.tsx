import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Guide } from '../../types/booking';
import { colors, radii, spacing, typography } from '../../theme';
import { Card } from './Card';

interface GuideCardProps {
  guide: Guide;
  selected?: boolean;
}

export function GuideCard({ guide, selected = false }: GuideCardProps) {
  return (
    <Card style={[styles.card, selected && styles.selectedCard]}>
      {guide.avatarUrl ? (
        <Image
          accessibilityLabel={`${guide.name} photo`}
          source={{ uri: guide.avatarUrl }}
          style={styles.avatarImage}
        />
      ) : (
        <View style={styles.avatar}>
          <Text style={styles.initials}>{guide.initials}</Text>
        </View>
      )}
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
  selectedCard: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
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
