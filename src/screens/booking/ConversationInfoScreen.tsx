import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BookingStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<BookingStackParamList, 'ConversationInfo'>;

export function ConversationInfoScreen({ navigation }: Props) {
  return (
    <View style={styles.screen}>
      <ScreenHeader
        onBack={() => navigation.goBack()}
        progress={0.35}
        stepLabel="Alignment Conversation"
      />
      <View style={styles.content}>
        <View style={styles.copy}>
          <Text style={styles.headline}>Alignment Conversation</Text>
          <Text style={styles.subtitle}>
            To help build a safe and aligned community, every member begins with an Alignment
            Conversation.
          </Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Schedule Your Alignment Conversation</Text>
          <Text style={styles.cardText}>
            Choose a 15-minute video call with a community guide to verify your church alignment
            and relationship intentions.
          </Text>
        </Card>

        <View style={styles.expectations}>
          <Text style={styles.sectionTitle}>What to Expect</Text>
          {[
            '15-minute video conversation',
            'Verification of church affiliation',
            'Q&A about Community Access values',
            'Review of relationship intentions',
          ].map((item) => (
            <View key={item} style={styles.expectationRow}>
              <Ionicons color={colors.goldDark} name="checkmark-circle-outline" size={18} />
              <Text style={styles.expectationText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <Button onPress={() => navigation.navigate('ChooseSlot')} title="Continue to Times" />
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
  copy: {
    gap: spacing.sm,
  },
  headline: {
    ...typography.headlineLg,
    color: colors.primaryDark,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  card: {
    padding: spacing.xl,
    gap: spacing.sm,
  },
  cardTitle: {
    ...typography.headlineMd,
    color: colors.primaryDark,
  },
  cardText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  expectations: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.labelMd,
    color: colors.primaryDark,
  },
  expectationRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  expectationText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    flex: 1,
  },
});
