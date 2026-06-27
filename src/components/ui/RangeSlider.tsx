import React, { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Slider } from '@miblanchard/react-native-slider';

import { colors, spacing, typography } from '../../theme';

interface RangeSliderProps {
  label: string;
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  unit?: string;
}

const THUMB_SIZE = 28;
const TRACK_HEIGHT = 4;

export function RangeSlider({ label, min, max, value, onChange, unit }: RangeSliderProps) {
  const suffix = unit ? ` ${unit}` : '';
  const [localValue, setLocalValue] = useState<[number, number]>(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const [low, high] = localValue;

  const handleNativeChange = useCallback((values: number[]) => {
    if (values.length < 2) {
      return;
    }

    setLocalValue([values[0], values[1]]);
  }, []);

  const handleNativeComplete = useCallback(
    (values: number[]) => {
      if (values.length < 2) {
        return;
      }

      onChange([values[0], values[1]]);
    },
    [onChange],
  );

  const handleWebLowChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = Number(event.target.value);

      if (next < high) {
        const updated: [number, number] = [next, high];
        setLocalValue(updated);
        onChange(updated);
      }
    },
    [high, onChange],
  );

  const handleWebHighChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = Number(event.target.value);

      if (next > low) {
        const updated: [number, number] = [low, next];
        setLocalValue(updated);
        onChange(updated);
      }
    },
    [low, onChange],
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {low}
          {suffix} - {high}
          {suffix}
        </Text>
      </View>

      {Platform.OS === 'web' ? (
        <View style={styles.webSliderColumn}>
          <input
            aria-label={`${label} minimum`}
            max={max}
            min={min}
            onChange={handleWebLowChange}
            step={1}
            style={{ width: '100%' }}
            type="range"
            value={low}
          />
          <input
            aria-label={`${label} maximum`}
            max={max}
            min={min}
            onChange={handleWebHighChange}
            step={1}
            style={{ width: '100%' }}
            type="range"
            value={high}
          />
        </View>
      ) : (
        <View accessibilityLabel={`${label} range slider`} style={styles.sliderContainer}>
          <Slider
            animateTransitions
            maximumTrackTintColor={colors.outlineVariant}
            maximumValue={max}
            minimumTrackTintColor={colors.gold}
            minimumValue={min}
            onSlidingComplete={handleNativeComplete}
            onValueChange={handleNativeChange}
            step={1}
            thumbStyle={styles.thumb}
            thumbTintColor={colors.primary}
            thumbTouchSize={{ width: 40, height: 40 }}
            trackStyle={styles.track}
            value={localValue}
          />
        </View>
      )}

      <View style={styles.rangeLabels}>
        <Text style={styles.rangeLabel}>
          {min}
          {suffix}
        </Text>
        <Text style={styles.rangeLabel}>
          {max}
          {suffix}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontFamily: 'Inter_600SemiBold',
  },
  sliderContainer: {
    paddingHorizontal: spacing.xs,
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.onPrimary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  webSliderColumn: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
});
