import React from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { ScreenLayout } from '../../components/layout';
import { BookingSummary } from '../../components/ui/BookingSummary';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BookingStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, typography } from '../../theme';
import { timeTo24Hour } from '../../utils/date';

type Props = NativeStackScreenProps<BookingStackParamList, 'BookingConfirmed'>;

function buildGoogleCalendarUrl(params: {
  guideName: string;
  slotDate: string;
  slotTime: string;
  durationMinutes: number;
}): string {
  const [year, month, day] = params.slotDate.split('-').map(Number);
  const { hours, minutes } = timeTo24Hour(params.slotTime);
  const start = new Date(year, month - 1, day, hours, minutes);
  const end = new Date(start.getTime() + params.durationMinutes * 60 * 1000);
  const fmt = (date: Date) => date.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';

  const qs = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Alignment Conversation with ${params.guideName}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details:
      'Your Authentic CDC Alignment Conversation. Your guide will share the meeting link before your scheduled time.',
    location: 'Virtual',
  });

  return `https://calendar.google.com/calendar/render?${qs.toString()}`;
}

export function BookingConfirmedScreen({ navigation }: Props) {
  const confirmedBooking = useAuthStore((state) => state.confirmedBooking);

  if (!confirmedBooking) {
    return (
      <ScreenLayout>
        <Text style={styles.headline}>Your Alignment Conversation is Confirmed</Text>
        <Text style={styles.subtitle}>
          Your Alignment Conversation details will appear here once confirmed.
        </Text>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      footer={
        <>
          <Button
            onPress={async () => {
              if (!confirmedBooking) {
                return;
              }

              const url = buildGoogleCalendarUrl({
                guideName: confirmedBooking.guide.name,
                slotDate: confirmedBooking.slot.date,
                slotTime: confirmedBooking.slot.time,
                durationMinutes: confirmedBooking.slot.durationMinutes ?? 30,
              });

              try {
                const supported = await Linking.canOpenURL(url);
                if (supported) {
                  await Linking.openURL(url);
                } else {
                  Alert.alert('Cannot open calendar', 'Please add the event to your calendar manually.');
                }
              } catch {
                Alert.alert('Cannot open calendar', 'Please add the event to your calendar manually.');
              }
            }}
            title="Add to Google Calendar"
            variant="outlined"
          />
          <Button onPress={() => navigation.navigate('PendingHome')} title="Go to Pending Access" />
        </>
      }
      header={
        <ScreenHeader
          onBack={() => navigation.goBack()}
          progress={1}
          stepLabel="Booking Confirmed"
        />
      }
    >
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.checkCircle}>
            <Ionicons color={colors.goldDark} name="checkmark" size={26} />
          </View>
          <Text style={styles.headline}>Your Alignment Conversation is Confirmed</Text>
          <Text style={styles.subtitle}>
            We are looking forward to your Alignment Conversation.
          </Text>
        </View>

        <BookingSummary booking={confirmedBooking} />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: 24,
    backgroundColor: colors.surfaceLow,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
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
});
