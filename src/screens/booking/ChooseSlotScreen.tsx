import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../../components/ui/Button';
import { DatePicker } from '../../components/ui/DatePicker';
import { GuideCard } from '../../components/ui/GuideCard';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { SkeletonBlock } from '../../components/ui/SkeletonBlock';
import { TimeSlotList } from '../../components/ui/TimeSlotList';
import { BookingStackParamList } from '../../navigation/types';
import { fetchAvailableSlots, fetchGuides } from '../../services/slotService';
import { useAuthStore } from '../../stores/authStore';
import { Guide, Slot } from '../../types/booking';
import { colors, radii, spacing, typography } from '../../theme';

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
      try {
        const guideResults = await fetchGuides();
        const firstGuide = guideResults[0];
        const slotResults = firstGuide ? await fetchAvailableSlots(firstGuide.id) : [];

        if (!mounted) {
          return;
        }

        setGuides(guideResults);
        setSlots(slotResults);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
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
      <View style={styles.screen}>
        <ScreenHeader progress={0.5} stepLabel="Alignment Conversation" />
        <View style={styles.content} testID="choose-slot-skeleton">
          <View style={styles.copy}>
            <SkeletonBlock height={24} width="60%" />
            <SkeletonBlock height={16} width="80%" />
          </View>
          <SkeletonBlock height={72} borderRadius={radii.card} />
          <View style={styles.dateSkeletonRow}>
            {[1, 2, 3, 4, 5].map((item) => (
              <SkeletonBlock
                key={item}
                borderRadius={radii.pill}
                height={48}
                width={80}
              />
            ))}
          </View>
          {[1, 2, 3].map((item) => (
            <SkeletonBlock key={item} borderRadius={radii.input} height={52} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader
        onBack={() => navigation.goBack()}
        progress={0.5}
        stepLabel="Alignment Conversation"
      />
      <View style={styles.content}>
        <View style={styles.copy}>
          <Text style={styles.headline}>Choose a Time</Text>
          <Text style={styles.subtitle}>
            Select an Alignment Conversation time that works best for you.
          </Text>
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
            <Text style={styles.emptyTitle}>No times available right now.</Text>
            <Text style={styles.emptyText}>
              Check back soon and we will surface new Alignment Conversation times.
            </Text>
          </View>
        )}
      </View>

      <Button
        disabled={!selectedDate || !selectedSlot}
        onPress={handleContinue}
        title="Continue"
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
  dateSkeletonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
