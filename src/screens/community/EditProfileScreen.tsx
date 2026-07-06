import React from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenLayout } from '../../components/layout';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { CommunityStackParamList } from '../../navigation/types';
import { getMyProfile, updateMyProfile } from '../../services/communityService';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<CommunityStackParamList, 'EditProfile'>;

export function EditProfileScreen({ navigation }: Props) {
  const userId = useAuthStore((state) => state.user?.id);
  const [displayName, setDisplayName] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [cityState, setCityState] = React.useState('');
  const [avatarUrl, setAvatarUrl] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    getMyProfile(userId)
      .then((profile) => {
        setDisplayName(profile?.displayName ?? '');
        setBio(profile?.bio ?? '');
        setCityState(profile?.cityState ?? '');
        setAvatarUrl(profile?.avatarUrl ?? '');
      })
      .catch((nextError) => setError(nextError instanceof Error ? nextError.message : 'Could not load profile.'))
      .finally(() => setLoading(false));
  }, [userId]);

  const save = async () => {
    if (!userId) {
      return;
    }

    if (bio.length > 300) {
      setError('Bio must be 300 characters or fewer.');
      return;
    }

    if (avatarUrl.trim() && !avatarUrl.trim().startsWith('https://')) {
      setError('Avatar URL must start with https://.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateMyProfile(userId, {
        displayName: nullable(displayName),
        bio: nullable(bio),
        cityState: nullable(cityState),
        avatarUrl: nullable(avatarUrl),
      });
      navigation.goBack();
    } catch (nextError) {
      Alert.alert(
        'Could not save profile',
        nextError instanceof Error ? nextError.message : 'Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenLayout
      header={<ScreenHeader onBack={() => navigation.goBack()} stepLabel="Edit Profile" />}
      footer={<Button loading={saving} onPress={save} title="Save profile" />}
    >
      <View style={styles.content}>
        <Field
          label="Display name"
          onChangeText={setDisplayName}
          placeholder="Your name"
          value={displayName}
        />
        <Field
          label="City/State"
          onChangeText={setCityState}
          placeholder="Austin, TX"
          value={cityState}
        />
        <Field
          label="Avatar URL"
          onChangeText={setAvatarUrl}
          placeholder="https://..."
          value={avatarUrl}
        />
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Bio</Text>
            <Text style={styles.count}>{bio.length}/300</Text>
          </View>
          <TextInput
            multiline
            onChangeText={setBio}
            placeholder="A short intro for your community profile"
            placeholderTextColor={colors.outline}
            style={[styles.input, styles.textarea]}
            textAlignVertical="top"
            value={bio}
            maxLength={300}
          />
        </View>
        {loading ? <Text style={styles.helper}>Loading profile...</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </ScreenLayout>
  );
}

function Field({
  label,
  onChangeText,
  placeholder,
  value,
}: {
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize="sentences"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.outline}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

function nullable(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  label: {
    ...typography.labelSm,
    color: colors.primaryDark,
  },
  count: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  input: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.onSurface,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  textarea: {
    minHeight: 140,
    paddingTop: spacing.md,
  },
  helper: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  error: {
    ...typography.bodySm,
    color: colors.error,
  },
});
