import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenLayout } from '../../components/layout';
import { AgreementFooter } from '../../components/auth/AgreementFooter';
import { Button } from '../../components/ui/Button';
import { GradientHero } from '../../components/ui/GradientHero';
import { SymbolicIcon } from '../../components/ui/SymbolicIcon';
import { colors, spacing, typography } from '../../theme';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <ScreenLayout
      footerGradient={false}
      footer={
        <>
          <Button title="Join the Community" onPress={() => navigation.navigate('Auth', { mode: 'join' })} />
          <Button
            title="Sign In"
            onPress={() => navigation.navigate('Auth', { mode: 'signIn' })}
            variant="outlined"
          />
          <AgreementFooter
            onCommunityValuesPress={() => navigation.navigate('LegalCommunityValues')}
            onStewardshipPress={() => navigation.navigate('LegalStewardship')}
          />
        </>
      }
      scrollContentStyle={styles.scrollContent}
    >
      <View style={styles.brandBlock}>
        <Image
          accessibilityLabel="Authentic logo"
          resizeMode="contain"
          source={require('../../../assets/authentic_logo.png')}
          style={styles.logo}
        />
      </View>

      <GradientHero style={styles.hero}>
        <Text style={styles.eyebrow}>Alignment Profile</Text>
        <Text style={styles.headline}>Welcome to Authentic</Text>
        <Text style={styles.subtitle}>
          Begin a guided path toward intentional Christian community.
        </Text>
        <SymbolicIcon name="link-2" style={styles.heroIcon} tone="dark" />
      </GradientHero>

      <View style={styles.bullets}>
        <Text style={styles.bullet}>NOT JUST MATCHING.</Text>
        <Text style={styles.bullet}>NOT JUST MESSAGING.</Text>
        <Text style={styles.bullet}>Real people. Real values. Real connection.</Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: spacing.lg,
  },
  brandBlock: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 148,
    height: 148,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  hero: {
    gap: spacing.md,
    alignItems: 'center',
    minHeight: 256,
    paddingVertical: spacing.lg,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.gold,
    textAlign: 'center',
  },
  headline: {
    ...typography.headlineXl,
    color: colors.onPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.surface,
    textAlign: 'center',
  },
  heroIcon: {
    width: 56,
    height: 56,
  },
  bullets: {
    gap: spacing.sm,
    alignItems: 'center',
  },
  bullet: {
    ...typography.labelMd,
    color: colors.primaryDark,
    textAlign: 'center',
  },
});
