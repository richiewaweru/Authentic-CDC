import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../../components/ui/Button';
import { colors, spacing, typography } from '../../theme';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.screen}>
      <View style={styles.brandBlock}>
        <View style={styles.brandIcon}>
          <Text style={styles.infinity}>oo</Text>
        </View>
        <Text style={styles.brand}>Authentic</Text>
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

      <View style={styles.footer}>
        <Button title="Join the Community" onPress={() => navigation.navigate('Auth', { mode: 'join' })} />
        <Button
          title="Sign In"
          onPress={() => navigation.navigate('Auth', { mode: 'signIn' })}
          variant="outlined"
        />
        <Text style={styles.footnote}>
          By joining, you agree to our terms of stewardship and community values.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + spacing.lg,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
  },
  brandBlock: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: colors.sandDark,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  infinity: {
    ...typography.headlineMd,
    color: colors.primary,
    letterSpacing: -1,
  },
  brand: {
    ...typography.headlineMd,
    color: colors.primaryDark,
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
  footer: {
    gap: spacing.md,
  },
  footnote: {
    ...typography.labelSm,
    color: colors.outline,
    textAlign: 'center',
  },
});
