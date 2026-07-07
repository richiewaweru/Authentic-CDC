import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../theme';
import { ChoiceCard } from './ChoiceCard';

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
          <ChoiceCard
            key={normalizedOption.label}
            accessibilityRole="checkbox"
            disabled={isDisabled}
            onPress={() => onToggle(normalizedOption.label)}
            selected={isSelected}
            style={styles.item}
            title={normalizedOption.icon ? `${normalizedOption.icon} ${normalizedOption.label}` : normalizedOption.label}
          />
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
    minHeight: 64,
    justifyContent: 'center',
  },
});
