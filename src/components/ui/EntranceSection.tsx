import React from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';

import { useReduceMotion } from '../../hooks/useReduceMotion';
import { motion } from '../../theme';

interface EntranceSectionProps {
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  playKey?: string | number;
  style?: StyleProp<ViewStyle>;
}

export function EntranceSection({
  children,
  delay = 0,
  distance = 12,
  playKey,
  style,
}: EntranceSectionProps) {
  const reduceMotion = useReduceMotion();
  const opacity = React.useRef(new Animated.Value(1)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }

    opacity.setValue(0);
    translateY.setValue(distance);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: motion.duration.sectionEnter,
        delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: motion.duration.sectionEnter,
        delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [delay, distance, opacity, playKey, reduceMotion, translateY]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}
