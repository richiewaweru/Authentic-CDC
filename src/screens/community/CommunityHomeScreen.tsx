import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenLayout } from '../../components/layout';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, typography } from '../../theme';

export function CommunityHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const firstName = user?.displayName?.split(' ')[0] ?? 'friend';

  return (
    <ScreenLayout>
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>COMMUNITY MEMBER</Text>
        </View>

        <Text style={styles.headline}>Welcome to the community, {firstName}.</Text>

        <Text style={styles.body}>
          Your Alignment Conversation is complete and you have been granted access to the
          Authentic CDC community. This is where authentic connections begin.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What&apos;s next</Text>
          <Text style={styles.cardBody}>
            The community experience is being built with care and intention. You will be among the
            first to experience it. We will notify you as new features become available.
          </Text>
        </View>

        <Text style={styles.footer}>Thank you for being part of something authentic.</Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.lg,
    alignItems: 'center',
  },
  badge: {
    backgroundColor: colors.goldLight,
    borderRadius: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  badgeText: {
    ...typography.labelSm,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.goldDark,
  },
  headline: {
    ...typography.headlineLg,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  body: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.lg,
    width: '100%',
    gap: spacing.sm,
  },
  cardTitle: {
    ...typography.labelMd,
    color: colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardBody: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
  footer: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
