import React from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenLayout } from '../../components/layout';
import { Card } from '../../components/ui/Card';
import { GradientHero } from '../../components/ui/GradientHero';
import { CommunityStackParamList, CommunityTabParamList } from '../../navigation/types';
import {
  Announcement,
  CommunityEvent,
  getAnnouncements,
  getUpcomingEvents,
} from '../../services/communityService';
import { colors, spacing, typography } from '../../theme';
import { communityStyles } from './communityStyles';

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
      scrollContentStyle={communityStyles.content}
      keyboardAvoiding={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />
      }
    >
      <View style={communityStyles.header}>
        <Text style={communityStyles.eyebrow}>Community</Text>
        <Text style={communityStyles.headline}>Home</Text>
      </View>

      <GradientHero variant="sand" style={styles.hero}>
        <Text style={styles.heroTitle}>You belong here.</Text>
        <Text style={styles.heroBody}>
          Grow in faith, build real relationships, and take the next guided step.
        </Text>
      </GradientHero>

      <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Foundations')}>
        <Card elevated style={styles.nextStepCard}>
          <View style={styles.priorityBar} />
          <Text style={styles.nextStepLabel}>Next Step</Text>
          <Text style={communityStyles.cardTitle}>Continue your Foundations path</Text>
          <Text style={communityStyles.cardBody}>
            Read the next reflection and keep building your community rhythm.
          </Text>
        </Card>
      </TouchableOpacity>

      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <Text style={communityStyles.error}>{error}</Text> : null}

      {!loading && announcements.length === 0 && events.length === 0 ? (
        <Card style={communityStyles.emptyCard} testID="community-home-empty-card">
          <Text style={communityStyles.cardTitle}>Welcome to the community.</Text>
          <Text style={communityStyles.cardBody}>
            Stay tuned - your first announcements and events are coming soon.
          </Text>
        </Card>
      ) : null}

      {announcements.length > 0 ? (
        <View style={communityStyles.section}>
          <Text style={communityStyles.sectionTitle}>Announcements</Text>
          {announcements.map((announcement) => (
            <AnnouncementCard announcement={announcement} key={announcement.id} />
          ))}
        </View>
      ) : null}

      {events.length > 0 ? (
        <View style={communityStyles.section}>
          <View style={communityStyles.sectionHeader}>
            <Text style={communityStyles.sectionTitle}>Upcoming Events</Text>
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
                <Text style={communityStyles.cardTitle}>{event.title}</Text>
                <Text style={communityStyles.cardBody}>{event.location ?? 'Location TBD'}</Text>
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
          <Text style={communityStyles.cardTitle}>{announcement.title}</Text>
          {announcement.pinned ? <Text style={styles.pin}>Pinned</Text> : null}
        </View>
        <Text style={communityStyles.cardBody}>{announcement.body}</Text>
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
  hero: {
    minHeight: 124,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  heroTitle: {
    ...typography.headlineMd,
    color: colors.primaryDark,
  },
  heroBody: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    maxWidth: 280,
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
    gap: spacing.sm,
  },
  nextStepCard: {
    padding: spacing.lg,
    paddingLeft: spacing.lg,
    gap: spacing.sm,
    overflow: 'hidden',
    minHeight: 112,
    justifyContent: 'center',
  },
  priorityBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.gold,
  },
  nextStepLabel: {
    ...typography.labelSm,
    color: colors.goldDark,
    textTransform: 'uppercase',
  },
  toneBar: {
    width: 5,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  cardContent: {
    padding: spacing.lg,
    paddingLeft: spacing.lg,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  pin: {
    ...typography.labelSm,
    color: colors.goldDark,
  },
  eventDate: {
    ...typography.labelSm,
    color: colors.goldDark,
  },
});
