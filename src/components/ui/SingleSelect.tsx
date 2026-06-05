import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radii, spacing, typography } from '../../theme';

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
          <TouchableOpacity
            key={option.value}
            activeOpacity={0.9}
            accessibilityLabel={option.label}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(option.value)}
            style={[styles.option, isSelected && styles.optionSelected]}
          >
            <View style={styles.optionRow}>
              {option.iconName ? (
                <Ionicons
                  color={isSelected ? colors.onPrimary : colors.primary}
                  name={option.iconName}
                  size={18}
                />
              ) : null}
              <Text style={[styles.label, isSelected && styles.selectedLabel]}>{option.label}</Text>
            </View>
            {option.description ? (
              <Text style={[styles.description, isSelected && styles.selectedDescription]}>
                {option.description}
              </Text>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  option: {
    borderRadius: radii.input,
    backgroundColor: colors.sand,
    padding: spacing.md,
    gap: spacing.xs,
  },
  optionSelected: {
    backgroundColor: colors.primary,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.bodyMd,
    color: colors.charcoal,
    fontFamily: 'Inter_500Medium',
    flex: 1,
  },
  description: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  selectedLabel: {
    color: colors.onPrimary,
  },
  selectedDescription: {
    color: colors.surface,
  },
});
