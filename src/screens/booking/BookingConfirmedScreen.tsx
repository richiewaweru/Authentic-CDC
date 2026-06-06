import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { BookingSummary } from '../../components/ui/BookingSummary';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BookingStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<BookingStackParamList, 'BookingConfirmed'>;

export function BookingConfirmedScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const confirmedBooking = useAuthStore((state) => state.confirmedBooking);

  if (!confirmedBooking) {
    return (
      <View style={[styles.screen, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
        <Text style={styles.headline}>Your Alignment Conversation is Confirmed</Text>
        <Text style={styles.subtitle}>
          Your Alignment Conversation details will appear here once confirmed.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
      <ScreenHeader
        onBack={() => navigation.goBack()}
        progress={1}
        stepLabel="Booking Confirmed"
      />
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

      <View style={styles.footer}>
        <Button
          onPress={() => Alert.alert('Calendar support', 'Calendar export will be connected later.')}
          title="Add to Calendar"
          variant="outlined"
        />
        <TouchableOpacity
          accessibilityLabel="Connect Google Calendar to sync automatically"
          accessibilityRole="button"
          activeOpacity={0.8}
          onPress={() =>
            Alert.alert('Google Calendar sync', 'Google Calendar sync will be available soon.')
          }
        >
          <Text style={styles.link}>Or connect Google Calendar to sync automatically</Text>
        </TouchableOpacity>
        <Button onPress={() => navigation.navigate('PendingHome')} title="Go to Pending Access" />
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
  footer: {
    gap: spacing.md,
  },
  link: {
    ...typography.bodySm,
    color: colors.primary,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
