import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radii, sizes } from '../../theme';

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.max(0, Math.min(progress, 1)) * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    height: sizes.progressBarHeight,
    borderRadius: radii.progressBar,
    backgroundColor: colors.outlineVariant,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.progressBar,
    backgroundColor: colors.gold,
  },
});
