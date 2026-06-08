import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenLayout } from '../../components/layout';
import { Button } from '../../components/ui/Button';
import { colors, spacing, typography } from '../../theme';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <ScreenLayout
      footer={
        <>
          <Button title="Join the Community" onPress={() => navigation.navigate('Auth', { mode: 'join' })} />
          <Button
            title="Sign In"
            onPress={() => navigation.navigate('Auth', { mode: 'signIn' })}
            variant="outlined"
          />
          <Text style={styles.footnote}>
            By joining, you agree to our terms of stewardship and community values.
          </Text>
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

      <View style={styles.hero}>
        <Text style={styles.headline}>A Different kind of singles Community</Text>
        <Text style={styles.subtitle}>
          A Singles Club for Intentional and Authentic Christian Connections
        </Text>
      </View>

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
    paddingTop: spacing.xxl + spacing.lg,
  },
  brandBlock: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  hero: {
    gap: spacing.md,
  },
  headline: {
    ...typography.headlineXl,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    fontStyle: 'italic',
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
  footnote: {
    ...typography.labelSm,
    color: colors.outline,
    textAlign: 'center',
  },
});
