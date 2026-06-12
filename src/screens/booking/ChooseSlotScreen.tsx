import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenLayout } from '../../components/layout';
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
  const [slotsByGuide, setSlotsByGuide] = useState<Record<string, Slot[]>>({});
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const guideResults = await fetchGuides();
        const slotResults = await Promise.all(
          guideResults.map(async (guide) => [guide.id, await fetchAvailableSlots(guide.id)] as const),
        );

        const nextSlotsByGuide = Object.fromEntries(slotResults);
        const guidesWithSlots = guideResults.filter((guide) => (nextSlotsByGuide[guide.id] ?? []).length > 0);
        const fallbackGuides = guidesWithSlots.length ? guidesWithSlots : guideResults;
        const firstGuideId = fallbackGuides[0]?.id ?? null;

        if (!mounted) {
          return;
        }

        setGuides(fallbackGuides);
        setSlotsByGuide(nextSlotsByGuide);
        setSelectedGuideId(firstGuideId);
        setLoadError(null);
      } catch (error) {
        console.error('Unable to load guides and slots:', error);

        if (!mounted) {
          return;
        }

        setGuides([]);
        setSlotsByGuide({});
        setSelectedGuideId(null);
        setLoadError(
          error instanceof Error ? error.message : 'Could not load available times right now.',
        );
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

  const selectedGuide = useMemo(
    () => guides.find((guide) => guide.id === selectedGuideId) ?? guides[0] ?? null,
    [guides, selectedGuideId],
  );
  const guideSlots = useMemo(() => {
    if (!selectedGuide) {
      return [];
    }

    return slotsByGuide[selectedGuide.id] ?? [];
  }, [selectedGuide, slotsByGuide]);
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
      <ScreenLayout
        header={<ScreenHeader progress={0.5} stepLabel="Alignment Conversation" />}
      >
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
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      footer={
        <Button
          disabled={!selectedDate || !selectedSlot}
          onPress={handleContinue}
          title="Continue"
        />
      }
      header={
        <ScreenHeader
          onBack={() => navigation.goBack()}
          progress={0.5}
          stepLabel="Alignment Conversation"
        />
      }
    >
      <View style={styles.content}>
        <View style={styles.copy}>
          <Text style={styles.headline}>Choose a Time</Text>
          <Text style={styles.subtitle}>
            Select an Alignment Conversation time that works best for you.
          </Text>
        </View>

        {guides.length > 1 ? (
          <View style={styles.guidePickerSection}>
            <Text style={styles.label}>SELECT A GUIDE</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.guidePicker}
            >
              {guides.map((guide) => {
                const selected = guide.id === selectedGuide?.id;

                return (
                  <TouchableOpacity
                    key={guide.id}
                    activeOpacity={0.9}
                    accessibilityLabel={`Choose ${guide.name}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      setSelectedGuideId(guide.id);
                      setSelectedDate(null);
                      setSelectedSlot(null);
                    }}
                    style={styles.guidePickerButton}
                  >
                    <GuideCard guide={guide} selected={selected} />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : selectedGuide ? (
          <GuideCard guide={selectedGuide} />
        ) : null}

        {loadError ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>We couldn&apos;t load times right now.</Text>
            <Text style={styles.emptyText}>{loadError}</Text>
          </View>
        ) : availableDates.length ? (
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
        ) : selectedGuide ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No times available for this guide right now.</Text>
            <Text style={styles.emptyText}>
              Choose another guide or check back soon for new Alignment Conversation times.
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No times available right now.</Text>
            <Text style={styles.emptyText}>
              Check back soon and we will surface new Alignment Conversation times.
            </Text>
          </View>
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
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
  guidePickerSection: {
    gap: spacing.sm,
  },
  guidePicker: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  guidePickerButton: {
    width: 280,
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
