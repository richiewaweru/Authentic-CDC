import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Slot } from '../../types/booking';
import { colors, radii, spacing, typography } from '../../theme';

interface TimeSlotListProps {
  slots: Slot[];
  selectedSlotId: string | null;
  onSelect: (slot: Slot) => void;
}

export function TimeSlotList({ slots, selectedSlotId, onSelect }: TimeSlotListProps) {
  return (
    <View style={styles.list}>
      {slots.map((slot) => {
        const selected = slot.id === selectedSlotId;

        return (
          <TouchableOpacity
            key={slot.id}
            activeOpacity={0.9}
            accessibilityLabel={slot.time}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onSelect(slot)}
            style={[styles.button, selected && styles.selected]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>{slot.time}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  button: {
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  selected: {
    borderColor: colors.gold,
    backgroundColor: colors.primary,
    shadowColor: colors.gold,
    shadowOpacity: 0.24,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
  },
  label: {
    ...typography.bodyMd,
    color: colors.charcoal,
    fontFamily: 'Inter_500Medium',
  },
  selectedLabel: {
    color: colors.onPrimary,
  },
});
