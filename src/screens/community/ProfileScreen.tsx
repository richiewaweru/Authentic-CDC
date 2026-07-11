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
import { communityStyles } from './communityStyles';

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
      scrollContentStyle={communityStyles.content}
    >
      <View style={communityStyles.header}>
        <Text style={communityStyles.eyebrow}>Community</Text>
        <Text style={communityStyles.headline}>Profile</Text>
      </View>

      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <Text style={communityStyles.error}>{error}</Text> : null}

      {profile ? (
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar name={profile.displayName ?? 'Member'} src={profile.avatarUrl} />
            <View style={styles.profileText}>
              <Text style={communityStyles.cardTitle}>{profile.displayName ?? 'Community Member'}</Text>
              {profile.cityState ? <Text style={communityStyles.cardBody}>{profile.cityState}</Text> : null}
              {profile.bio ? <Text style={communityStyles.cardBody}>{profile.bio}</Text> : null}
            </View>
          </View>
          <Button title="Edit profile" variant="outlined" onPress={() => navigation.navigate('EditProfile')} />
        </Card>
      ) : null}

      <View style={communityStyles.section}>
        <Text style={communityStyles.sectionTitle}>Your Guide</Text>
        {guides.length === 0 ? (
          <Card style={communityStyles.emptyCard}>
            <Text style={communityStyles.cardBody}>Your active guide details will appear here soon.</Text>
          </Card>
        ) : (
          guides.map((guide) => (
            <Card key={guide.id} style={styles.guideCard}>
              <Avatar initials={guide.initials} name={guide.name} src={guide.avatarUrl} />
              <View style={styles.profileText}>
                <Text style={communityStyles.cardTitle}>{guide.name}</Text>
                <Text style={communityStyles.cardBody}>{guide.title}</Text>
                {guide.bio ? <Text style={communityStyles.cardBody}>{guide.bio}</Text> : null}
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
  profileCard: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  guideCard: {
    padding: spacing.md,
    gap: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  profileText: {
    flex: 1,
    flexShrink: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceContainer,
  },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.labelMd,
    color: colors.primaryDark,
  },
});
