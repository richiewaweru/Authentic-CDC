import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenLayout } from '../../components/layout';
import { Card } from '../../components/ui/Card';
import { CommunityStackParamList, CommunityTabParamList } from '../../navigation/types';
import { getReadings, Reading, ReadingCategory } from '../../services/communityService';
import { colors, spacing, typography } from '../../theme';

const CATEGORIES: Array<ReadingCategory | 'All'> = ['All', 'Faith', 'Relationships', 'Community', 'General'];

interface Props {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<CommunityTabParamList, 'Foundations'>,
    NativeStackNavigationProp<CommunityStackParamList>
  >;
}

export function FoundationsScreen({ navigation }: Props) {
  const [category, setCategory] = React.useState<ReadingCategory | 'All'>('All');
  const [readings, setReadings] = React.useState<Reading[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(null);
    setReadings(await getReadings(category));
  }, [category]);

  React.useEffect(() => {
    setLoading(true);
    load()
      .catch((nextError) => setError(nextError instanceof Error ? nextError.message : 'Could not load readings.'))
      .finally(() => setLoading(false));
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Could not refresh readings.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScreenLayout
      keyboardAvoiding={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      scrollContentStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Community</Text>
        <Text style={styles.headline}>Foundations</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {CATEGORIES.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setCategory(item)}
            style={[styles.chip, category === item && styles.chipActive]}
          >
            <Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!loading && readings.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.cardTitle}>No readings yet</Text>
          <Text style={styles.cardBody}>Published Foundation pieces will appear here.</Text>
        </Card>
      ) : null}

      {readings.map((reading) => (
        <TouchableOpacity
          activeOpacity={0.9}
          key={reading.id}
          onPress={() => navigation.navigate('ReadingDetail', { readingId: reading.id })}
        >
          <Card style={styles.card}>
            <Text style={styles.badge}>{reading.category}</Text>
            <Text style={styles.cardTitle}>{reading.title}</Text>
            <Text style={styles.cardBody}>{preview(reading.body)}</Text>
            <Text style={styles.date}>{formatDate(reading.publishedAt ?? reading.createdAt)}</Text>
          </Card>
        </TouchableOpacity>
      ))}
    </ScreenLayout>
  );
}

function preview(body: string | null) {
  if (!body) {
    return 'Open the external reading for the full article.';
  }

  return body.length > 100 ? `${body.slice(0, 100)}...` : body;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  eyebrow: {
    ...typography.labelSm,
    color: colors.goldDark,
    textTransform: 'uppercase',
  },
  headline: {
    ...typography.headlineLg,
    color: colors.primaryDark,
  },
  chips: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.labelSm,
    color: colors.primary,
  },
  chipTextActive: {
    color: colors.onPrimary,
  },
  card: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  emptyCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  badge: {
    ...typography.labelSm,
    color: colors.goldDark,
  },
  cardTitle: {
    ...typography.bodyMd,
    color: colors.primaryDark,
    fontFamily: 'Inter_600SemiBold',
  },
  cardBody: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  date: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  error: {
    ...typography.bodySm,
    color: colors.error,
  },
});
