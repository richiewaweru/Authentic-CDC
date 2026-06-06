import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '../../theme';

interface PinnedFooterProps {
  children: React.ReactNode;
}

export function PinnedFooter({ children }: PinnedFooterProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(247,245,242,0)', 'rgba(247,245,242,0.92)', colors.background]}
        pointerEvents="none"
        style={styles.gradient}
      />
      <View
        style={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 16) + 16 },
        ]}
      >
        {children}
      </View>
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
