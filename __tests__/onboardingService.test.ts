jest.mock('../src/config/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
    functions: {
      invoke: jest.fn(),
    },
  },
}));

jest.mock('../src/config/env', () => ({
  getSlotDataSource: jest.fn(() => 'supabase'),
}));

import { supabase } from '../src/config/supabase';
import {
  mapOnboardingDataToPreferencesPayload,
  mapOnboardingDataToResponsesPayload,
  onboardingService,
} from '../src/services/onboardingService';
import type { OnboardingData } from '../src/types/onboarding';

const sampleOnboardingData: OnboardingData = {
  firstName: 'Ada',
  lastName: 'Love',
  dateOfBirth: '1992-05-10T00:00:00.000Z',
  gender: 'woman',
  cityState: 'Atlanta, GA',
  bio: 'Faith-focused and community-minded.',
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
  distanceType: 'radius',
  distanceRadiusMiles: 25,
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
  const getUserMock = supabase.auth.getUser as jest.Mock;
  const invokeMock = supabase.functions.invoke as jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.clearAllMocks();
    getUserMock.mockResolvedValue({
      data: {
        user: {
          email: 'ada@example.com',
        },
      },
    });
    invokeMock.mockResolvedValue({ data: null, error: null });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
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
      distance_type: 'radius',
      distance_radius_miles: 25,
      distance_min: 0,
      distance_max: 25,
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
      first_name: 'Ada',
      last_name: 'Love',
      date_of_birth: '1992-05-10',
      gender: 'woman',
      city_state: 'Atlanta, GA',
      bio: 'Faith-focused and community-minded.',
      display_name: 'Ada Love',
      onboarding_complete: true,
      user_state: 'onboarding_complete',
    });
    expect(result).toEqual({
      onboardingComplete: true,
      userState: 'onboarding_complete',
    });
    await Promise.resolve();
    expect(invokeMock).toHaveBeenCalledWith('send-member-email', {
      body: {
        type: 'onboarding_complete',
        userEmail: 'ada@example.com',
        firstName: 'Ada',
        memberEmail: 'ada@example.com',
        memberCity: 'Atlanta, GA',
      },
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
      'We could not prepare your profile yet. Please try again or contact support.',
    );
  });

  it('throws a friendly error when a response cannot be mapped', () => {
    expect(() =>
      mapOnboardingDataToResponsesPayload('user-1', {
        ...sampleOnboardingData,
        communicationStyle: 'Unknown style',
      }),
    ).toThrow('One of your responses could not be saved. Please try again.');
  });

  it('nulls backward-compatible distance bounds when preference is not radius', () => {
    expect(
      mapOnboardingDataToPreferencesPayload('user-1', {
        ...sampleOnboardingData,
        distanceType: 'open',
      }),
    ).toEqual(
      expect.objectContaining({
        distance_type: 'open',
        distance_radius_miles: null,
        distance_min: null,
        distance_max: null,
      }),
    );
  });
});
