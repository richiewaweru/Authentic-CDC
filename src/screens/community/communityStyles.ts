import { StyleSheet } from 'react-native';

import { colors, spacing, typography } from '../../theme';

export const communityStyles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.goldDark,
  },
  headline: {
    ...typography.headlineLg,
    color: colors.primaryDark,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.bodyMd,
    color: colors.primaryDark,
    fontFamily: 'Inter_600SemiBold',
  },
  cardTitle: {
    ...typography.bodyMd,
    color: colors.primaryDark,
    fontFamily: 'Inter_600SemiBold',
    flexShrink: 1,
  },
  cardBody: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    flexShrink: 1,
  },
  paddedCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  emptyCard: {
    padding: spacing.lg,
    gap: spacing.sm,
    minHeight: 96,
    justifyContent: 'center',
  },
  error: {
    ...typography.bodySm,
    color: colors.error,
  },
});
