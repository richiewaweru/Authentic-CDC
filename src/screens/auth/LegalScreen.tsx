import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenLayout } from '../../components/layout';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import type { AuthStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme';

type LegalRouteName = 'LegalStewardship' | 'LegalCommunityValues';
type Props = NativeStackScreenProps<AuthStackParamList, LegalRouteName>;

const LEGAL_COPY =
  'This document is being prepared. It will be published before public launch. If you have questions in the meantime, contact support@authenticcdc.com.';

const LEGAL_TITLES: Record<LegalRouteName, string> = {
  LegalStewardship: 'Terms of Stewardship',
  LegalCommunityValues: 'Community Values',
};

export function LegalScreen({ navigation, route }: Props) {
  const title = LEGAL_TITLES[route.name];

  return (
    <ScreenLayout
      header={<ScreenHeader onBack={() => navigation.goBack()} stepLabel={title} />}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{LEGAL_COPY}</Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  title: {
    ...typography.headlineLg,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  body: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
