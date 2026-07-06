import React from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenLayout } from '../../components/layout';
import { Card } from '../../components/ui/Card';
import { CommunityStackParamList, CommunityTabParamList } from '../../navigation/types';
import {
  Announcement,
  CommunityEvent,
  getAnnouncements,
  getUpcomingEvents,
} from '../../services/communityService';
import { colors, spacing, typography } from '../../theme';

type Navigation = CompositeNavigationProp<
  BottomTabNavigationProp<CommunityTabParamList, 'Home'>,
  NativeStackNavigationProp<CommunityStackParamList>
>;

interface Props {
  navigation: Navigation;
}

export function HomeScreen({ navigation }: Props) {
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [events, setEvents] = React.useState<CommunityEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(null);
    const [nextAnnouncements, nextEvents] = await Promise.all([
      getAnnouncements(),
      getUpcomingEvents(2),
    ]);
    setAnnouncements(nextAnnouncements);
    setEvents(nextEvents);
  }, []);

  React.useEffect(() => {
    load()
      .catch((nextError) => {
        setError(nextError instanceof Error ? nextError.message : 'Could not load community updates.');
      })
      .finally(() => setLoading(false));
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Could not refresh community updates.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScreenLayout
      scrollContentStyle={styles.content}
      keyboardAvoiding={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Community</Text>
        <Text style={styles.headline}>Home</Text>
      </View>

      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!loading && announcements.length === 0 && events.length === 0 ? (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Welcome to the community.</Text>
          <Text style={styles.cardBody}>
            Stay tuned - your first announcements and events are coming soon.
          </Text>
        </Card>
      ) : null}

      {announcements.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Announcements</Text>
          {announcements.map((announcement) => (
            <AnnouncementCard announcement={announcement} key={announcement.id} />
          ))}
        </View>
      ) : null}

      {events.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Events')}>
              <Text style={styles.link}>See all events</Text>
            </TouchableOpacity>
          </View>
          {events.map((event) => (
            <TouchableOpacity
              activeOpacity={0.9}
              key={event.id}
              onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
            >
              <Card style={styles.eventCard}>
                <Text style={styles.eventDate}>{formatDate(event.eventDate)}</Text>
                <Text style={styles.cardTitle}>{event.title}</Text>
                <Text style={styles.cardBody}>{event.location ?? 'Location TBD'}</Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </ScreenLayout>
  );
}

function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  return (
    <Card style={styles.card}>
      <View style={[styles.toneBar, { backgroundColor: toneColor(announcement.tone) }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{announcement.title}</Text>
          {announcement.pinned ? <Text style={styles.pin}>Pinned</Text> : null}
        </View>
        <Text style={styles.cardBody}>{announcement.body}</Text>
      </View>
    </Card>
  );
}

function toneColor(tone: Announcement['tone']) {
  switch (tone) {
    case 'celebration':
      return colors.gold;
    case 'reminder':
      return '#C7832C';
    case 'alert':
      return colors.error;
    default:
      return colors.primary;
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
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
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...typography.headlineMd,
    color: colors.primaryDark,
  },
  link: {
    ...typography.labelSm,
    color: colors.primary,
  },
  card: {
    overflow: 'hidden',
  },
  eventCard: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  toneBar: {
    width: 5,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  cardContent: {
    padding: spacing.md,
    paddingLeft: spacing.lg,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cardTitle: {
    ...typography.bodyMd,
    color: colors.primaryDark,
    fontFamily: 'Inter_600SemiBold',
    flexShrink: 1,
  },
  cardBody: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  pin: {
    ...typography.labelSm,
    color: colors.goldDark,
  },
  eventDate: {
    ...typography.labelSm,
    color: colors.goldDark,
  },
  error: {
    ...typography.bodySm,
    color: colors.error,
  },
});
