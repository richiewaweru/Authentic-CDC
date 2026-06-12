import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { ScreenLayout } from '../../components/layout';
import { BookingSummary } from '../../components/ui/BookingSummary';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BookingStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, typography } from '../../theme';
import { showInfoDialog } from '../../utils/dialogs';

type Props = NativeStackScreenProps<BookingStackParamList, 'BookingConfirmed'>;

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
            onPress={() => showInfoDialog('Calendar support', 'Calendar export will be connected later.')}
            title="Add to Calendar"
            variant="outlined"
          />
          <TouchableOpacity
            accessibilityLabel="Connect Google Calendar to sync automatically"
            accessibilityRole="button"
            activeOpacity={0.8}
            onPress={() =>
              showInfoDialog('Google Calendar sync', 'Google Calendar sync will be available soon.')
            }
          >
            <Text style={styles.link}>Or connect Google Calendar to sync automatically</Text>
          </TouchableOpacity>
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
  link: {
    ...typography.bodySm,
    color: colors.primary,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
