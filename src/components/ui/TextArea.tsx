import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors, radii, spacing, typography } from '../../theme';
import { MultiSelectPill } from './MultiSelectPill';

interface TextAreaProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  starterTags?: string[];
  onFocus?: () => void;
}

export function TextArea({
  value,
  onChangeText,
  placeholder,
  starterTags = [],
  onFocus,
}: TextAreaProps) {
  return (
    <View style={styles.wrapper}>
      <TextInput
        accessibilityLabel={placeholder}
        multiline
        onChangeText={onChangeText}
        onFocus={onFocus}
        placeholder={placeholder}
        placeholderTextColor={colors.outline}
        style={styles.input}
        textAlignVertical="top"
        value={value}
      />
      {starterTags.length ? (
        <MultiSelectPill
          onToggle={(tag) => {
            const nextValue = value.trim().length ? `${value.trim()} ${tag}` : tag;
            onChangeText(nextValue);
          }}
          getAccessibilityLabel={(tag) => `Add ${tag}`}
          options={starterTags}
          selectedValues={[]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  input: {
    minHeight: 132,
    borderWidth: 1,
    borderColor: colors.sandDark,
    borderRadius: radii.input,
    backgroundColor: colors.surface,
    padding: spacing.md,
    color: colors.onSurface,
    ...typography.bodyMd,
  },
});
