import React from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { ScreenLayout } from '../../components/layout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { GuideCard } from '../../components/ui/GuideCard';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BookingStackParamList } from '../../navigation/types';
import { sendBookingCancellationEmail } from '../../services/memberEmailService';
import { releaseSlot } from '../../services/slotService';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, typography } from '../../theme';
import {
  formatDateForEmail,
  formatSlotDate,
  formatSlotTime,
  formatTimeForEmail,
} from '../../utils/date';
import { confirmDialog, showErrorDialog } from '../../utils/dialogs';

type Props = NativeStackScreenProps<BookingStackParamList, 'PendingHome'>;

const lockedCards = ['Home', 'Events', 'Foundations', 'Profile'];
const statusSteps = [
  { label: 'Account Created', state: 'complete' },
  { label: 'Alignment Profile Complete', state: 'complete' },
  { label: 'Confirmation Fee Received', state: 'complete' },
  { label: 'Alignment Conversation Scheduled', state: 'current' },
  { label: 'Pending Community Access', state: 'upcoming' },
] as const;

export function PendingHomeScreen({ navigation }: Props) {
  const booking = useAuthStore((state) => state.confirmedBooking);
  const user = useAuthStore((state) => state.user);
  const userState = useAuthStore((state) => state.userState);
  const rescheduleBooking = useAuthStore((state) => state.rescheduleBooking);
  const clearBooking = useAuthStore((state) => state.clearBooking);
  const signOut = useAuthStore((state) => state.signOut);
  const [rescheduling, setRescheduling] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);
  const firstName = user?.displayName?.split(' ')[0] ?? 'friend';
  const startsAt = booking?.startsAt ? new Date(booking.startsAt) : null;
  const hoursUntil = startsAt ? (startsAt.getTime() - Date.now()) / (1000 * 60 * 60) : null;
  const isUrgent = hoursUntil !== null && hoursUntil > 0 && hoursUntil <= 1;
  const isUpcoming = hoursUntil !== null && hoursUntil > 1 && hoursUntil <= 24;
  const isCompleted =
    userState === 'conversation_complete' ||
    userState === 'conversation_approved' ||
    booking?.status === 'completed';
  const gracedPast =
    startsAt instanceof Date && startsAt.getTime() < Date.now() - 2 * 60 * 60 * 1000;
  const isPastUnfinished = gracedPast && !isCompleted;

  const handleReschedule = async () => {
    const confirmed = await confirmDialog({
      title: 'Change time',
      message:
        'Your current time will be released and you can choose a new Alignment Conversation time.',
      confirmText: 'Change Time',
      cancelText: 'Keep current time',
    });

    if (!confirmed) {
      return;
    }

    setRescheduling(true);

    try {
      await rescheduleBooking();
      navigation.navigate('ChooseSlot');
    } catch (error) {
      console.error('Unable to reschedule Alignment Conversation:', error);
      showErrorDialog(
        'Could not change time',
        'We could not release your current time. Please try again.',
      );
    } finally {
      setRescheduling(false);
    }
  };

  const handleSignOut = async () => {
    const confirmed = await confirmDialog({
      title: 'Sign out',
      message: 'Are you sure you want to sign out of Authentic?',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
    });

    if (!confirmed) {
      return;
    }

    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
      showErrorDialog('Could not sign out', 'Please try again.');
    }
  };

  const handleCancelBooking = () => {
    if (!booking?.slotId) {
      return;
    }

    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel your Alignment Conversation? Your time slot will be released for others.',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setCancelling(true);
            void (async () => {
              try {
                const bookingSnapshot = {
                  userEmail: user?.email ?? '',
                  firstName:
                    user?.displayName?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there',
                  guideName: booking.guide.name,
                  slotDate: formatDateForEmail(booking.slot.date),
                  slotTime: formatTimeForEmail(booking.slot.time),
                };

                await releaseSlot(booking.slotId!);
                const emailPromise = sendBookingCancellationEmail(bookingSnapshot);

                if (emailPromise) {
                  void emailPromise.catch((err) => console.error('Cancellation email failed:', err));
                }

                clearBooking();
                navigation.navigate('ProfileReady');
              } catch (error) {
                Alert.alert(
                  'Error',
                  error instanceof Error ? error.message : 'Could not cancel. Try again.',
                );
              } finally {
                setCancelling(false);
              }
            })();
          },
        },
      ],
    );
  };

  const handlePastBookingRebook = () => {
    clearBooking();
    navigation.navigate('ChooseSlot');
  };

  if (!booking) {
    if (isCompleted) {
      return (
        <ScreenLayout
          footer={
            <TouchableOpacity
              accessibilityLabel="Sign out"
              accessibilityRole="button"
              onPress={() => void handleSignOut()}
              style={styles.signOutButton}
            >
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          }
          header={<ScreenHeader onBack={() => navigation.goBack()} />}
        >
          <View style={styles.content}>
            <View style={styles.copy}>
              <Text style={styles.pendingLabel}>Pending Access</Text>
              <Text style={styles.headline}>Your Alignment Conversation is Complete</Text>
              <Text style={styles.subtitle}>
                Thank you for taking the time, {firstName}. Your community guide is reviewing your
                conversation. You will receive community access soon.
              </Text>
            </View>
            <Card style={styles.bookingCard}>
              <View style={styles.completedCard}>
                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>COMPLETE</Text>
                </View>
                <Text style={styles.completedHeadline}>Your Alignment Conversation is Complete</Text>
                <Text style={styles.completedBody}>
                  Thank you for taking the time, {firstName}. Your community guide is reviewing
                  your conversation. You will receive community access soon — keep an eye on your
                  email for next steps.
                </Text>
              </View>
            </Card>
          </View>
        </ScreenLayout>
      );
    }

    return (
      <ScreenLayout
        footer={
          <>
            <Button onPress={() => navigation.navigate('ChooseSlot')} title="Choose a Time" />
            <TouchableOpacity
              accessibilityLabel="Sign out"
              accessibilityRole="button"
              onPress={() => void handleSignOut()}
              style={styles.signOutButton}
            >
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </>
        }
      >
        <Text style={styles.pendingLabel}>Pending Access</Text>
        <Text style={styles.headline}>Schedule Your Alignment Conversation</Text>
        <Text style={styles.subtitle}>
          Choose an Alignment Conversation time to continue toward Community Access.
        </Text>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      footer={
        <TouchableOpacity
          accessibilityLabel="Sign out"
          accessibilityRole="button"
          onPress={() => void handleSignOut()}
          style={styles.signOutButton}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      }
      header={<ScreenHeader onBack={() => navigation.goBack()} />}
    >
      <View style={styles.content}>
        <View style={styles.copy}>
          <Text style={styles.pendingLabel}>Pending Access</Text>
          <Text style={styles.headline}>
            {isCompleted
              ? 'Your Alignment Conversation is Complete'
              : 'Your Alignment Conversation is Scheduled'}
          </Text>
          <Text style={styles.subtitle}>
            {isCompleted
              ? `Thank you for taking the time, ${firstName}. Your community guide is reviewing your conversation. You will receive community access soon.`
              : 'Your Confirmation Fee has been received. Your full Community Access will open after your Alignment Conversation and profile review are complete.'}
          </Text>
        </View>

        {!isCompleted && isUrgent ? (
          <View style={styles.urgentBanner}>
            <Ionicons color={colors.goldDark} name="time-outline" size={18} />
            <Text style={styles.bannerText}>
              Your Alignment Conversation starts in less than an hour
            </Text>
          </View>
        ) : null}

        {!isCompleted && isUpcoming && !isUrgent ? (
          <View style={styles.reminderBanner}>
            <Ionicons color={colors.primary} name="calendar-outline" size={18} />
            <Text style={styles.bannerText}>Your Alignment Conversation is tomorrow</Text>
          </View>
        ) : null}

        <Card style={styles.bookingCard}>
          {isCompleted ? (
            <View style={styles.completedCard}>
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>COMPLETE</Text>
              </View>
              <Text style={styles.completedHeadline}>Your Alignment Conversation is Complete</Text>
              <Text style={styles.completedBody}>
                Thank you for taking the time, {firstName}. Your community guide is reviewing your
                conversation. You will receive community access soon — keep an eye on your email
                for next steps.
              </Text>
            </View>
          ) : isPastUnfinished ? (
            <View style={styles.pastBookingCard}>
              <Ionicons color={colors.goldDark} name="calendar-outline" size={24} />
              <Text style={styles.pastBookingHeadline}>Your conversation time has passed</Text>
              <Text style={styles.pastBookingBody}>
                Pick a new Alignment Conversation time to continue toward Community Access.
              </Text>
              <Button onPress={handlePastBookingRebook} title="Pick a New Time" />
            </View>
          ) : (
            <>
              <GuideCard guide={booking.guide} />
              <Text style={styles.bookingDetail}>{formatSlotDate(booking.slot.date)}</Text>
              <Text style={styles.bookingDetail}>{formatSlotTime(booking.slot.time)}</Text>
              <View style={styles.cardButtons}>
                <Button onPress={() => navigation.navigate('BookingConfirmed')} title="View Details" />
                <Button
                  loading={rescheduling}
                  onPress={() => void handleReschedule()}
                  title="Change Time"
                  variant="outlined"
                />
                <Button
                  loading={cancelling}
                  onPress={handleCancelBooking}
                  title="Cancel Booking"
                  variant="outlined"
                />
              </View>
              {booking.meetingLink ? (
                <Button
                  onPress={async () => {
                    try {
                      const supported = await Linking.canOpenURL(booking.meetingLink!);
                      if (supported) {
                        await Linking.openURL(booking.meetingLink!);
                      } else {
                        Alert.alert('Cannot open link', `Link: ${booking.meetingLink}`);
                      }
                    } catch {
                      Alert.alert('Cannot open link', `Link: ${booking.meetingLink}`);
                    }
                  }}
                  title="Join Conversation"
                />
              ) : (
                <Text style={styles.meetingLinkPending}>
                  Your guide will share the meeting link before your scheduled time.
                </Text>
              )}
            </>
          )}
        </Card>

        <View style={styles.statusTracker}>
          {statusSteps.map((step) => (
            <View key={step.label} style={styles.statusRow}>
              <Ionicons
                color={
                  step.state === 'complete'
                    ? colors.goldDark
                    : step.state === 'current'
                      ? colors.primary
                      : colors.outline
                }
                name={
                  step.state === 'complete'
                    ? 'checkmark-circle'
                    : step.state === 'current'
                      ? 'ellipse'
                      : 'ellipse-outline'
                }
                size={18}
              />
              <Text
                style={[
                  styles.statusText,
                  step.state === 'complete' && styles.statusTextComplete,
                  step.state === 'current' && styles.statusTextCurrent,
                ]}
              >
                {step.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.previewSection}>
          <View style={styles.previewHeader}>
            <Ionicons color={colors.goldDark} name="lock-closed-outline" size={18} />
            <Text style={styles.sectionTitle}>COMMUNITY ACCESS PREVIEW</Text>
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
  pendingLabel: {
    ...typography.labelSm,
    color: colors.goldDark,
    textTransform: 'uppercase',
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
  completedCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: 24,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
  },
  completedBadge: {
    backgroundColor: colors.successTint,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  completedBadgeText: {
    ...typography.labelSm,
    color: colors.primaryDark,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  completedHeadline: {
    ...typography.headlineMd,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  completedBody: {
    ...typography.bodyMd,
    color: colors.onSurface,
    textAlign: 'center',
  },
  pastBookingCard: {
    gap: spacing.md,
    alignItems: 'center',
  },
  pastBookingHeadline: {
    ...typography.headlineMd,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  pastBookingBody: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  urgentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.goldDark,
  },
  reminderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryContainer,
    borderRadius: 12,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  bannerText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    flex: 1,
  },
  bookingDetail: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  cardButtons: {
    gap: spacing.sm,
  },
  meetingLinkPending: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  statusTracker: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusText: {
    ...typography.bodySm,
    color: colors.outline,
  },
  statusTextComplete: {
    color: colors.goldDark,
  },
  statusTextCurrent: {
    color: colors.primaryDark,
    fontFamily: 'Inter_600SemiBold',
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
  signOutButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  signOutText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.error,
  },
});
