import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BookingSummary } from '../../components/ui/BookingSummary';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { CONFIRMATION_FEE } from '../../constants/fees';
import { confirmMockPayment } from '../../mocks/payment';
import { BookingStackParamList } from '../../navigation/types';
import { bookSlot } from '../../services/slotService';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<BookingStackParamList, 'ConfirmBooking'>;

export function ConfirmBookingScreen({ navigation }: Props) {
  const selection = useAuthStore((state) => state.bookingSelection);
  const confirmBooking = useAuthStore((state) => state.confirmBooking);
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!selection) {
      Alert.alert(
        'No time selected',
        'Choose an Alignment Conversation time before confirming your place.',
      );
      navigation.navigate('ChooseSlot');
      return;
    }

    setLoading(true);

    try {
      // TODO: Replace the mock confirmation call with the real payment provider flow.
      const booking = await confirmMockPayment(selection);
      await bookSlot(selection.slot.id);
      confirmBooking(booking);
      navigation.navigate('BookingConfirmed');
    } catch (error) {
      console.error('Confirmation Fee processing failed:', error);
      Alert.alert('Confirmation Fee could not be processed', 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!selection) {
    return (
      <View style={styles.screen}>
        <Text style={styles.headline}>Confirm Your Place</Text>
        <Text style={styles.subtitle}>
          Choose an Alignment Conversation time first so we can confirm your place.
        </Text>
        <Button onPress={() => navigation.navigate('ChooseSlot')} title="Choose a Time" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader
        onBack={() => navigation.goBack()}
        progress={0.75}
        stepLabel="Confirm Your Place"
      />
      <View style={styles.content}>
        <View style={styles.copy}>
          <Text style={styles.headline}>Confirm Your Place</Text>
          <Text style={styles.subtitle}>{CONFIRMATION_FEE.description}</Text>
        </View>

        <BookingSummary booking={selection} />

        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>CONFIRMATION SUMMARY</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Confirmation Fee</Text>
            <Text style={styles.rowValue}>{CONFIRMATION_FEE.label}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total Due</Text>
            <Text style={styles.totalLabel}>{CONFIRMATION_FEE.label}</Text>
          </View>
          <Text style={styles.footer}>Secure checkout powered by Stripe</Text>
        </Card>
      </View>

      <View style={styles.footerActions}>
        <Button
          onPress={() => navigation.navigate('ChooseSlot')}
          title="Change Time"
          variant="outlined"
        />
        <Button loading={loading} onPress={() => void handlePay()} title="Pay Confirmation Fee" />
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
  footerActions: {
    gap: spacing.md,
  },
});
