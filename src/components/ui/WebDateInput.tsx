import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, spacing, typography } from '../../theme';

interface WebDateInputProps {
  value?: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  minYear?: number;
  testID?: string;
}

function isoToDisplay(iso?: string): string {
  if (!iso) {
    return '';
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);

  if (!match) {
    return '';
  }

  const [, year, month, day] = match;
  return `${month}/${day}/${year}`;
}

function maskDigits(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  const month = digits.slice(0, 2);
  const day = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  let output = month;

  if (digits.length >= 2) {
    output += day ? `/${day}` : '/';
  }

  if (digits.length >= 4) {
    output += year ? `/${year}` : '/';
  }

  return output;
}

function toIsoIfValid(display: string, minYear: number): string {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(display);

  if (!match) {
    return '';
  }

  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  const now = new Date();

  if (month < 1 || month > 12) {
    return '';
  }

  if (day < 1 || day > 31) {
    return '';
  }

  if (year < minYear || year > now.getFullYear()) {
    return '';
  }

  const parsed = new Date(Date.UTC(year, month - 1, day));
  const isRealDate =
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day;

  if (!isRealDate || parsed.getTime() > now.getTime()) {
    return '';
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function WebDateInput({
  value,
  onChange,
  placeholder = 'MM/DD/YYYY',
  minYear = 1900,
  testID,
}: WebDateInputProps) {
  const [display, setDisplay] = useState(isoToDisplay(value));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = isoToDisplay(value);
    setDisplay((current) =>
      current.replace(/\D/g, '') === next.replace(/\D/g, '') ? current : next,
    );
  }, [value]);

  const handleChange = (raw: string) => {
    const masked = maskDigits(raw);
    setDisplay(masked);

    if (masked.replace(/\D/g, '').length < 8) {
      setError(null);
      onChange('');
      return;
    }

    const iso = toIsoIfValid(masked, minYear);

    if (!iso) {
      setError('Enter a real date as MM/DD/YYYY.');
      onChange('');
      return;
    }

    setError(null);
    onChange(iso);
  };

  return (
    <View style={styles.wrapper}>
      <TextInput
        accessibilityLabel="Date of birth"
        inputMode="numeric"
        keyboardType="number-pad"
        maxLength={10}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={colors.onSurfaceVariant}
        style={styles.input}
        testID={testID}
        value={display}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  input: {
    ...typography.bodyMd,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.onSurface,
    backgroundColor: colors.surface,
  },
  error: {
    ...typography.labelSm,
    color: colors.error,
  },
});
