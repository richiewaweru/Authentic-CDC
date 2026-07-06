import React from 'react';
import { ActivityIndicator, Alert, Linking, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenLayout } from '../../components/layout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { CommunityStackParamList } from '../../navigation/types';
import { getReadingById, Reading } from '../../services/communityService';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<CommunityStackParamList, 'ReadingDetail'>;

export function ReadingDetailScreen({ navigation, route }: Props) {
  const [reading, setReading] = React.useState<Reading | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getReadingById(route.params.readingId)
      .then(setReading)
      .catch((nextError) => setError(nextError instanceof Error ? nextError.message : 'Could not load this reading.'))
      .finally(() => setLoading(false));
  }, [route.params.readingId]);

  return (
    <ScreenLayout
      header={<ScreenHeader onBack={() => navigation.goBack()} stepLabel="Foundation" />}
      keyboardAvoiding={false}
    >
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {reading ? (
        <View style={styles.content}>
          <Card style={styles.hero}>
            <Text style={styles.badge}>{reading.category}</Text>
            <Text style={styles.headline}>{reading.title}</Text>
            <Text style={styles.date}>{formatDate(reading.publishedAt ?? reading.createdAt)}</Text>
          </Card>

          {reading.body ? (
            <View style={styles.bodyBlock}>
              {reading.body.split(/\n{2,}/).map((paragraph, index) => (
                <Text key={`${index}-${paragraph.slice(0, 12)}`} style={styles.body}>
                  {paragraph.trim()}
                </Text>
              ))}
            </View>
          ) : null}

          {reading.externalUrl ? (
            <Button
              title="Read Full Article"
              onPress={() => openExternalUrl(reading.externalUrl)}
              variant={reading.body ? 'outlined' : 'primary'}
            />
          ) : null}
        </View>
      ) : null}
    </ScreenLayout>
  );
}

async function openExternalUrl(url: string | null) {
  if (!url) {
    return;
  }

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Cannot open article', 'Please try again later.');
    }
  } catch {
    Alert.alert('Cannot open article', 'Please try again later.');
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
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
  badge: {
    ...typography.labelSm,
    color: colors.goldDark,
  },
  headline: {
    ...typography.headlineMd,
    color: colors.primaryDark,
  },
  date: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  bodyBlock: {
    gap: spacing.md,
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
