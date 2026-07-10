jest.spyOn(console, 'warn').mockImplementation(() => {});

const mockBuildDisplayNameFromEmail = jest.fn((email: string) => email.split('@')[0]);
const mockSignUp = jest.fn();
const mockResend = jest.fn();
const mockExchangeCodeForSession = jest.fn();
const mockFromMaybeSingle = jest.fn();
const mockFromEq = jest.fn(() => ({ single: mockFromMaybeSingle }));
const mockFromSelect = jest.fn(() => ({ eq: mockFromEq }));
const mockFrom = jest.fn((_table: string) => ({ select: mockFromSelect }));
const mockInvoke = jest.fn();

jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
  },
}));

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'authenticcdc://auth/callback'),
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
}));

jest.mock('../src/config/env', () => ({
  getAppScheme: jest.fn(() => 'authenticcdc'),
  getSlotDataSource: jest.fn(() => 'supabase'),
}));

jest.mock('../src/config/supabase', () => ({
  supabase: {
    auth: {
      exchangeCodeForSession: (...args: unknown[]) => mockExchangeCodeForSession(...args),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      setSession: jest.fn(),
      signInWithOAuth: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      signUp: (options: unknown) => mockSignUp(options),
      resend: (...args: unknown[]) => mockResend(...args),
    },
    from: (table: string) => mockFrom(table),
    functions: {
      invoke: (name: string, payload: unknown) => mockInvoke(name, payload),
    },
  },
}));

jest.mock('../src/services/authUtils', () => ({
  buildDisplayNameFromEmail: (email: string) => mockBuildDisplayNameFromEmail(email),
  parseAuthCallbackUrl: jest.fn(() => ({
    code: 'oauth-code',
  })),
}));

jest.mock('../src/services/nativeGoogleAuth', () => ({
  signInWithNativeGoogle: jest.fn(),
}));

import { authService } from '../src/services/authService';

describe('authService email hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(global, 'window', {
      value: {
        location: { href: 'https://example.com/auth/callback?code=oauth-code' },
        history: { replaceState: jest.fn() },
        document: { title: 'Test' },
      },
      writable: true,
    });
    mockFromMaybeSingle.mockResolvedValue({
      data: {
        onboarding_complete: false,
      },
      error: null,
    });
    mockInvoke.mockResolvedValue({ data: null, error: null });
  });

  it('returns email confirmation state after signup without sending the welcome email', async () => {
    mockSignUp.mockResolvedValue({
      data: {
        session: null,
        user: {
          email: 'new.member@example.com',
        },
      },
      error: null,
    });

    const result = await authService.signUpWithEmail('new.member@example.com', 'password123');

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'new.member@example.com',
      password: 'password123',
      options: {
        emailRedirectTo: 'https://app.authenticcdc.com/auth/confirm',
        data: {
          display_name: 'new.member',
        },
      },
    });

    expect(result).toEqual({
      session: null,
      user: {
        email: 'new.member@example.com',
      },
      needsEmailConfirmation: true,
    });

    await Promise.resolve();

    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it('resends signup confirmations', async () => {
    mockResend.mockResolvedValue({
      data: {},
      error: null,
    });

    await authService.resendSignupConfirmation('new.member@example.com');

    expect(mockResend).toHaveBeenCalledWith({
      type: 'signup',
      email: 'new.member@example.com',
    });
  });

  it('fires the welcome email after a first-time Google OAuth callback', async () => {
    const session = {
      user: {
        id: 'user-1',
        email: 'google.user@example.com',
        created_at: '2026-06-26T08:00:00.000Z',
        last_sign_in_at: '2026-06-26T08:00:20.000Z',
      },
    };

    mockExchangeCodeForSession.mockResolvedValue({
      data: { session },
      error: null,
    });

    const result = await authService.completePendingAuthSession();

    expect(result).toBe(session);

    await Promise.resolve();

    expect(mockInvoke).toHaveBeenCalledWith('send-member-email', {
      body: {
        type: 'welcome',
        userEmail: 'google.user@example.com',
        firstName: 'google.user',
      },
    });
  });
});
