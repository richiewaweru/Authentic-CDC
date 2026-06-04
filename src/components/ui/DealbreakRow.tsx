import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, radii, spacing, typography } from '../../theme';

interface DealbreakRowProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export function DealbreakRow({ label, value, options, onChange }: DealbreakRowProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.segment}>
        {options.map((option) => {
          const selected = option === value;
          return (
            <TouchableOpacity
              key={option}
              activeOpacity={0.9}
              onPress={() => onChange(option)}
              style={[styles.option, selected && styles.selected]}
            >
              <Text style={[styles.optionLabel, selected && styles.selectedLabel]}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  label: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontFamily: 'Inter_500Medium',
  },
  segment: {
    flexDirection: 'row',
    borderRadius: radii.pill,
    backgroundColor: colors.sand,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  option: {
    flex: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  selected: {
    backgroundColor: colors.primary,
  },
  optionLabel: {
    ...typography.labelSm,
    color: colors.charcoal,
    textAlign: 'center',
  },
  selectedLabel: {
    color: colors.onPrimary,
  },
});
