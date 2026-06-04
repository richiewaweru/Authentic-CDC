import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, radii, spacing, typography } from '../../theme';

interface MultiSelectPillProps {
  options: string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  limit?: number;
  selectedStyle?: 'gold' | 'primary';
}

export function MultiSelectPill({
  options,
  selectedValues,
  onToggle,
  limit,
  selectedStyle = 'gold',
}: MultiSelectPillProps) {
  return (
    <View style={styles.wrapper}>
      {options.map((option) => {
        const isSelected = selectedValues.includes(option);
        const isDisabled = !isSelected && typeof limit === 'number' && selectedValues.length >= limit;

        return (
          <TouchableOpacity
            key={option}
            activeOpacity={0.9}
            disabled={isDisabled}
            onPress={() => onToggle(option)}
            style={[
              styles.pill,
              isSelected &&
                (selectedStyle === 'primary' ? styles.primarySelectedPill : styles.goldSelectedPill),
              isDisabled && styles.disabled,
            ]}
          >
            <Text
              style={[
                styles.label,
                isSelected &&
                  (selectedStyle === 'primary'
                    ? styles.primarySelectedLabel
                    : styles.goldSelectedLabel),
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    borderRadius: radii.pill,
    backgroundColor: colors.sand,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  goldSelectedPill: {
    backgroundColor: colors.goldLight,
  },
  primarySelectedPill: {
    backgroundColor: colors.primary,
  },
  label: {
    ...typography.bodySm,
    color: colors.charcoal,
    fontFamily: 'Inter_500Medium',
  },
  goldSelectedLabel: {
    color: colors.goldDark,
  },
  primarySelectedLabel: {
    color: colors.onPrimary,
  },
  disabled: {
    opacity: 0.45,
  },
});
