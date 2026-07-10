import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../../components/ui/Button';
import type { AuthStackParamList } from '../../navigation/types';
import { authService } from '../../services/authService';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'CheckYourEmail'>;

const RESEND_COOLDOWN_SECONDS = 30;

function isRateLimitError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.toLowerCase().includes('rate') || message.toLowerCase().includes('wait');
}

export function CheckYourEmailScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const [loading, setLoading] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);
  const [message, setMessage] = React.useState<string | null>(null);
  const [messageTone, setMessageTone] = React.useState<'success' | 'error'>('success');

  React.useEffect(() => {
    if (cooldown <= 0) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setCooldown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  const resendConfirmation = async () => {
    try {
      setLoading(true);
      await authService.resendSignupConfirmation(email);
      setMessageTone('success');
      setMessage('Sent - check your inbox.');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      setMessageTone('error');
      setMessage(
        isRateLimitError(error)
          ? 'Please wait a moment before requesting another.'
          : 'We could not resend the confirmation email. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>Account confirmation</Text>
        <Text style={styles.heading}>Check your email</Text>
        <Text style={styles.body}>
          We sent a confirmation link to <Text style={styles.email}>{email}</Text>. Click the link to
          activate your account and continue to Authentic.
        </Text>
        <Text style={styles.secondary}>
          The email may take a minute to arrive. Check your spam folder if you do not see it.
        </Text>
        {message ? (
          <Text style={[styles.message, messageTone === 'error' && styles.errorMessage]}>
            {message}
          </Text>
        ) : null}
        <View style={styles.actions}>
          <Button
            disabled={cooldown > 0}
            loading={loading}
            onPress={() => void resendConfirmation()}
            title={
              cooldown > 0
                ? `Resend confirmation email (${cooldown})`
                : 'Resend confirmation email'
            }
          />
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => navigation.replace('Auth', { mode: 'join' })}
            style={styles.secondaryAction}
          >
            <Text style={styles.secondaryActionText}>Use a different email</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  content: {
    gap: spacing.md,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 520,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.gold,
    textAlign: 'center',
  },
  heading: {
    ...typography.headlineLg,
    color: colors.onPrimary,
    textAlign: 'center',
  },
  body: {
    ...typography.bodyMd,
    color: colors.onPrimary,
    textAlign: 'center',
  },
  email: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.goldLight,
  },
  secondary: {
    ...typography.bodySm,
    color: colors.sand,
    textAlign: 'center',
  },
  message: {
    ...typography.bodySm,
    color: colors.goldLight,
    textAlign: 'center',
  },
  errorMessage: {
    color: colors.roseGold,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  secondaryAction: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  secondaryActionText: {
    ...typography.button,
    color: colors.onPrimary,
    textDecorationLine: 'underline',
  },
});
