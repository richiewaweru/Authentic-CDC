import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';

import { colors, spacing, typography } from '../../theme';

interface RangeSliderProps {
  label: string;
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  unit?: string;
}

export function RangeSlider({ label, min, max, value, onChange, unit }: RangeSliderProps) {
  const [start, end] = value;
  const suffix = unit ? ` ${unit}` : '';

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {start}
          {suffix} - {end}
          {suffix}
        </Text>
      </View>
      <Text style={styles.caption}>Minimum</Text>
      <Slider
        accessibilityLabel={`${label} minimum value`}
        maximumTrackTintColor={colors.outlineVariant}
        maximumValue={Math.max(min + 1, end - 1)}
        minimumTrackTintColor={colors.gold}
        minimumValue={min}
        onValueChange={(next) => onChange([Math.round(next), end])}
        step={1}
        thumbTintColor={colors.primary}
        value={start}
      />
      <Text style={styles.caption}>Maximum</Text>
      <Slider
        accessibilityLabel={`${label} maximum value`}
        maximumTrackTintColor={colors.outlineVariant}
        maximumValue={max}
        minimumTrackTintColor={colors.gold}
        minimumValue={Math.min(max - 1, start + 1)}
        onValueChange={(next) => onChange([start, Math.round(next)])}
        step={1}
        thumbTintColor={colors.primary}
        value={end}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  label: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontFamily: 'Inter_500Medium',
  },
  value: {
    ...typography.bodySm,
    color: colors.primary,
  },
  caption: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
});
