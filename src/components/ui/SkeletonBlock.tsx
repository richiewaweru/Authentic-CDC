import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, Platform, StyleSheet, ViewStyle } from 'react-native';

import { useReduceMotion } from '../../hooks/useReduceMotion';
import { colors, radii } from '../../theme';

interface SkeletonBlockProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  testID?: string;
}

export function SkeletonBlock({
  width = '100%',
  height = 16,
  borderRadius = radii.input,
  style,
  testID,
}: SkeletonBlockProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(0.55);
      return undefined;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [opacity, reduceMotion]);

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.base,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surfaceContainer,
  },
});
