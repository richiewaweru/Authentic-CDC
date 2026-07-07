import React from 'react';
import {
  Alert,
  Animated,
  Easing,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ScreenLayout } from '../../components/layout';
import { BookingSummary } from '../../components/ui/BookingSummary';
import { Button } from '../../components/ui/Button';
import { GradientHero } from '../../components/ui/GradientHero';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useReduceMotion } from '../../hooks/useReduceMotion';
import { BookingStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/authStore';
import { colors, motion, spacing, typography } from '../../theme';
import { timeTo24Hour } from '../../utils/date';

type Props = NativeStackScreenProps<BookingStackParamList, 'BookingConfirmed'>;

function buildGoogleCalendarUrl(params: {
  guideName: string;
  slotDate: string;
  slotTime: string;
  durationMinutes: number;
  startsAt?: string | null;
}): string {
  const start = params.startsAt
    ? new Date(params.startsAt)
    : (() => {
        const [year, month, day] = params.slotDate.split('-').map(Number);
        const { hours, minutes } = timeTo24Hour(params.slotTime);
        return new Date(year, month - 1, day, hours, minutes);
      })();
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
                startsAt: confirmedBooking.startsAt,
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
          currentStep={8}
          stepLabel="Booking Confirmed"
          totalSteps={9}
        />
      }
    >
      <View style={styles.content}>
        <GradientHero roseGlow style={styles.hero}>
          <Text style={styles.eyebrow}>Alignment Profile</Text>
          <ConfirmationMark />
          <Text style={styles.headline}>Your Alignment Conversation is Confirmed</Text>
          <Text style={styles.subtitle}>
            We are looking forward to your Alignment Conversation.
          </Text>
        </GradientHero>

        <BookingSummary booking={confirmedBooking} />
      </View>
    </ScreenLayout>
  );
}

function ConfirmationMark() {
  const shimmer = React.useRef(new Animated.Value(0)).current;
  const reduceMotion = useReduceMotion();

  React.useEffect(() => {
    if (reduceMotion) {
      shimmer.setValue(1);
      return;
    }

    const timeout = setTimeout(() => {
      Animated.timing(shimmer, {
        toValue: 1,
        duration: motion.duration.confirmationShimmer,
        easing: Easing.out(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [reduceMotion, shimmer]);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-72, 72],
  });

  return (
    <View style={styles.checkCircle}>
      <Ionicons color={colors.primaryDark} name="checkmark" size={48} />
      <Animated.View style={[styles.shimmer, { transform: [{ translateX }, { rotate: '18deg' }] }]}>
        <LinearGradient
          colors={['rgba(255,255,255,0)', colors.selectionGlowStrong, 'rgba(255,255,255,0)']}
          end={{ x: 1, y: 0 }}
          start={{ x: 0, y: 0 }}
          style={styles.shimmerFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.md,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: colors.gold,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 24,
    elevation: 5,
  },
  shimmer: {
    position: 'absolute',
    width: 36,
    height: 140,
  },
  shimmerFill: {
    flex: 1,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.gold,
    textAlign: 'center',
  },
  headline: {
    ...typography.headlineLg,
    color: colors.onPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.surface,
    textAlign: 'center',
  },
});
