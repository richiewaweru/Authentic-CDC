import React from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useReduceMotion } from '../../hooks/useReduceMotion';
import { colors, gradients, motion, radii, sizes, spacing, typography } from '../../theme';
import { ProgressBar } from './ProgressBar';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface JourneyPathProps {
  currentStep: number;
  totalSteps: number;
  label?: string;
}

export function JourneyPath({ currentStep, totalSteps, label }: JourneyPathProps) {
  const { width } = useWindowDimensions();
  const reduceMotion = useReduceMotion();
  const fillProgress = React.useRef(new Animated.Value(0)).current;
  const activeScale = React.useRef(new Animated.Value(1)).current;
  const safeTotal = Math.max(1, totalSteps);
  const safeStep = Math.max(0, Math.min(currentStep, safeTotal - 1));
  const progress = safeTotal === 1 ? 1 : safeStep / (safeTotal - 1);
  const fillWidth = fillProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  React.useEffect(() => {
    if (reduceMotion) {
      fillProgress.setValue(progress);
      activeScale.setValue(1);
      return;
    }

    Animated.timing(fillProgress, {
      toValue: progress,
      duration: motion.duration.pathAdvance,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();

    activeScale.setValue(1);
    Animated.sequence([
      Animated.timing(activeScale, {
        toValue: 1.12,
        duration: motion.duration.sectionEnter / 2,
        easing: Easing.out(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(activeScale, {
        toValue: 1,
        duration: motion.duration.sectionEnter / 2,
        easing: Easing.out(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [activeScale, fillProgress, progress, reduceMotion, safeStep]);

  if (width < 360) {
    return (
      <View style={styles.compact}>
        <ProgressBar progress={progress} />
        {label ? <Text style={styles.compactLabel}>{label}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.path}>
        <View style={styles.baseLine} />
        <AnimatedLinearGradient
          colors={gradients.pathFill.colors}
          end={gradients.pathFill.end}
          start={gradients.pathFill.start}
          style={[styles.filledLine, { width: fillWidth }]}
        />
        {Array.from({ length: safeTotal }).map((_, index) => {
          const state = index < safeStep ? 'complete' : index === safeStep ? 'active' : 'upcoming';
          const size = state === 'active' ? sizes.pathNodeSizeActive : sizes.pathNodeSize;

          return (
            <Animated.View
              key={index}
              style={[
                styles.node,
                state === 'complete' && styles.nodeComplete,
                state === 'active' && styles.nodeActive,
                state === 'upcoming' && styles.nodeUpcoming,
                {
                  width: size,
                  height: size,
                  borderRadius: radii.pathNode,
                  left: `${safeTotal === 1 ? 0 : (index / (safeTotal - 1)) * 100}%`,
                  marginLeft: -size / 2,
                  marginTop: -size / 2,
                },
                state === 'active' && { transform: [{ scale: activeScale }] },
              ]}
            >
              {state === 'complete' ? (
                <Ionicons color={colors.gold} name="checkmark" size={12} />
              ) : (
                <Text style={[styles.nodeText, state === 'active' && styles.nodeTextActive]}>
                  {index + 1}
                </Text>
              )}
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  path: {
    height: 32,
    justifyContent: 'center',
  },
  baseLine: {
    height: sizes.pathLineHeight,
    borderRadius: radii.progressBar,
    backgroundColor: colors.pathLine,
  },
  filledLine: {
    position: 'absolute',
    left: 0,
    height: sizes.pathLineHeight,
    borderRadius: radii.progressBar,
  },
  node: {
    position: 'absolute',
    top: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  nodeComplete: {
    backgroundColor: colors.pathNodeComplete,
    borderColor: colors.pathNodeComplete,
  },
  nodeActive: {
    backgroundColor: colors.pathNodeActive,
    borderColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.32,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 4,
  },
  nodeUpcoming: {
    backgroundColor: colors.pathNodeIdle,
    borderColor: colors.pathLine,
  },
  nodeText: {
    ...typography.labelSm,
    color: colors.outline,
    fontSize: 10,
  },
  nodeTextActive: {
    color: colors.primaryDark,
    fontFamily: 'Inter_600SemiBold',
  },
  compact: {
    gap: spacing.sm,
  },
  compactLabel: {
    ...typography.eyebrow,
    color: colors.goldDark,
    textAlign: 'center',
  },
});
