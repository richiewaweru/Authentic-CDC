import React from 'react';
import { Animated, Easing, Platform, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useReduceMotion } from '../../hooks/useReduceMotion';
import { colors, gradients, motion, radii, sizes } from '../../theme';

interface GradientHeroProps {
  children: React.ReactNode;
  variant?: 'dark' | 'sand';
  roseGlow?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function GradientHero({ children, variant = 'dark', roseGlow = false, style }: GradientHeroProps) {
  const drift = React.useRef(new Animated.Value(0)).current;
  const reduceMotion = useReduceMotion();

  React.useEffect(() => {
    if (reduceMotion) {
      drift.setValue(0);
      return undefined;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 12000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 12000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [drift, reduceMotion]);

  const gradient = variant === 'dark' ? gradients.heroDark : gradients.sandLight;
  const glowTranslate = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 18],
  });

  return (
    <LinearGradient
      colors={gradient.colors}
      end={gradient.end}
      locations={'locations' in gradient ? gradient.locations : undefined}
      start={gradient.start}
      style={[styles.hero, variant === 'sand' && styles.sandHero, style]}
    >
      <Animated.View
        style={[
          styles.glow,
          roseGlow && styles.roseGlow,
          styles.noPointerEvents,
          { transform: [{ translateX: glowTranslate }, { translateY: Animated.multiply(glowTranslate, -0.4) }] },
        ]}
      />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: sizes.heroMinHeight,
    borderRadius: radii.card,
    overflow: 'hidden',
    padding: 28,
    justifyContent: 'center',
  },
  sandHero: {
    minHeight: 148,
  },
  glow: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    right: -36,
    top: -64,
    backgroundColor: 'rgba(198,168,94,0.10)',
  },
  noPointerEvents: {
    pointerEvents: 'none',
  },
  roseGlow: {
    backgroundColor: colors.roseGoldTint,
  },
});
