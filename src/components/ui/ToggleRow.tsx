import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../theme';

interface ToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function ToggleRow({ label, value, onValueChange }: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        accessibilityLabel={label}
        accessibilityRole="switch"
        onValueChange={onValueChange}
        thumbColor={value ? colors.onPrimary : colors.surface}
        trackColor={{ false: colors.outlineVariant, true: colors.primary }}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  label: {
    ...typography.bodyMd,
    color: colors.onSurface,
    flex: 1,
    paddingRight: spacing.md,
  },
});
