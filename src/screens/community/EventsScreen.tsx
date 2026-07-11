import React from 'react';
import { ActivityIndicator, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenLayout } from '../../components/layout';
import { Card } from '../../components/ui/Card';
import { CommunityStackParamList, CommunityTabParamList } from '../../navigation/types';
import { CommunityEvent, getEvents } from '../../services/communityService';
import { colors, spacing, typography } from '../../theme';
import { communityStyles } from './communityStyles';

interface Props {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<CommunityTabParamList, 'Events'>,
    NativeStackNavigationProp<CommunityStackParamList>
  >;
}

export function EventsScreen({ navigation }: Props) {
  const [events, setEvents] = React.useState<CommunityEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(null);
    setEvents(await getEvents());
  }, []);

  React.useEffect(() => {
    load()
      .catch((nextError) => setError(nextError instanceof Error ? nextError.message : 'Could not load events.'))
      .finally(() => setLoading(false));
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Could not refresh events.');
    } finally {
      setRefreshing(false);
    }
  };

  const now = Date.now();
  const upcoming = events.filter((event) => new Date(event.eventDate).getTime() >= now);
  const past = events.filter((event) => new Date(event.eventDate).getTime() < now).reverse();

  return (
    <ScreenLayout
      keyboardAvoiding={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      scrollContentStyle={communityStyles.content}
    >
      <View style={communityStyles.header}>
        <Text style={communityStyles.eyebrow}>Community</Text>
        <Text style={communityStyles.headline}>Events</Text>
      </View>

      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <Text style={communityStyles.error}>{error}</Text> : null}

      {!loading && events.length === 0 ? (
        <Card style={communityStyles.emptyCard}>
          <Text style={communityStyles.cardTitle}>No events yet</Text>
          <Text style={communityStyles.cardBody}>Upcoming gatherings will appear here once they are published.</Text>
        </Card>
      ) : null}

      <EventSection events={upcoming} navigation={navigation} title="Upcoming" />
      <EventSection events={past} navigation={navigation} title="Past" />
    </ScreenLayout>
  );
}

function EventSection({
  events,
  navigation,
  title,
}: {
  events: CommunityEvent[];
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<CommunityTabParamList, 'Events'>,
    NativeStackNavigationProp<CommunityStackParamList>
  >;
  title: string;
}) {
  if (events.length === 0) {
    return null;
  }

  return (
    <View style={communityStyles.section}>
      <Text style={communityStyles.sectionTitle}>{title}</Text>
      {events.map((event) => (
        <TouchableOpacity
          activeOpacity={0.9}
          key={event.id}
          onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
        >
          <Card style={styles.card}>
            {event.coverImageUrl ? (
              <Image source={{ uri: event.coverImageUrl }} style={styles.coverImage} />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>{buildInitials(event.title)}</Text>
              </View>
            )}
            <View style={styles.cardText}>
              <Text style={styles.eventDate}>{formatDate(event.eventDate)}</Text>
              <Text style={communityStyles.cardTitle}>{event.title}</Text>
              <Text style={communityStyles.cardBody}>
                {event.location ?? 'Location TBD'} | {event.durationMinutes} min
              </Text>
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function buildInitials(title: string) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    shadowOpacity: 0.06,
  },
  placeholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainer,
  },
  placeholderText: {
    ...typography.labelMd,
    color: colors.primaryDark,
  },
  cardText: {
    flex: 1,
    flexShrink: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  eventDate: {
    ...typography.labelSm,
    color: colors.goldDark,
  },
});
