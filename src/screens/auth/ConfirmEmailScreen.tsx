import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { EmailOtpType } from '@supabase/supabase-js';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../../components/ui/Button';
import type { AuthStackParamList } from '../../navigation/types';
import { supabase } from '../../config/supabase';
import { authService } from '../../services/authService';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ConfirmEmail'>;
type Status = 'loading' | 'success' | 'error';

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'We could not confirm this email link. Please request a new confirmation email.';
}

export function ConfirmEmailScreen({ navigation, route }: Props) {
  const { token_hash: tokenHash, type, email } = route.params ?? {};
  const [status, setStatus] = React.useState<Status>('loading');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [resendMessage, setResendMessage] = React.useState<string | null>(null);
  const [resending, setResending] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    const confirmEmail = async () => {
      if (!tokenHash || !type) {
        setStatus('error');
        setErrorMessage('Invalid or missing confirmation link.');
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as EmailOtpType,
      });

      if (!mounted) {
        return;
      }

      if (error) {
        setStatus('error');
        setErrorMessage(error.message);
        return;
      }

      setStatus('success');
    };

    void confirmEmail();

    return () => {
      mounted = false;
    };
  }, [tokenHash, type]);

  const resendConfirmation = async () => {
    if (!email) {
      return;
    }

    try {
      setResending(true);
      setResendMessage(null);
      await authService.resendSignupConfirmation(email);
      setResendMessage('Sent - check your inbox.');
    } catch (error) {
      setResendMessage(getErrorMessage(error));
    } finally {
      setResending(false);
    }
  };

  const returnToSignIn = () => {
    navigation.replace('Auth', { mode: 'signIn' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {status === 'loading' ? (
          <>
            <ActivityIndicator color={colors.gold} size="large" />
            <Text style={styles.heading}>Confirming your email...</Text>
          </>
        ) : null}

        {status === 'success' ? (
          <>
            <Text style={styles.heading}>You're confirmed. Redirecting...</Text>
            <Text style={styles.body}>Taking you to Authentic.</Text>
          </>
        ) : null}

        {status === 'error' ? (
          <>
            <Text style={styles.heading}>We could not confirm this link</Text>
            <Text style={styles.body}>{errorMessage}</Text>
            {resendMessage ? <Text style={styles.resendMessage}>{resendMessage}</Text> : null}
            {email ? (
              <Button
                loading={resending}
                onPress={() => void resendConfirmation()}
                title="Request a new confirmation email"
              />
            ) : (
              <TouchableOpacity
                accessibilityRole="button"
                onPress={returnToSignIn}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>Return to sign in</Text>
              </TouchableOpacity>
            )}
          </>
        ) : null}
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
  heading: {
    ...typography.headlineLg,
    color: colors.onPrimary,
    textAlign: 'center',
  },
  body: {
    ...typography.bodyMd,
    color: colors.sand,
    textAlign: 'center',
  },
  resendMessage: {
    ...typography.bodySm,
    color: colors.goldLight,
    textAlign: 'center',
  },
  linkButton: {
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  linkText: {
    ...typography.button,
    color: colors.goldLight,
    textDecorationLine: 'underline',
  },
});
