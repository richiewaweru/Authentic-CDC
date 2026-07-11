import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { colors, radii, shadows } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  testID?: string;
}

export function Card({ children, elevated = false, style, testID }: CardProps) {
  return (
    <View style={[styles.card, elevated && styles.elevated, style]} testID={testID}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.sand,
    ...shadows.contact,
  },
  elevated: {
    ...shadows.ambient,
  },
});
