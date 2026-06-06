const mockMaybeCompleteAuthSession = jest.fn();
const mockOpenAuthSessionAsync = jest.fn();
const mockSignInWithOAuth = jest.fn();
const mockSetSession = jest.fn();
const mockSignInWithNativeGoogle = jest.fn();

function loadAuthServiceForPlatform(platform: 'android' | 'ios' | 'web') {
  jest.resetModules();

  jest.doMock('react-native', () => ({
    Platform: {
      OS: platform,
    },
  }));

  jest.doMock('expo-auth-session', () => ({
    makeRedirectUri: jest.fn(() => 'authenticcdc://auth/callback'),
  }));

  jest.doMock('expo-web-browser', () => ({
    maybeCompleteAuthSession: (...args: unknown[]) => mockMaybeCompleteAuthSession(...args),
    openAuthSessionAsync: (...args: unknown[]) => mockOpenAuthSessionAsync(...args),
  }));

  jest.doMock('../src/config/supabase', () => ({
    supabase: {
      auth: {
        exchangeCodeForSession: jest.fn(),
        getSession: jest.fn(),
        onAuthStateChange: jest.fn(),
        setSession: (...args: unknown[]) => mockSetSession(...args),
        signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
        signInWithPassword: jest.fn(),
        signOut: jest.fn(),
        signUp: jest.fn(),
      },
    },
  }));

  jest.doMock('../src/config/env', () => ({
    getAppScheme: jest.fn(() => 'authenticcdc'),
  }));

  jest.doMock('../src/services/authUtils', () => ({
    buildDisplayNameFromEmail: jest.fn(),
    parseAuthCallbackUrl: jest.fn(() => ({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    })),
  }));

  jest.doMock('../src/services/nativeGoogleAuth', () => ({
    signInWithNativeGoogle: (...args: unknown[]) => mockSignInWithNativeGoogle(...args),
  }));

  return require('../src/services/authService').authService;
}

describe('authService signInWithGoogle', () => {
  beforeEach(() => {
    mockMaybeCompleteAuthSession.mockReset();
    mockOpenAuthSessionAsync.mockReset();
    mockSignInWithOAuth.mockReset();
    mockSetSession.mockReset();
    mockSignInWithNativeGoogle.mockReset();
  });

  it('uses native Google sign-in on Android', async () => {
    const authService = loadAuthServiceForPlatform('android');
    const session = { access_token: 'native-session' };
    mockSignInWithNativeGoogle.mockResolvedValue(session);

    await expect(authService.signInWithGoogle()).resolves.toBe(session);
    expect(mockSignInWithNativeGoogle).toHaveBeenCalledTimes(1);
    expect(mockSignInWithOAuth).not.toHaveBeenCalled();
  });

  it('keeps the browser OAuth flow on web', async () => {
    const authService = loadAuthServiceForPlatform('web');
    mockSignInWithOAuth.mockResolvedValue({ error: null });

    await expect(authService.signInWithGoogle()).resolves.toBeNull();
    expect(mockSignInWithNativeGoogle).not.toHaveBeenCalled();
    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'authenticcdc://auth/callback',
      },
    });
    expect(mockOpenAuthSessionAsync).not.toHaveBeenCalled();
  });

  it('keeps the browser OAuth flow on iOS fallback', async () => {
    const authService = loadAuthServiceForPlatform('ios');
    const session = { access_token: 'oauth-session' };
    mockSignInWithOAuth.mockResolvedValue({
      data: { url: 'https://accounts.google.com/o/oauth2/v2/auth' },
      error: null,
    });
    mockOpenAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'authenticcdc://auth/callback#access_token=access-token&refresh_token=refresh-token',
    });
    mockSetSession.mockResolvedValue({
      data: { session },
      error: null,
    });

    await expect(authService.signInWithGoogle()).resolves.toBe(session);
    expect(mockSignInWithNativeGoogle).not.toHaveBeenCalled();
    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'authenticcdc://auth/callback',
        skipBrowserRedirect: true,
      },
    });
    expect(mockOpenAuthSessionAsync).toHaveBeenCalledWith(
      'https://accounts.google.com/o/oauth2/v2/auth',
      'authenticcdc://auth/callback',
    );
  });
});
