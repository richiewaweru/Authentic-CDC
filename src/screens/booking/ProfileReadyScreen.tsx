import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenLayout } from '../../components/layout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BookingStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<BookingStackParamList, 'ProfileReady'>;

export function ProfileReadyScreen({ navigation }: Props) {
  const signOut = useAuthStore((state) => state.signOut);

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out of Authentic?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            console.error('Sign out failed:', error);
            Alert.alert('Could not sign out', 'Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <ScreenLayout
      footer={
        <>
          <Button
            onPress={() => navigation.navigate('ConversationInfo')}
            title="Continue to Alignment Conversation"
          />
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Alignment Profile',
                'Your full Alignment Profile will be available to review and edit in your Profile tab once Community Access is granted.',
              );
            }}
          >
            <Text style={styles.link}>Review Alignment Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel="Sign out"
            accessibilityRole="button"
            onPress={handleSignOut}
            style={styles.signOutButton}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </>
      }
      header={
        <ScreenHeader
          onBack={() => navigation.goBack()}
          progress={0.2}
          stepLabel="Profile Complete"
        />
      }
    >
      <View style={styles.content}>
        <Card style={styles.card}>
          <View style={styles.checkCircle}>
            <Ionicons color={colors.primary} name="checkmark" size={24} />
          </View>
          <Text style={styles.cardTitle}>Alignment Profile Complete</Text>
          <View style={styles.tags}>
            {['Integrity', 'Balance', 'Purpose'].map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.quote}>
            "Your responses help us prepare a thoughtful and intentional Alignment Conversation."
          </Text>
        </Card>

        <View style={styles.copy}>
          <Text style={styles.headline}>Your Alignment Profile is Ready</Text>
          <Text style={styles.subtitle}>
            The next step is a short Alignment Conversation so we can welcome you well.
          </Text>
        </View>

        <View style={styles.infoRows}>
          <View style={styles.infoRow}>
            <Ionicons color={colors.goldDark} name="sparkles-outline" size={18} />
            <Text style={styles.infoText}>Your Alignment Profile has been received.</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons color={colors.goldDark} name="shield-checkmark-outline" size={18} />
            <Text style={styles.infoText}>
              Next, choose a time for your Alignment Conversation.
            </Text>
          </View>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
  },
  card: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceLow,
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.successTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    ...typography.headlineMd,
    color: colors.primaryDark,
  },
  tags: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tag: {
    borderRadius: 999,
    backgroundColor: colors.goldLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tagText: {
    ...typography.bodySm,
    color: colors.goldDark,
  },
  quote: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  copy: {
    gap: spacing.sm,
  },
  headline: {
    ...typography.headlineLg,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  infoRows: {
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  infoText: {
    ...typography.bodySm,
    color: colors.onSurface,
    flex: 1,
  },
  link: {
    ...typography.bodySm,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  signOutButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.xl,
  },
  signOutText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.error,
  },
});
