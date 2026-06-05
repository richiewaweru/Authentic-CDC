jest.mock('../src/config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

import { supabase } from '../src/config/supabase';
import {
  mapOnboardingDataToPreferencesPayload,
  mapOnboardingDataToResponsesPayload,
  onboardingService,
} from '../src/services/onboardingService';
import type { OnboardingData } from '../src/types/onboarding';

const sampleOnboardingData: OnboardingData = {
  relationshipGoal: 'Friendship first',
  spouseQualities: ['Kindness', 'Honesty'],
  communicationStyle: 'Calm & reflective',
  conflictStyle: 'I prefer calm discussion',
  lifestyleVision: 'Faith-centered family',
  sharedActivities: ['Bible study', 'Travel'],
  sharedFaith: 'Essential',
  churchInvolvement: 'Weekly active',
  faithRole: 'Prayer and encouragement matter most to me.',
  futureHopes: 'Build a peaceful faith-centered home.',
  authenticMeaning: 'Living truthfully before God and people.',
  ageRange: [25, 34],
  distanceRange: [10, 40],
  denominations: ['Non-denominational', 'Baptist'],
  dealbreakers: {
    smoking: 'Prefer no',
    children: 'Open to kids',
    church: 'Prefer active',
    politics: 'Prefer similar',
  },
  notifications: {
    newAlignments: true,
    eventUpdates: false,
    communityUpdates: true,
  },
};

describe('onboarding service', () => {
  const fromMock = supabase.from as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps onboarding responses to canonical backend values', () => {
    expect(mapOnboardingDataToResponsesPayload('user-1', sampleOnboardingData)).toEqual({
      user_id: 'user-1',
      relationship_goal: 'friendship_first',
      spouse_qualities: ['Kindness', 'Honesty'],
      communication_style: 'calm_reflective',
      conflict_style: 'calm_discussion',
      lifestyle_vision: 'faith_family',
      shared_activities: ['Bible study', 'Travel'],
      shared_faith: 'essential',
      church_involvement: 'weekly_active',
      faith_role: 'Prayer and encouragement matter most to me.',
      future_hopes: 'Build a peaceful faith-centered home.',
      authentic_meaning: 'Living truthfully before God and people.',
    });
  });

  it('maps preferences including church dealbreaker', () => {
    expect(mapOnboardingDataToPreferencesPayload('user-1', sampleOnboardingData)).toEqual({
      user_id: 'user-1',
      age_min: 25,
      age_max: 34,
      distance_min: 10,
      distance_max: 40,
      denominations: ['Non-denominational', 'Baptist'],
      dealbreaker_smoking: 'Prefer no',
      dealbreaker_children: 'Open to kids',
      dealbreaker_church: 'Prefer active',
      dealbreaker_politics: 'Prefer similar',
      notify_new_alignments: true,
      notify_event_updates: false,
      notify_community_updates: true,
    });
  });

  it('saves completed onboarding and updates profile status', async () => {
    const onboardingUpsert = jest.fn().mockResolvedValue({ error: null });
    const preferencesUpsert = jest.fn().mockResolvedValue({ error: null });
    const profileSingle = jest.fn().mockResolvedValue({
      data: {
        onboarding_complete: true,
        user_state: 'onboarding_complete',
      },
      error: null,
    });
    const profileSelect = jest.fn(() => ({ single: profileSingle }));
    const profileEq = jest.fn(() => ({ select: profileSelect }));
    const profileUpdate = jest.fn(() => ({ eq: profileEq }));

    fromMock.mockImplementation((table: string) => {
      if (table === 'onboarding_responses') {
        return { upsert: onboardingUpsert };
      }

      if (table === 'preferences') {
        return { upsert: preferencesUpsert };
      }

      if (table === 'profiles') {
        return { update: profileUpdate };
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    const result = await onboardingService.saveCompletedOnboarding('user-1', sampleOnboardingData);

    expect(onboardingUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        relationship_goal: 'friendship_first',
      }),
      { onConflict: 'user_id' },
    );
    expect(preferencesUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        dealbreaker_church: 'Prefer active',
      }),
      { onConflict: 'user_id' },
    );
    expect(profileUpdate).toHaveBeenCalledWith({
      onboarding_complete: true,
      user_state: 'onboarding_complete',
    });
    expect(result).toEqual({
      onboardingComplete: true,
      userState: 'onboarding_complete',
    });
  });

  it('throws a helpful error when the profile row is missing', async () => {
    const profileSingle = jest.fn().mockResolvedValue({
      data: null,
      error: {
        code: 'PGRST116',
        message: 'JSON object requested, multiple (or no) rows returned',
      },
    });
    const profileEq = jest.fn(() => ({ single: profileSingle }));
    const profileSelect = jest.fn(() => ({ eq: profileEq }));

    fromMock.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return { select: profileSelect };
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    await expect(onboardingService.getProfileStatus('user-1')).rejects.toThrow(
      'Profile row not found for the signed-in user.',
    );
  });
});
