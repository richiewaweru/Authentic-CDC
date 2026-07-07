import React from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useReduceMotion } from '../../hooks/useReduceMotion';
import { colors, motion, radii, shadows, spacing, typography } from '../../theme';

interface ChoiceCardProps {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  accessibilityRole?: 'radio' | 'checkbox' | 'button';
  disabled?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

export function ChoiceCard({
  title,
  description,
  selected,
  onPress,
  accessibilityRole = 'button',
  disabled = false,
  iconName,
  style,
}: ChoiceCardProps) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const reduceMotion = useReduceMotion();

  const animateScale = (toValue: number, duration: number) => {
    if (reduceMotion) {
      scale.setValue(1);
      return;
    }

    Animated.timing(scale, {
      toValue,
      duration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      accessibilityLabel={title}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => animateScale(selected ? 1.01 : 1.02, motion.duration.fast)}
      onPressOut={() => animateScale(1, motion.duration.cardSelect)}
      style={style}
    >
      <Animated.View
        style={[
          styles.card,
          selected && styles.selected,
          disabled && styles.disabled,
          { transform: [{ scale }] },
        ]}
      >
        <View style={styles.row}>
          {iconName ? <Ionicons color={colors.goldDark} name={iconName} size={18} /> : null}
          <View style={styles.copy}>
            <Text style={styles.title}>{title}</Text>
            {description ? <Text style={styles.description}>{description}</Text> : null}
          </View>
          <View style={[styles.status, selected && styles.statusSelected]}>
            {selected ? <Ionicons color={colors.onPrimary} name="checkmark" size={13} /> : null}
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.surface,
    padding: spacing.md,
    ...shadows.contact,
  },
  selected: {
    borderColor: colors.gold,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    ...shadows.ambient,
    ...shadows.selection,
  },
  disabled: {
    opacity: 0.45,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.bodyMd,
    color: colors.primaryDark,
    fontFamily: 'Inter_500Medium',
  },
  description: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  status: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusSelected: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
});
