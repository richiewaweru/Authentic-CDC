import React from 'react';
import { Animated, Easing, Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

import { useReduceMotion } from '../../hooks/useReduceMotion';
import { colors, motion, sizes } from '../../theme';

type IconName = keyof typeof Feather.glyphMap;

interface SymbolicIconProps {
  name: IconName;
  tone?: 'light' | 'dark';
  filled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function SymbolicIcon({ name, tone = 'light', filled = false, style }: SymbolicIconProps) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const reduceMotion = useReduceMotion();

  React.useEffect(() => {
    if (reduceMotion) {
      scale.setValue(1);
      return;
    }

    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.06,
        duration: motion.duration.iconPulse / 2,
        easing: Easing.out(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: motion.duration.iconPulse / 2,
        easing: Easing.out(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [reduceMotion, scale]);

  const iconColor = tone === 'dark' ? colors.gold : colors.goldDark;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        filled && styles.filled,
        style,
        { transform: [{ scale }] },
      ]}
    >
      {Feather ? (
        <Feather color={filled ? colors.primaryDark : iconColor} name={name} size={48} />
      ) : (
        <Ionicons color={filled ? colors.primaryDark : iconColor} name="checkmark" size={48} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: sizes.iconGraphicSize,
    height: sizes.iconGraphicSize,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  filled: {
    borderRadius: sizes.iconGraphicSize / 2,
    backgroundColor: colors.goldLight,
    shadowColor: colors.gold,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 24,
    elevation: 5,
  },
});
