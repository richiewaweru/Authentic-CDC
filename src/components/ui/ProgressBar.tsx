import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, gradients, radii, sizes } from '../../theme';

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <View style={styles.track}>
      <LinearGradient
        colors={gradients.pathFill.colors}
        end={gradients.pathFill.end}
        start={gradients.pathFill.start}
        style={[styles.fill, { width: `${Math.max(0, Math.min(progress, 1)) * 100}%` }]}
      />
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
  },
});
