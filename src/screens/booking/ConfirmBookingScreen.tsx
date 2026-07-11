import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenLayout } from '../../components/layout';
import { BookingSummary } from '../../components/ui/BookingSummary';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { CONFIRMATION_FEE } from '../../constants/fees';
import { BookingStackParamList } from '../../navigation/types';
import { supabase } from '../../config/supabase';
import { EMAIL_TRIGGERS_ENABLED } from '../../services/memberEmailService';
import { bookSlot } from '../../services/slotService';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, typography } from '../../theme';
import { confirmDialog, showErrorDialog, showInfoDialog } from '../../utils/dialogs';
import {
  addMinutesToTime,
  formatDateForEmail,
  formatSlotDate,
  formatSlotTime,
  formatTimeForEmail,
  timeTo24Hour,
} from '../../utils/date';

type Props = NativeStackScreenProps<BookingStackParamList, 'ConfirmBooking'>;

function buildGoogleCalendarUrl(params: {
  guideName: string;
  slotDate: string;
  slotTime: string;
  durationMinutes: number;
}): string {
  const [year, month, day] = params.slotDate.split('-').map(Number);
  const { hours, minutes } = timeTo24Hour(formatSlotTime(params.slotTime));
  const start = new Date(year, month - 1, day, hours, minutes);
  const end = new Date(start.getTime() + params.durationMinutes * 60 * 1000);
  const fmt = (date: Date) => date.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';

  const qs = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Alignment Conversation with ${params.guideName}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: 'Your Authentic CDC Alignment Conversation.',
    location: 'Virtual',
  });

  return `https://calendar.google.com/calendar/render?${qs.toString()}`;
}

export function ConfirmBookingScreen({ navigation }: Props) {
  const selection = useAuthStore((state) => state.bookingSelection);
  const confirmBooking = useAuthStore((state) => state.confirmBooking);
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!selection) {
      showInfoDialog(
        'No time selected',
        'Choose an Alignment Conversation time before confirming your place.',
      );
      navigation.navigate('ChooseSlot');
      return;
    }

    const formattedDate = formatSlotDate(selection.slot.date);
    const formattedTime = formatSlotTime(selection.slot.time);

    const confirmed = await confirmDialog({
      title: 'Confirm Booking',
      message: `Book your Alignment Conversation with ${selection.guide.name} on ${formattedDate} at ${formattedTime}?`,
      confirmText: 'Confirm',
      cancelText: 'Go Back',
    });

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const { bookingId, meetingLink, startsAt } = await bookSlot(selection.slot.id);

      confirmBooking({
        ...selection,
        bookingId,
        slotId: selection.slot.id,
        meetingLink,
        startsAt,
        endTime: addMinutesToTime(selection.slot.time, selection.slot.durationMinutes),
        status: 'confirmed',
      });

      const fireConfirmationEmail = async () => {
        if (!EMAIL_TRIGGERS_ENABLED) {
          return;
        }

        try {
          await supabase.functions.invoke('send-booking-confirmation', {
            body: {
              bookingId,
              userEmail: user?.email ?? '',
              userFirstName:
                user?.displayName?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there',
              guideName: selection.guide.name,
              guideTitle: selection.guide.title || 'Community Guide',
              slotDate: formatDateForEmail(selection.slot.date),
              slotTime: formatTimeForEmail(selection.slot.time),
              durationMinutes: selection.slot.durationMinutes ?? 30,
              calendarUrl: buildGoogleCalendarUrl({
                guideName: selection.guide.name,
                slotDate: selection.slot.date,
                slotTime: selection.slot.time,
                durationMinutes: selection.slot.durationMinutes ?? 30,
              }),
            },
          });
        } catch (error) {
          console.warn('[Email] Booking confirmation failed:', error);
        }
      };
      void fireConfirmationEmail();

      navigation.navigate('BookingConfirmed');
    } catch (error) {
      console.error('Booking confirmation failed:', error);
      showErrorDialog(
        'Could not confirm your booking',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (!selection) {
    return (
      <ScreenLayout>
        <Text style={styles.headline}>Confirm Your Place</Text>
        <Text style={styles.subtitle}>
          Choose an Alignment Conversation time first so we can confirm your place.
        </Text>
        <Button onPress={() => navigation.navigate('ChooseSlot')} title="Choose a Time" />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      footer={
        <>
          <Button
            onPress={() => navigation.navigate('ChooseSlot')}
            title="Change Time"
            variant="outlined"
          />
          <Button loading={loading} onPress={() => void handlePay()} title="Confirm Booking" />
        </>
      }
      header={
        <ScreenHeader
          onBack={() => navigation.goBack()}
          progress={0.75}
          stepLabel="Confirm Your Place"
        />
      }
    >
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
          <Text style={styles.footer}>Payment collection is still pending and will be connected later.</Text>
        </Card>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
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
