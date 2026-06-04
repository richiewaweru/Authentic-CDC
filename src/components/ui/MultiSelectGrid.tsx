import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, radii, spacing, typography } from '../../theme';

interface MultiSelectGridProps {
  options: string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  limit?: number;
}

export function MultiSelectGrid({
  options,
  selectedValues,
  onToggle,
  limit,
}: MultiSelectGridProps) {
  return (
    <View style={styles.grid}>
      {options.map((option) => {
        const isSelected = selectedValues.includes(option);
        const isDisabled = !isSelected && typeof limit === 'number' && selectedValues.length >= limit;

        return (
          <TouchableOpacity
            key={option}
            activeOpacity={0.9}
            disabled={isDisabled}
            onPress={() => onToggle(option)}
            style={[styles.item, isSelected && styles.selected, isDisabled && styles.disabled]}
          >
            <Text style={[styles.label, isSelected && styles.selectedLabel]}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  item: {
    width: '48%',
    borderRadius: radii.input,
    backgroundColor: colors.sand,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 64,
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: colors.primary,
  },
  label: {
    ...typography.bodySm,
    color: colors.charcoal,
    fontFamily: 'Inter_500Medium',
  },
  selectedLabel: {
    color: colors.onPrimary,
  },
  disabled: {
    opacity: 0.45,
  },
});
