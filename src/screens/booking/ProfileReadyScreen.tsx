import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BookingStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<BookingStackParamList, 'ProfileReady'>;

export function ProfileReadyScreen({ navigation }: Props) {
  return (
    <View style={styles.screen}>
      <ScreenHeader
        onBack={() => navigation.goBack()}
        progress={0.2}
        stepLabel="Profile Complete"
      />
      <View style={styles.content}>
        <Card style={styles.card}>
          <View style={styles.checkCircle}>
            <Ionicons color={colors.primary} name="checkmark" size={24} />
          </View>
          <Text style={styles.cardTitle}>Alignment Profile Complete</Text>
          <View style={styles.tags}>
            {['Integrity', 'Balance', 'Purpose'].map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.quote}>
            "Your responses help us prepare a thoughtful and intentional Alignment Conversation."
          </Text>
        </Card>

        <View style={styles.copy}>
          <Text style={styles.headline}>Your Alignment Profile is Ready</Text>
          <Text style={styles.subtitle}>
            The next step is a short Alignment Conversation so we can welcome you well.
          </Text>
        </View>

        <View style={styles.infoRows}>
          <View style={styles.infoRow}>
            <Ionicons color={colors.goldDark} name="sparkles-outline" size={18} />
            <Text style={styles.infoText}>Your Alignment Profile has been received.</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons color={colors.goldDark} name="shield-checkmark-outline" size={18} />
            <Text style={styles.infoText}>
              Next, choose a time for your Alignment Conversation.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          onPress={() => navigation.navigate('ConversationInfo')}
          title="Continue to Alignment Conversation"
        />
        <TouchableOpacity>
          <Text style={styles.link}>Review Alignment Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
  },
  content: {
    gap: spacing.xl,
  },
  card: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceLow,
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.successTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    ...typography.headlineMd,
    color: colors.primaryDark,
  },
  tags: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tag: {
    borderRadius: 999,
    backgroundColor: colors.goldLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tagText: {
    ...typography.bodySm,
    color: colors.goldDark,
  },
  quote: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  copy: {
    gap: spacing.sm,
  },
  headline: {
    ...typography.headlineLg,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  infoRows: {
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  infoText: {
    ...typography.bodySm,
    color: colors.onSurface,
    flex: 1,
  },
  footer: {
    gap: spacing.md,
  },
  link: {
    ...typography.bodySm,
    color: colors.primaryDark,
    textAlign: 'center',
  },
});
