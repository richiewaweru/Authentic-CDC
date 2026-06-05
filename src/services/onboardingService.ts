import type { PostgrestError } from '@supabase/supabase-js';

import { supabase } from '../config/supabase';
import type { OnboardingData } from '../types/onboarding';
import type { ProfileStatus, UserState } from '../types/auth';

const relationshipGoalMap: Record<string, string> = {
  'Friendship first': 'friendship_first',
  'Intentional dating': 'intentional_dating',
  'Long-term relationship': 'long_term',
  'Marriage-focused relationship': 'marriage_focused',
};

const communicationStyleMap: Record<string, string> = {
  'Calm & reflective': 'calm_reflective',
  'Direct & honest': 'direct_honest',
  'Open & expressive': 'open_expressive',
  'Reserved at first': 'reserved_first',
  'Playful & lighthearted': 'playful_lighthearted',
};

const conflictStyleMap: Record<string, string> = {
  'I prefer calm discussion': 'calm_discussion',
  'I need time to process': 'process_first',
  'I value direct honesty': 'direct_honesty',
  'I avoid conflict at first': 'avoid_conflict',
  'I seek prayer patience and clarity': 'prayer_patience',
};

const lifestyleVisionMap: Record<string, string> = {
  'Faith-centered family': 'faith_family',
  'Ministry & service': 'ministry_service',
  'Quiet peaceful home': 'quiet_peaceful',
  'Community & hospitality': 'community_hospitality',
  'Career and calling': 'career_calling',
  'Adventure and growth': 'adventure_growth',
};

const sharedFaithMap: Record<string, string> = {
  Essential: 'essential',
  'Very important': 'very_important',
  'Somewhat important': 'somewhat_important',
  'Still exploring': 'still_exploring',
};

const churchInvolvementMap: Record<string, string> = {
  'Weekly active': 'weekly_active',
  'Regular attendance': 'regular',
  'Occasional attendance': 'occasional',
  'Still growing spiritually': 'still_growing',
};

function mapRequiredValue(
  value: string | null,
  mapping: Record<string, string>,
  fieldName: string,
) {
  if (!value) {
    return null;
  }

  const normalized = mapping[value];

  if (!normalized) {
    throw new Error(`Unsupported onboarding value for ${fieldName}: ${value}`);
  }

  return normalized;
}

function buildMissingProfileError() {
  return new Error(
    'Profile row not found for the signed-in user. Confirm the Supabase profile trigger has been installed and that existing users have been backfilled.',
  );
}

function isMissingProfileError(error: PostgrestError | null) {
  return error?.code === 'PGRST116';
}

function mapProfileStatusRow(row: { onboarding_complete: boolean; user_state: UserState }): ProfileStatus {
  return {
    onboardingComplete: row.onboarding_complete,
    userState: row.user_state,
  };
}

export function mapOnboardingDataToResponsesPayload(userId: string, data: OnboardingData) {
  return {
    user_id: userId,
    relationship_goal: mapRequiredValue(data.relationshipGoal, relationshipGoalMap, 'relationshipGoal'),
    spouse_qualities: data.spouseQualities,
    communication_style: mapRequiredValue(
      data.communicationStyle,
      communicationStyleMap,
      'communicationStyle',
    ),
    conflict_style: mapRequiredValue(data.conflictStyle, conflictStyleMap, 'conflictStyle'),
    lifestyle_vision: mapRequiredValue(data.lifestyleVision, lifestyleVisionMap, 'lifestyleVision'),
    shared_activities: data.sharedActivities,
    shared_faith: mapRequiredValue(data.sharedFaith, sharedFaithMap, 'sharedFaith'),
    church_involvement: mapRequiredValue(
      data.churchInvolvement,
      churchInvolvementMap,
      'churchInvolvement',
    ),
    faith_role: data.faithRole,
    future_hopes: data.futureHopes,
    authentic_meaning: data.authenticMeaning,
  };
}

export function mapOnboardingDataToPreferencesPayload(userId: string, data: OnboardingData) {
  return {
    user_id: userId,
    age_min: data.ageRange[0],
    age_max: data.ageRange[1],
    distance_min: data.distanceRange[0],
    distance_max: data.distanceRange[1],
    denominations: data.denominations,
    dealbreaker_smoking: data.dealbreakers.smoking,
    dealbreaker_children: data.dealbreakers.children,
    dealbreaker_church: data.dealbreakers.church,
    dealbreaker_politics: data.dealbreakers.politics,
    notify_new_alignments: data.notifications.newAlignments,
    notify_event_updates: data.notifications.eventUpdates,
    notify_community_updates: data.notifications.communityUpdates,
  };
}

export const onboardingService = {
  async getProfileStatus(userId: string): Promise<ProfileStatus> {
    const { data, error } = await supabase
      .from('profiles')
      .select('onboarding_complete, user_state')
      .eq('id', userId)
      .single();

    if (isMissingProfileError(error)) {
      throw buildMissingProfileError();
    }

    if (error || !data) {
      throw error ?? new Error('Unable to load the current profile status.');
    }

    return mapProfileStatusRow(data as { onboarding_complete: boolean; user_state: UserState });
  },

  async saveCompletedOnboarding(userId: string, data: OnboardingData): Promise<ProfileStatus> {
    const responsesPayload = mapOnboardingDataToResponsesPayload(userId, data);
    const preferencesPayload = mapOnboardingDataToPreferencesPayload(userId, data);

    const [{ error: responsesError }, { error: preferencesError }] = await Promise.all([
      supabase.from('onboarding_responses').upsert(responsesPayload, { onConflict: 'user_id' }),
      supabase.from('preferences').upsert(preferencesPayload, { onConflict: 'user_id' }),
    ]);

    if (responsesError) {
      throw responsesError;
    }

    if (preferencesError) {
      throw preferencesError;
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({
        onboarding_complete: true,
        user_state: 'onboarding_complete',
      })
      .eq('id', userId)
      .select('onboarding_complete, user_state')
      .single();

    if (isMissingProfileError(profileError)) {
      throw buildMissingProfileError();
    }

    if (profileError || !profileData) {
      throw profileError ?? new Error('Unable to update the current profile status.');
    }

    return mapProfileStatusRow(
      profileData as { onboarding_complete: boolean; user_state: UserState },
    );
  },
};
