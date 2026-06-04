import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { GuideCard } from '../../components/ui/GuideCard';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BookingStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, typography } from '../../theme';
import { formatDateLabel } from '../../utils/date';

type Props = NativeStackScreenProps<BookingStackParamList, 'PendingHome'>;

const lockedCards = ['Circle Matching', 'Community', 'Events', 'Messaging'];

export function PendingHomeScreen({ navigation }: Props) {
  const booking = useAuthStore((state) => state.confirmedBooking);

  if (!booking) {
    return (
      <View style={styles.screen}>
        <Text style={styles.headline}>Alignment Conversation Scheduled</Text>
        <Text style={styles.subtitle}>Book your conversation to unlock the next phase.</Text>
        <Button onPress={() => navigation.navigate('ChooseSlot')} title="Choose a Slot" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader onBack={() => navigation.goBack()} stepLabel="Step 1 of 5" />
      <View style={styles.content}>
        <View style={styles.copy}>
          <Text style={styles.headline}>Alignment Conversation Scheduled</Text>
          <Text style={styles.subtitle}>
            Your Alignment Conversation is scheduled. Full community access will open after your
            conversation is complete.
          </Text>
        </View>

        <Card style={styles.bookingCard}>
          <GuideCard guide={booking.guide} />
          <Text style={styles.bookingDetail}>{formatDateLabel(booking.slot.date)}</Text>
          <Text style={styles.bookingDetail}>{booking.slot.time}</Text>
          <View style={styles.cardButtons}>
            <Button onPress={() => navigation.navigate('BookingConfirmed')} title="View Booking" />
            <Button onPress={() => navigation.navigate('ChooseSlot')} title="Reschedule" variant="outlined" />
          </View>
        </Card>

        <View style={styles.previewSection}>
          <View style={styles.previewHeader}>
            <Ionicons color={colors.goldDark} name="lock-closed-outline" size={18} />
            <Text style={styles.sectionTitle}>UPCOMING FOR YOU</Text>
          </View>
          <View style={styles.grid}>
            {lockedCards.map((item) => (
              <View key={item} style={styles.lockedCard}>
                <Ionicons color={colors.outline} name="lock-closed" size={20} />
                <Text style={styles.lockedText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.progressFooter}>
        <Text style={styles.progressLabel}>PROFILE COMPLETION: 20%</Text>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
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
  bookingCard: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  bookingDetail: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  cardButtons: {
    gap: spacing.sm,
  },
  previewSection: {
    gap: spacing.md,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.labelMd,
    color: colors.primaryDark,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  lockedCard: {
    width: '48%',
    minHeight: 104,
    borderRadius: 24,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    opacity: 0.75,
  },
  lockedText: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  progressFooter: {
    gap: spacing.sm,
  },
  progressLabel: {
    ...typography.labelSm,
    color: colors.primaryDark,
  },
  progressTrack: {
    height: 4,
    borderRadius: 99,
    backgroundColor: colors.outlineVariant,
    overflow: 'hidden',
  },
  progressFill: {
    width: '20%',
    height: '100%',
    backgroundColor: colors.gold,
  },
});
