import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { EntranceSection } from '../../components/ui/EntranceSection';
import type { OnboardingData } from '../../types/onboarding';
import { colors, spacing, typography } from '../../theme';
import { WebDateInput } from '../../components/ui/WebDateInput';
import { calculateAge, parseDateOfBirth } from '../../utils/date';

interface PersonalProfileStepProps {
  data: OnboardingData;
  updateData: (payload: Partial<OnboardingData>) => void;
  validationMessage?: string | null;
}

const GENDER_OPTIONS = [
  { value: 'man', label: 'Man' },
  { value: 'woman', label: 'Woman' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

export function PersonalProfileStep({
  data,
  updateData,
  validationMessage,
}: PersonalProfileStepProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const selectedDate = parseDateOfBirth(data.dateOfBirth);
  const age = selectedDate ? calculateAge(selectedDate) : null;
  const displayDate = selectedDate
    ? selectedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <View style={styles.wrapper}>
      <EntranceSection delay={0}>
        <Text style={styles.headline}>Let's get to know you</Text>
        <Text style={styles.subtitle}>This is the foundation of your profile in the community.</Text>
      </EntranceSection>
      {validationMessage ? <Text style={styles.validation}>{validationMessage}</Text> : null}

      <EntranceSection delay={60} style={styles.field}>
        <Text style={styles.label}>FIRST NAME</Text>
        <TextInput
          accessibilityLabel="First name"
          autoCapitalize="words"
          onChangeText={(firstName) => updateData({ firstName })}
          placeholder="Your first name"
          placeholderTextColor={colors.onSurfaceVariant}
          returnKeyType="next"
          style={styles.input}
          value={data.firstName ?? ''}
        />
      </EntranceSection>

      <EntranceSection delay={120} style={styles.field}>
        <Text style={styles.label}>LAST NAME</Text>
        <TextInput
          accessibilityLabel="Last name"
          autoCapitalize="words"
          onChangeText={(lastName) => updateData({ lastName })}
          placeholder="Your last name"
          placeholderTextColor={colors.onSurfaceVariant}
          returnKeyType="next"
          style={styles.input}
          value={data.lastName ?? ''}
        />
      </EntranceSection>

      <EntranceSection delay={180} style={styles.field}>
        <Text style={styles.label}>DATE OF BIRTH</Text>
        {Platform.OS === 'web' ? (
          <>
            <WebDateInput
              value={data.dateOfBirth}
              onChange={(iso) => updateData({ dateOfBirth: iso })}
              minYear={1940}
            />
            {age !== null ? <Text style={styles.ageHint}>{age} years old</Text> : null}
          </>
        ) : (
          <>
            <TouchableOpacity
              accessibilityLabel="Date of birth"
              accessibilityRole="button"
              onPress={() => setShowDatePicker(true)}
              style={styles.input}
            >
              <Text style={displayDate ? styles.inputText : styles.inputPlaceholder}>
                {displayDate ?? 'Select your date of birth'}
              </Text>
              {age !== null ? <Text style={styles.ageHint}>{age} years old</Text> : null}
            </TouchableOpacity>
            {showDatePicker ? (
              <DateTimePicker
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000)}
                minimumDate={new Date(1940, 0, 1)}
                mode="date"
                onChange={(_event, date) => {
                  setShowDatePicker(Platform.OS === 'ios');

                  if (date) {
                    updateData({ dateOfBirth: date.toISOString() });
                  }
                }}
                value={selectedDate ?? new Date(1990, 0, 1)}
              />
            ) : null}
          </>
        )}
      </EntranceSection>

      <EntranceSection delay={240} style={styles.field}>
        <Text style={styles.label}>I AM A</Text>
        <View style={styles.chipRow}>
          {GENDER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: data.gender === option.value }}
              onPress={() => updateData({ gender: option.value })}
              style={[styles.chip, data.gender === option.value && styles.chipActive]}
            >
              <Text style={[styles.chipText, data.gender === option.value && styles.chipTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </EntranceSection>

      <EntranceSection delay={300} style={styles.field}>
        <Text style={styles.label}>CITY & STATE</Text>
        <TextInput
          accessibilityLabel="City and state"
          autoCapitalize="words"
          onChangeText={(cityState) => updateData({ cityState })}
          placeholder="e.g. Atlanta, GA"
          placeholderTextColor={colors.onSurfaceVariant}
          returnKeyType="next"
          style={styles.input}
          value={data.cityState ?? ''}
        />
        <Text style={styles.hint}>Used to surface members near you - no GPS required</Text>
      </EntranceSection>

      <EntranceSection delay={360} style={styles.field}>
        <Text style={styles.label}>
          A SHORT BIO <Text style={styles.optional}>(optional)</Text>
        </Text>
        <TextInput
          accessibilityLabel="Short bio"
          maxLength={150}
          multiline
          numberOfLines={3}
          onChangeText={(bio) => {
            if (bio.length <= 150) {
              updateData({ bio });
            }
          }}
          placeholder="A sentence or two about yourself..."
          placeholderTextColor={colors.onSurfaceVariant}
          style={[styles.input, styles.multiline]}
          value={data.bio ?? ''}
        />
        <Text style={styles.charCount}>{(data.bio ?? '').length}/150</Text>
      </EntranceSection>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.lg,
  },
  headline: {
    ...typography.headlineLg,
    color: colors.primaryDark,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  validation: {
    ...typography.bodySm,
    color: colors.error,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    ...typography.labelMd,
    color: colors.primaryDark,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.onSurface,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    flex: 1,
  },
  inputPlaceholder: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    flex: 1,
  },
  ageHint: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  multiline: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryContainer,
  },
  chipText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  chipTextActive: {
    color: colors.primary,
  },
  hint: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  charCount: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    textAlign: 'right',
  },
  optional: {
    fontWeight: 'normal',
    color: colors.onSurfaceVariant,
  },
});
