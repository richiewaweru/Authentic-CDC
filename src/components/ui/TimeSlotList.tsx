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
    backgroundColor: colors.sand,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  selected: {
    backgroundColor: colors.primary,
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
