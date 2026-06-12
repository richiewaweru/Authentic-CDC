import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { colors, radii, spacing, typography } from '../../theme';
import { formatDateLabel } from '../../utils/date';

interface DatePickerProps {
  dates: string[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
}

export function DatePicker({ dates, selectedDate, onSelect }: DatePickerProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
      {dates.map((date) => {
        const selected = selectedDate === date;

        return (
          <TouchableOpacity
            key={date}
            activeOpacity={0.9}
            accessibilityLabel={formatDateLabel(date)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onSelect(date)}
            style={[styles.chip, selected && styles.selectedChip]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>{formatDateLabel(date)}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  chip: {
    minHeight: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.sand,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedChip: {
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
});
