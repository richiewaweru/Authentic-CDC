import React, { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenLayout } from '../../components/layout';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { AuthStackParamList } from '../../navigation/types';
import { authService } from '../../services/authService';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Auth'>;

export function AuthScreen({ navigation, route }: Props) {
  const [loadingMethod, setLoadingMethod] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const mode = route.params?.mode ?? 'join';
  const showAppleSignIn = Platform.OS === 'ios';

  const runSocialAuth = async (method: 'apple' | 'google') => {
    try {
      setLoadingMethod(method);
      const session =
        method === 'apple'
          ? await authService.signInWithApple()
          : await authService.signInWithGoogle();

      if (!session) {
        return;
      }
    } catch (error) {
      console.error(`Authentication with ${method} failed:`, error);
      Alert.alert('Could not continue', 'We could not sign you in. Please try again.');
    } finally {
      setLoadingMethod(null);
    }
  };

  const submitEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing details', 'Enter both an email address and password to continue.');
      return;
    }

    try {
      setLoadingMethod('email-submit');
      const result =
        mode === 'signIn'
          ? await authService.signInWithEmail(email.trim(), password)
          : await authService.signUpWithEmail(email.trim(), password);

      if (result.needsEmailConfirmation) {
        Alert.alert(
          'Check your inbox',
          'We sent a confirmation link to your email. After confirming, come back here and tap Sign In.',
          [
            {
              text: 'OK',
              onPress: () => {
                setEmail('');
                setPassword('');
                navigation.replace('Auth', { mode: 'signIn' });
              },
            },
          ],
        );
        return;
      } else if (!result.session) {
        Alert.alert(
          'Still finishing sign-in',
          'Your sign-in is still finishing. If the app does not continue, please try again.',
        );
      }
    } catch (error) {
      console.error('Email authentication failed:', error);
      Alert.alert(
        mode === 'signIn' ? 'Could not sign you in' : 'Could not create your account',
        'Please try again.',
      );
    } finally {
      setLoadingMethod(null);
    }
  };

  return (
    <ScreenLayout
      footer={
        <Text style={styles.footer}>
          BY CONTINUING, YOU AGREE TO OUR TERMS OF SERVICE & PRIVACY POLICY
        </Text>
      }
      header={<ScreenHeader onBack={() => navigation.goBack()} stepLabel="Account Setup" />}
    >
      <View style={styles.content}>
        <View style={styles.logoWrap}>
          <Image
            accessibilityLabel="Authentic logo"
            resizeMode="contain"
            source={require('../../../assets/authentic_logo.png')}
            style={styles.logoSmall}
          />
        </View>

        <View style={styles.copy}>
          <Text style={styles.headline}>{mode === 'signIn' ? 'Welcome Back' : 'Join Authentic'}</Text>
          <Text style={styles.subtitle}>
            {mode === 'signIn'
              ? 'Sign in to continue your Alignment Profile.'
              : 'Create your account to begin your Alignment Profile.'}
          </Text>
        </View>

        <View style={styles.actions}>
          {showAppleSignIn ? (
            <Button
              iconLeft={<Ionicons color={colors.primary} name="logo-apple" size={18} />}
              loading={loadingMethod === 'apple'}
              onPress={() => void runSocialAuth('apple')}
              title="Continue with Apple"
              variant="secondary"
            />
          ) : null}
          <Button
            iconLeft={<Ionicons color={colors.primary} name="logo-google" size={18} />}
            loading={loadingMethod === 'google'}
            onPress={() => void runSocialAuth('google')}
            title="Continue with Google"
            variant="secondary"
          />
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>
          <Button
            loading={loadingMethod === 'email'}
            onPress={() => setShowEmailForm((current) => !current)}
            title="Continue with Email"
          />
          {showEmailForm ? (
            <View style={styles.emailForm}>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor={colors.outline}
                style={styles.input}
                value={email}
              />
              <TextInput
                autoCapitalize="none"
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={colors.outline}
                secureTextEntry
                style={styles.input}
                value={password}
              />
              <Button
                loading={loadingMethod === 'email-submit'}
                onPress={() => void submitEmailAuth()}
                title={mode === 'signIn' ? 'Sign In with Email' : 'Create Account with Email'}
              />
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={() =>
            navigation.replace('Auth', {
              mode: mode === 'signIn' ? 'join' : 'signIn',
            })
          }
        >
          <Text style={styles.linkText}>
            {mode === 'signIn' ? 'Need an account? ' : 'Already have an account? '}
            <Text style={styles.linkBold}>{mode === 'signIn' ? 'Join the Community' : 'Sign In'}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
  },
  logoWrap: {
    alignItems: 'center',
  },
  logoSmall: {
    width: 92,
    height: 92,
    alignSelf: 'center',
  },
  copy: {
    gap: spacing.sm,
    alignItems: 'center',
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
  actions: {
    gap: spacing.md,
  },
  emailForm: {
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.sand,
  },
  input: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandDark,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    color: colors.onSurface,
    ...typography.bodyMd,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.outlineVariant,
  },
  dividerText: {
    ...typography.labelSm,
    color: colors.outline,
  },
  linkText: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  linkBold: {
    color: colors.primaryDark,
    fontFamily: 'Inter_600SemiBold',
  },
  footer: {
    ...typography.labelSm,
    color: colors.outline,
    textAlign: 'center',
  },
});
