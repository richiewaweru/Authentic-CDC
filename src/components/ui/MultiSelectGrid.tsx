import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, radii, spacing, typography } from '../../theme';

interface GridOption {
  label: string;
  icon?: string;
}

interface MultiSelectGridProps {
  options: Array<string | GridOption>;
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
        const normalizedOption = typeof option === 'string' ? { label: option } : option;
        const isSelected = selectedValues.includes(normalizedOption.label);
        const isDisabled = !isSelected && typeof limit === 'number' && selectedValues.length >= limit;

        return (
          <TouchableOpacity
            key={normalizedOption.label}
            activeOpacity={0.9}
            accessibilityLabel={normalizedOption.label}
            accessibilityRole="checkbox"
            accessibilityState={{ selected: isSelected, disabled: isDisabled }}
            disabled={isDisabled}
            onPress={() => onToggle(normalizedOption.label)}
            style={[styles.item, isSelected && styles.selected, isDisabled && styles.disabled]}
          >
            {normalizedOption.icon ? (
              <Text style={styles.icon}>{normalizedOption.icon}</Text>
            ) : null}
            <Text style={[styles.label, isSelected && styles.selectedLabel]}>
              {normalizedOption.label}
            </Text>
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
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginBottom: 4,
  },
  selected: {
    backgroundColor: colors.primary,
  },
  label: {
    ...typography.bodySm,
    color: colors.charcoal,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  selectedLabel: {
    color: colors.onPrimary,
  },
  disabled: {
    opacity: 0.45,
  },
});
