import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '../../theme';

interface AgreementFooterProps {
  onCommunityValuesPress: () => void;
  onStewardshipPress: () => void;
}

export function AgreementFooter({
  onCommunityValuesPress,
  onStewardshipPress,
}: AgreementFooterProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.text}>
        By joining, you agree to our{' '}
        <Text
          accessibilityRole="link"
          onPress={onStewardshipPress}
          style={styles.link}
        >
          terms of stewardship
        </Text>{' '}
        and{' '}
        <Text
          accessibilityRole="link"
          onPress={onCommunityValuesPress}
          style={styles.link}
        >
          community values
        </Text>
        .
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  text: {
    ...typography.labelSm,
    color: colors.outline,
    textAlign: 'center',
  },
  link: {
    ...typography.labelSm,
    color: colors.gold,
    textDecorationLine: 'underline',
  },
});
