import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BookingRecord, BookingSelection } from '../../types/booking';
import { colors, spacing, typography } from '../../theme';
import { formatDateLabel } from '../../utils/date';
import { Card } from './Card';
import { GuideCard } from './GuideCard';

interface BookingSummaryProps {
  booking: BookingSelection | BookingRecord;
  endTime?: string;
}

export function BookingSummary({ booking, endTime }: BookingSummaryProps) {
  const resolvedEndTime = 'endTime' in booking ? booking.endTime : endTime;

  return (
    <Card style={styles.card}>
      <GuideCard guide={booking.guide} />
      <View style={styles.row}>
        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>{formatDateLabel(booking.slot.date)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Time</Text>
        <Text style={styles.value}>
          {booking.slot.time}
          {resolvedEndTime ? ` - ${resolvedEndTime}` : ''}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Duration</Text>
        <Text style={styles.value}>{booking.slot.durationMinutes} minutes</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  label: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  value: {
    ...typography.bodySm,
    color: colors.onSurface,
    fontFamily: 'Inter_600SemiBold',
  },
});
