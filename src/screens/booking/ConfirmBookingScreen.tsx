import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BookingSummary } from '../../components/ui/BookingSummary';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { confirmMockPayment } from '../../mocks/payment';
import { BookingStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<BookingStackParamList, 'ConfirmBooking'>;

export function ConfirmBookingScreen({ navigation }: Props) {
  const selection = useAuthStore((state) => state.bookingSelection);
  const confirmBooking = useAuthStore((state) => state.confirmBooking);
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!selection) {
      Alert.alert('No booking selected', 'Choose a slot before confirming.');
      navigation.navigate('ChooseSlot');
      return;
    }

    setLoading(true);

    try {
      const booking = await confirmMockPayment(selection);
      confirmBooking(booking);
      navigation.navigate('BookingConfirmed');
    } catch (error) {
      Alert.alert('Payment could not be completed', 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!selection) {
    return (
      <View style={styles.screen}>
        <Text style={styles.headline}>Confirm Your Alignment Conversation</Text>
        <Text style={styles.subtitle}>Choose a time first so we can confirm your booking.</Text>
        <Button onPress={() => navigation.navigate('ChooseSlot')} title="Choose a Slot" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader onBack={() => navigation.goBack()} progress={0.2} stepLabel="STEP 1 OF 5" />
      <View style={styles.content}>
        <View style={styles.copy}>
          <Text style={styles.headline}>Confirm Your Alignment Conversation</Text>
          <Text style={styles.subtitle}>
            A $10 Alignment Conversation fee helps us reserve guide time, reduce no-shows, and keep
            the community intentional.
          </Text>
        </View>

        <BookingSummary booking={selection} />

        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>PAYMENT SUMMARY</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Alignment Conversation Fee</Text>
            <Text style={styles.rowValue}>$10.00</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total Due</Text>
            <Text style={styles.totalLabel}>$10.00</Text>
          </View>
          <Text style={styles.footer}>Secure checkout powered by Stripe</Text>
        </Card>
      </View>

      <Button loading={loading} onPress={() => void handlePay()} title="Pay & Confirm Booking ->" />
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
  summaryCard: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.labelMd,
    color: colors.primaryDark,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  rowValue: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  totalLabel: {
    ...typography.bodyMd,
    color: colors.primaryDark,
    fontFamily: 'Inter_600SemiBold',
  },
  footer: {
    ...typography.bodySm,
    color: colors.outline,
  },
});
