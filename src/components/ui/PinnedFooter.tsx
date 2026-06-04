import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, spacing } from '../../theme';

interface PinnedFooterProps {
  children: React.ReactNode;
}

export function PinnedFooter({ children }: PinnedFooterProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(247,245,242,0)', 'rgba(247,245,242,0.92)', colors.background]}
        pointerEvents="none"
        style={styles.gradient}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
  },
  gradient: {
    position: 'absolute',
    top: -48,
    left: -spacing.lg,
    right: -spacing.lg,
    height: 96,
  },
  content: {
    gap: spacing.sm,
  },
});
