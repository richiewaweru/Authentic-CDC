import React, { useCallback, useMemo, useRef } from 'react';
import { PanResponder, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

import { colors, spacing, typography } from '../../theme';

interface RangeSliderProps {
  label: string;
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  unit?: string;
}

const THUMB_SIZE = 24;
const TRACK_HEIGHT = 4;
const ACTIVE_TRACK_HEIGHT = 4;

export function RangeSlider({ label, min, max, value, onChange, unit }: RangeSliderProps) {
  const [low, high] = value;
  const suffix = unit ? ` ${unit}` : '';
  const trackWidth = useRef(0);
  const lowRef = useRef(low);
  const highRef = useRef(high);
  const lowStartX = useRef(0);
  const highStartX = useRef(0);

  lowRef.current = low;
  highRef.current = high;

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    trackWidth.current = event.nativeEvent.layout.width;
  }, []);

  const valueToPosition = useCallback(
    (nextValue: number) => {
      if (trackWidth.current === 0 || max === min) {
        return 0;
      }

      return ((nextValue - min) / (max - min)) * trackWidth.current;
    },
    [max, min],
  );

  const positionToValue = useCallback(
    (position: number) => {
      if (trackWidth.current === 0 || max === min) {
        return min;
      }

      const ratio = Math.max(0, Math.min(1, position / trackWidth.current));
      return Math.round(min + ratio * (max - min));
    },
    [max, min],
  );

  const lowResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          lowStartX.current = valueToPosition(lowRef.current);
        },
        onPanResponderMove: (_, gestureState) => {
          const nextValue = positionToValue(lowStartX.current + gestureState.dx);
          const clamped = Math.max(min, Math.min(nextValue, highRef.current - 1));
          onChange([clamped, highRef.current]);
        },
      }),
    [min, onChange, positionToValue, valueToPosition],
  );

  const highResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          highStartX.current = valueToPosition(highRef.current);
        },
        onPanResponderMove: (_, gestureState) => {
          const nextValue = positionToValue(highStartX.current + gestureState.dx);
          const clamped = Math.min(max, Math.max(nextValue, lowRef.current + 1));
          onChange([lowRef.current, clamped]);
        },
      }),
    [max, onChange, positionToValue, valueToPosition],
  );

  const lowPercent = max > min ? ((low - min) / (max - min)) * 100 : 0;
  const highPercent = max > min ? ((high - min) / (max - min)) * 100 : 0;
  const thumbActions = [
    { name: 'decrement', label: 'Decrease value' },
    { name: 'increment', label: 'Increase value' },
  ] as const;

  const handleLowAccessibilityAction = useCallback(
    (actionName: string) => {
      if (actionName === 'increment') {
        onChange([Math.min(high - 1, low + 1), high]);
      }

      if (actionName === 'decrement') {
        onChange([Math.max(min, low - 1), high]);
      }
    },
    [high, low, min, onChange],
  );

  const handleHighAccessibilityAction = useCallback(
    (actionName: string) => {
      if (actionName === 'increment') {
        onChange([low, Math.min(max, high + 1)]);
      }

      if (actionName === 'decrement') {
        onChange([low, Math.max(low + 1, high - 1)]);
      }
    },
    [high, low, max, onChange],
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

      <View
        accessibilityLabel={`${label} range slider`}
        onLayout={onLayout}
        style={styles.sliderContainer}
      >
        <View style={styles.track} />
        <View
          style={[
            styles.activeTrack,
            {
              left: `${lowPercent}%`,
              width: `${highPercent - lowPercent}%`,
            },
          ]}
        />
        <View
          accessibilityActions={thumbActions}
          accessibilityLabel={`${label} minimum thumb`}
          accessibilityRole="adjustable"
          onAccessibilityAction={(event) =>
            handleLowAccessibilityAction(event.nativeEvent.actionName)
          }
          style={[styles.thumb, { left: `${lowPercent}%` }]}
          testID={`${label}-minimum-thumb`}
          {...lowResponder.panHandlers}
        >
          <View style={styles.thumbInner} />
        </View>
        <View
          accessibilityActions={thumbActions}
          accessibilityLabel={`${label} maximum thumb`}
          accessibilityRole="adjustable"
          onAccessibilityAction={(event) =>
            handleHighAccessibilityAction(event.nativeEvent.actionName)
          }
          style={[styles.thumb, { left: `${highPercent}%` }]}
          testID={`${label}-maximum-thumb`}
          {...highResponder.panHandlers}
        >
          <View style={styles.thumbInner} />
        </View>
      </View>

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
    height: THUMB_SIZE + 16,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: colors.outlineVariant,
  },
  activeTrack: {
    position: 'absolute',
    height: ACTIVE_TRACK_HEIGHT,
    borderRadius: ACTIVE_TRACK_HEIGHT / 2,
    backgroundColor: colors.gold,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    marginLeft: -(THUMB_SIZE / 2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbInner: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.onPrimary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
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
