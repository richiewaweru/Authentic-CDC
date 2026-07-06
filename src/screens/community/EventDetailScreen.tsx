import React from 'react';
import { ActivityIndicator, Alert, Linking, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenLayout } from '../../components/layout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { CommunityStackParamList } from '../../navigation/types';
import {
  buildCommunityCalendarUrl,
  CommunityEvent,
  getEventById,
} from '../../services/communityService';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<CommunityStackParamList, 'EventDetail'>;

export function EventDetailScreen({ navigation, route }: Props) {
  const [event, setEvent] = React.useState<CommunityEvent | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getEventById(route.params.eventId)
      .then(setEvent)
      .catch((nextError) => setError(nextError instanceof Error ? nextError.message : 'Could not load this event.'))
      .finally(() => setLoading(false));
  }, [route.params.eventId]);

  return (
    <ScreenLayout
      header={<ScreenHeader onBack={() => navigation.goBack()} stepLabel="Event" />}
      keyboardAvoiding={false}
    >
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {event ? (
        <View style={styles.content}>
          <Card style={styles.hero}>
            <Text style={styles.date}>{formatDate(event.eventDate)}</Text>
            <Text style={styles.headline}>{event.title}</Text>
            <Text style={styles.meta}>
              {event.location ?? 'Location TBD'} | {event.durationMinutes} min
            </Text>
          </Card>

          {event.description ? <Text style={styles.body}>{event.description}</Text> : null}

          {event.meetingLink ? (
            <Button
              title="Join Online"
              onPress={() => openUrl(event.meetingLink, 'Could not open the meeting link.')}
            />
          ) : null}
          <Button
            title="Add to Calendar"
            variant="outlined"
            onPress={() => openUrl(buildCommunityCalendarUrl(event), 'Could not open Google Calendar.')}
          />
        </View>
      ) : null}
    </ScreenLayout>
  );
}

async function openUrl(url: string | null, message: string) {
  if (!url) {
    return;
  }

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Cannot open link', message);
    }
  } catch {
    Alert.alert('Cannot open link', message);
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  hero: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  date: {
    ...typography.labelSm,
    color: colors.goldDark,
  },
  headline: {
    ...typography.headlineMd,
    color: colors.primaryDark,
  },
  meta: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  body: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  error: {
    ...typography.bodySm,
    color: colors.error,
  },
});
