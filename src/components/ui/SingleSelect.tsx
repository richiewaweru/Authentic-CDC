import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { spacing } from '../../theme';
import { ChoiceCard } from './ChoiceCard';

export interface SelectOption {
  label: string;
  value: string;
  description?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
}

interface SingleSelectProps {
  options: SelectOption[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
}

export function SingleSelect({ options, selectedValue, onSelect }: SingleSelectProps) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = option.value === selectedValue;

        return (
          <ChoiceCard
            key={option.value}
            accessibilityRole="radio"
            onPress={() => onSelect(option.value)}
            selected={isSelected}
            title={option.label}
            description={option.description}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
});
