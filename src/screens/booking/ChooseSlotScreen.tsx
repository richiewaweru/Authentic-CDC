import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../../components/ui/Button';
import { DatePicker } from '../../components/ui/DatePicker';
import { GuideCard } from '../../components/ui/GuideCard';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { TimeSlotList } from '../../components/ui/TimeSlotList';
import { mockSupabase } from '../../mocks/supabase';
import { BookingStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/authStore';
import { Guide, Slot } from '../../types/booking';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<BookingStackParamList, 'ChooseSlot'>;

export function ChooseSlotScreen({ navigation }: Props) {
  const setBookingSelection = useAuthStore((state) => state.setBookingSelection);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const [guideResults, slotResults] = await Promise.all([
        mockSupabase.guides.list(),
        mockSupabase.slots.list(),
      ]);

      if (!mounted) {
        return;
      }

      setGuides(guideResults);
      setSlots(slotResults);
      setLoading(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedGuide = guides[0] ?? null;
  const guideSlots = useMemo(
    () => slots.filter((slot) => slot.guideId === selectedGuide?.id),
    [selectedGuide, slots],
  );
  const availableDates = useMemo(
    () => Array.from(new Set(guideSlots.map((slot) => slot.date))).slice(0, 5),
    [guideSlots],
  );
  const availableTimes = useMemo(
    () => guideSlots.filter((slot) => slot.date === selectedDate),
    [guideSlots, selectedDate],
  );

  const handleContinue = () => {
    if (!selectedGuide || !selectedSlot) {
      return;
    }

    setBookingSelection({
      guide: selectedGuide,
      slot: selectedSlot,
    });
    navigation.navigate('ConfirmBooking');
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader onBack={() => navigation.goBack()} stepLabel="Step 1 of 5" />
      <View style={styles.content}>
        <View style={styles.copy}>
          <Text style={styles.headline}>Choose a Slot</Text>
          <Text style={styles.subtitle}>Select a time that works best for you.</Text>
        </View>

        {selectedGuide ? <GuideCard guide={selectedGuide} /> : null}

        {availableDates.length ? (
          <>
            <DatePicker
              dates={availableDates}
              onSelect={(date) => {
                setSelectedDate(date);
                setSelectedSlot(null);
              }}
              selectedDate={selectedDate}
            />
            <View style={styles.times}>
              <Text style={styles.label}>AVAILABLE TIMES</Text>
              <TimeSlotList
                onSelect={setSelectedSlot}
                selectedSlotId={selectedSlot?.id ?? null}
                slots={availableTimes}
              />
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No slots available right now.</Text>
            <Text style={styles.emptyText}>
              Check back soon and we will surface new guide availability.
            </Text>
          </View>
        )}
      </View>

      <Button
        disabled={!selectedDate || !selectedSlot}
        onPress={handleContinue}
        title="Continue ->"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
  },
  content: {
    gap: spacing.xl,
  },
  copy: {
    gap: spacing.sm,
  },
  headline: {
    ...typography.headlineLg,
    color: colors.primaryDark,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  times: {
    gap: spacing.sm,
  },
  label: {
    ...typography.labelMd,
    color: colors.primaryDark,
  },
  emptyState: {
    gap: spacing.sm,
    padding: spacing.xl,
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  emptyTitle: {
    ...typography.headlineMd,
    color: colors.primaryDark,
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
