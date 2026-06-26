describe('email triggers in mock mode', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      EXPO_PUBLIC_SLOT_DATA_SOURCE: 'mock',
      EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-key',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('does not invoke the welcome email in mock mode', async () => {
    const signUpMock = jest.fn().mockResolvedValue({
      data: {
        session: null,
        user: {
          email: 'mock-user@example.com',
        },
      },
      error: null,
    });
    const invokeMock = jest.fn();

    jest.doMock('react-native', () => ({
      Platform: {
        OS: 'web',
      },
    }));
    jest.doMock('expo-auth-session', () => ({
      makeRedirectUri: jest.fn(() => 'authenticcdc://auth/callback'),
    }));
    jest.doMock('expo-web-browser', () => ({
      maybeCompleteAuthSession: jest.fn(),
      openAuthSessionAsync: jest.fn(),
    }));
    jest.doMock('../src/config/supabase', () => ({
      supabase: {
        auth: {
          signUp: (options: unknown) => signUpMock(options),
          signInWithPassword: jest.fn(),
          signInWithOAuth: jest.fn(),
          exchangeCodeForSession: jest.fn(),
          getSession: jest.fn(),
          setSession: jest.fn(),
          signOut: jest.fn(),
          onAuthStateChange: jest.fn(),
        },
        from: jest.fn(),
        functions: {
          invoke: (name: string, payload: unknown) => invokeMock(name, payload),
        },
      },
    }));
    jest.doMock('../src/config/env', () => ({
      getAppScheme: jest.fn(() => 'authenticcdc'),
      getSlotDataSource: jest.fn(() => 'mock'),
    }));
    jest.doMock('../src/services/authUtils', () => ({
      buildDisplayNameFromEmail: jest.fn(() => 'Mock User'),
      parseAuthCallbackUrl: jest.fn(() => ({})),
    }));
    jest.doMock('../src/services/nativeGoogleAuth', () => ({
      signInWithNativeGoogle: jest.fn(),
    }));

    const { authService } = require('../src/services/authService') as typeof import('../src/services/authService');

    await authService.signUpWithEmail('mock-user@example.com', 'password123');
    await Promise.resolve();

    expect(invokeMock).not.toHaveBeenCalled();
  });

  it('does not invoke the onboarding email in mock mode', async () => {
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
    const invokeMock = jest.fn();

    jest.doMock('../src/config/supabase', () => ({
      supabase: {
        from: (table: string) => {
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
        },
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: {
              user: {
                email: 'mock-user@example.com',
              },
            },
          }),
        },
        functions: {
          invoke: (name: string, payload: unknown) => invokeMock(name, payload),
        },
      },
    }));
    jest.doMock('../src/config/env', () => ({
      getSlotDataSource: jest.fn(() => 'mock'),
    }));

    const { onboardingService } = require('../src/services/onboardingService') as typeof import('../src/services/onboardingService');

    await onboardingService.saveCompletedOnboarding('user-1', {
      firstName: 'Mock',
      lastName: 'User',
      dateOfBirth: '1992-05-10T00:00:00.000Z',
      gender: 'woman',
      cityState: 'Atlanta, GA',
      bio: 'Bio',
      relationshipGoal: 'Friendship first',
      spouseQualities: ['Kindness'],
      communicationStyle: 'Calm & reflective',
      conflictStyle: 'I prefer calm discussion',
      lifestyleVision: 'Faith-centered family',
      sharedActivities: ['Bible study'],
      sharedFaith: 'Essential',
      churchInvolvement: 'Weekly active',
      faithRole: 'Prayer matters.',
      futureHopes: 'A peaceful home.',
      authenticMeaning: 'Truthfulness.',
      ageRange: [25, 34],
      distanceRange: [10, 40],
      distanceType: 'radius',
      distanceRadiusMiles: 25,
      denominations: ['Non-denominational'],
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
    });
    await Promise.resolve();

    expect(invokeMock).not.toHaveBeenCalled();
  });
});
