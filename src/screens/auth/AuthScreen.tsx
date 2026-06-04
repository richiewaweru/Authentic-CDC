import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { mockSignIn, mockSignUp } from '../../mocks/auth';
import { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Auth'>;

export function AuthScreen({ navigation, route }: Props) {
  const signInStore = useAuthStore((state) => state.signIn);
  const [loadingMethod, setLoadingMethod] = useState<string | null>(null);
  const mode = route.params?.mode ?? 'join';

  const runAuth = async (method: 'apple' | 'google' | 'email' | 'signin') => {
    try {
      setLoadingMethod(method);
      const user = method === 'signin' ? await mockSignIn() : await mockSignUp(method);
      signInStore(user);
    } catch (error) {
      Alert.alert('Something went wrong', 'Please try again.');
    } finally {
      setLoadingMethod(null);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader onBack={() => navigation.goBack()} stepLabel="Step 1 of 5" />

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <View style={styles.iconCircle}>
            <Ionicons color={colors.goldDark} name="shield-checkmark-outline" size={32} />
          </View>
        </View>

        <View style={styles.copy}>
          <Text style={styles.headline}>{mode === 'signIn' ? 'Welcome Back' : 'Join Authentic'}</Text>
          <Text style={styles.subtitle}>
            {mode === 'signIn'
              ? 'Sign in to continue your Alignment Profile journey.'
              : 'Create your account to begin your Alignment Profile.'}
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            iconLeft={<Ionicons color={colors.primary} name="logo-apple" size={18} />}
            loading={loadingMethod === 'apple'}
            onPress={() => runAuth('apple')}
            title="Continue with Apple"
            variant="secondary"
          />
          <Button
            iconLeft={<Ionicons color={colors.primary} name="logo-google" size={18} />}
            loading={loadingMethod === 'google'}
            onPress={() => runAuth('google')}
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
            onPress={() => runAuth('email')}
            title="Continue with Email"
          />
        </View>

        <TouchableOpacity onPress={() => runAuth('signin')}>
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkBold}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>BY CONTINUING, YOU AGREE TO OUR TERMS OF SERVICE & PRIVACY POLICY</Text>
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
  iconWrap: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gold,
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
