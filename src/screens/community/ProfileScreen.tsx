import React from 'react';
import { ActivityIndicator, Image, RefreshControl, StyleSheet, Text, View } from 'react-native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { ScreenLayout } from '../../components/layout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CommunityStackParamList, CommunityTabParamList } from '../../navigation/types';
import {
  ActiveGuide,
  CommunityProfile,
  getActiveGuides,
  getMyProfile,
} from '../../services/communityService';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, typography } from '../../theme';

interface Props {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<CommunityTabParamList, 'Profile'>,
    NativeStackNavigationProp<CommunityStackParamList>
  >;
}

export function ProfileScreen({ navigation }: Props) {
  const userId = useAuthStore((state) => state.user?.id);
  const [profile, setProfile] = React.useState<CommunityProfile | null>(null);
  const [guides, setGuides] = React.useState<ActiveGuide[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!userId) {
      return;
    }

    setError(null);
    const [nextProfile, nextGuides] = await Promise.all([
      getMyProfile(userId),
      getActiveGuides(),
    ]);
    setProfile(nextProfile);
    setGuides(nextGuides);
  }, [userId]);

  React.useEffect(() => {
    load()
      .catch((nextError) => setError(nextError instanceof Error ? nextError.message : 'Could not load profile.'))
      .finally(() => setLoading(false));
  }, [load]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      void load();
    });
    return unsubscribe;
  }, [load, navigation]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Could not refresh profile.');
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
        <Text style={styles.headline}>Profile</Text>
      </View>

      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {profile ? (
        <Card style={styles.card}>
          <Avatar name={profile.displayName ?? 'Member'} src={profile.avatarUrl} />
          <View style={styles.profileText}>
            <Text style={styles.cardTitle}>{profile.displayName ?? 'Community Member'}</Text>
            {profile.cityState ? <Text style={styles.cardBody}>{profile.cityState}</Text> : null}
            {profile.bio ? <Text style={styles.cardBody}>{profile.bio}</Text> : null}
          </View>
          <Button title="Edit profile" variant="outlined" onPress={() => navigation.navigate('EditProfile')} />
        </Card>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Guide</Text>
        {guides.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.cardBody}>Your active guide details will appear here soon.</Text>
          </Card>
        ) : (
          guides.map((guide) => (
            <Card key={guide.id} style={styles.guideCard}>
              <Avatar initials={guide.initials} name={guide.name} src={guide.avatarUrl} />
              <View style={styles.profileText}>
                <Text style={styles.cardTitle}>{guide.name}</Text>
                <Text style={styles.cardBody}>{guide.title}</Text>
                {guide.bio ? <Text style={styles.cardBody}>{guide.bio}</Text> : null}
              </View>
            </Card>
          ))
        )}
      </View>
    </ScreenLayout>
  );
}

function Avatar({
  initials,
  name,
  src,
}: {
  initials?: string;
  name: string;
  src: string | null;
}) {
  const fallback = initials || buildInitials(name);

  if (src) {
    return <Image source={{ uri: src }} style={styles.avatar} />;
  }

  return (
    <View style={styles.avatarFallback}>
      {fallback ? (
        <Text style={styles.avatarText}>{fallback}</Text>
      ) : (
        <Ionicons color={colors.primary} name="person" size={24} />
      )}
    </View>
  );
}

function buildInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
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
  sectionTitle: {
    ...typography.headlineMd,
    color: colors.primaryDark,
  },
  card: {
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: 'center',
  },
  guideCard: {
    padding: spacing.md,
    gap: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emptyCard: {
    padding: spacing.md,
  },
  profileText: {
    flex: 1,
    gap: spacing.xs,
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
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceContainer,
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.labelMd,
    color: colors.primaryDark,
  },
  error: {
    ...typography.bodySm,
    color: colors.error,
  },
});
