import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { ScreenLayout } from '../../components/layout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { GuideCard } from '../../components/ui/GuideCard';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BookingStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, typography } from '../../theme';
import { formatDateLabel } from '../../utils/date';
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
  const rescheduleBooking = useAuthStore((state) => state.rescheduleBooking);
  const signOut = useAuthStore((state) => state.signOut);
  const [rescheduling, setRescheduling] = React.useState(false);

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

  if (!booking) {
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
          <Text style={styles.headline}>Your Alignment Conversation is Scheduled</Text>
          <Text style={styles.subtitle}>
            Your Confirmation Fee has been received. Your full Community Access will open after
            your Alignment Conversation and profile review are complete.
          </Text>
        </View>

        <Card style={styles.bookingCard}>
          <GuideCard guide={booking.guide} />
          <Text style={styles.bookingDetail}>{formatDateLabel(booking.slot.date)}</Text>
          <Text style={styles.bookingDetail}>{booking.slot.time}</Text>
          <View style={styles.cardButtons}>
            <Button onPress={() => navigation.navigate('BookingConfirmed')} title="View Details" />
            <Button
              loading={rescheduling}
              onPress={() => void handleReschedule()}
              title="Change Time"
              variant="outlined"
            />
          </View>
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
  bookingDetail: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  cardButtons: {
    gap: spacing.sm,
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
