import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DealbreakRow } from '../../components/ui/DealbreakRow';
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
  const toggleDenomination = (value: string) => {
    const nextValues = data.denominations.includes(value)
      ? data.denominations.filter((item) => item !== value)
      : [...data.denominations, value];

    updateData({ denominations: nextValues });
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.headline}>Preferences & Stay Connected</Text>
      <Text style={styles.subtitle}>
        Help us surface better alignments and community updates.
      </Text>
      {validationMessage ? <Text style={styles.validation}>{validationMessage}</Text> : null}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>BASIC PREFERENCES</Text>
        <RangeSlider
          label="Age range"
          max={65}
          min={18}
          onChange={(value) => updateData({ ageRange: value })}
          value={data.ageRange}
        />
        <RangeSlider
          label="Distance"
          max={200}
          min={5}
          onChange={(value) => updateData({ distanceRange: value })}
          unit="mi"
          value={data.distanceRange}
        />
        <View style={styles.group}>
          <Text style={styles.label}>DENOMINATIONS</Text>
          <MultiSelectPill
            onToggle={toggleDenomination}
            options={denominationOptions}
            selectedValues={data.denominations}
          />
        </View>
      </View>

      <View style={styles.section}>
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
      </View>

      <View style={styles.section}>
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
      </View>
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
  label: {
    ...typography.labelMd,
    color: colors.primaryDark,
  },
});
