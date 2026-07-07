import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DealbreakRow } from '../../components/ui/DealbreakRow';
import { EntranceSection } from '../../components/ui/EntranceSection';
import { MultiSelectPill } from '../../components/ui/MultiSelectPill';
import { RangeSlider } from '../../components/ui/RangeSlider';
import { ToggleRow } from '../../components/ui/ToggleRow';
import { OnboardingData } from '../../types/onboarding';
import { colors, spacing, typography } from '../../theme';
import {
  childrenOptions,
  churchOptions,
  denominationOptions,
  politicalOptions,
  smokingOptions,
} from './options';

interface PreferencesStepProps {
  data: OnboardingData;
  updateData: (payload: Partial<OnboardingData>) => void;
  validationMessage?: string | null;
}

export function PreferencesStep({
  data,
  updateData,
  validationMessage,
}: PreferencesStepProps) {
  const distanceHint =
    data.distanceType === 'radius'
      ? `Showing members within ${data.distanceRadiusMiles} miles of your location`
      : data.distanceType === 'state'
        ? 'Showing members in your state'
        : 'Open to connecting with anyone in the community';

  const toggleDenomination = (value: string) => {
    const nextValues = data.denominations.includes(value)
      ? data.denominations.filter((item) => item !== value)
      : [...data.denominations, value];

    updateData({ denominations: nextValues });
  };

  return (
    <View style={styles.wrapper}>
      <EntranceSection delay={0}>
        <Text style={styles.headline}>Preferences & Stay Connected</Text>
        <Text style={styles.subtitle}>
          Help us surface better alignments and community updates.
        </Text>
      </EntranceSection>
      {validationMessage ? <Text style={styles.validation}>{validationMessage}</Text> : null}
      <EntranceSection delay={60} style={styles.section}>
        <Text style={styles.sectionTitle}>BASIC PREFERENCES</Text>
        <RangeSlider
          label="Age range"
          max={65}
          min={18}
          onChange={(value) => updateData({ ageRange: value })}
          value={data.ageRange}
        />
        <View style={styles.group}>
          <Text style={styles.label}>DISTANCE PREFERENCE</Text>
          <View style={styles.chipRow}>
            {(['radius', 'state', 'open'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                accessibilityRole="button"
                accessibilityState={{ selected: data.distanceType === type }}
                onPress={() => updateData({ distanceType: type })}
                style={[styles.chip, data.distanceType === type && styles.chipActive]}
              >
                <Text style={[styles.chipText, data.distanceType === type && styles.chipTextActive]}>
                  {type === 'radius' ? 'Nearby' : type === 'state' ? 'My State' : 'No Preference'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {data.distanceType === 'radius' ? (
            <View style={styles.chipRow}>
              {([10, 25, 50, 100] as const).map((miles) => (
                <TouchableOpacity
                  key={miles}
                  accessibilityRole="button"
                  accessibilityState={{ selected: data.distanceRadiusMiles === miles }}
                  onPress={() => updateData({ distanceRadiusMiles: miles })}
                  style={[styles.chip, data.distanceRadiusMiles === miles && styles.chipActive]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      data.distanceRadiusMiles === miles && styles.chipTextActive,
                    ]}
                  >
                    {miles} mi
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
          <Text style={styles.hint}>{distanceHint}</Text>
        </View>
        <View style={styles.group}>
          <Text style={styles.label}>DENOMINATIONS</Text>
          <MultiSelectPill
            onToggle={toggleDenomination}
            options={denominationOptions}
            selectedValues={data.denominations}
          />
        </View>
      </EntranceSection>

      <EntranceSection delay={120} style={styles.section}>
        <Text style={styles.sectionTitle}>ALIGNMENT FILTERS</Text>
        <DealbreakRow
          label="Smoking"
          onChange={(value) =>
            updateData({ dealbreakers: { ...data.dealbreakers, smoking: value } })
          }
          options={smokingOptions}
          value={data.dealbreakers.smoking}
        />
        <DealbreakRow
          label="Children"
          onChange={(value) =>
            updateData({ dealbreakers: { ...data.dealbreakers, children: value } })
          }
          options={childrenOptions}
          value={data.dealbreakers.children}
        />
        <DealbreakRow
          label="Church involvement"
          onChange={(value) =>
            updateData({ dealbreakers: { ...data.dealbreakers, church: value } })
          }
          options={churchOptions}
          value={data.dealbreakers.church}
        />
        <DealbreakRow
          label="Political views"
          onChange={(value) =>
            updateData({ dealbreakers: { ...data.dealbreakers, politics: value } })
          }
          options={politicalOptions}
          value={data.dealbreakers.politics}
        />
      </EntranceSection>

      <EntranceSection delay={180} style={styles.section}>
        <Text style={styles.sectionTitle}>STAY CONNECTED</Text>
        <ToggleRow
          label="New alignments"
          onValueChange={(value) =>
            updateData({ notifications: { ...data.notifications, newAlignments: value } })
          }
          value={data.notifications.newAlignments}
        />
        <ToggleRow
          label="Event updates"
          onValueChange={(value) =>
            updateData({ notifications: { ...data.notifications, eventUpdates: value } })
          }
          value={data.notifications.eventUpdates}
        />
        <ToggleRow
          label="Community updates"
          onValueChange={(value) =>
            updateData({ notifications: { ...data.notifications, communityUpdates: value } })
          }
          value={data.notifications.communityUpdates}
        />
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
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.labelMd,
    color: colors.primaryDark,
  },
  group: {
    gap: spacing.sm,
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
  label: {
    ...typography.labelMd,
    color: colors.primaryDark,
  },
});
