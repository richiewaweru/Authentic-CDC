const mockConfigure = jest.fn();
const mockHasPlayServices = jest.fn();
const mockSignIn = jest.fn();
const mockSignInWithIdToken = jest.fn();
const mockGetGoogleWebClientId = jest.fn(() => 'google-web-client-id');

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: mockConfigure,
    hasPlayServices: mockHasPlayServices,
    signIn: mockSignIn,
  },
  isCancelledResponse: (response: { type: string }) => response.type === 'cancelled',
  isSuccessResponse: (response: { type: string }) => response.type === 'success',
}));

jest.mock('../src/config/env', () => ({
  getGoogleWebClientId: () => mockGetGoogleWebClientId(),
}));

jest.mock('../src/config/supabase', () => ({
  supabase: {
    auth: {
      signInWithIdToken: (...args: unknown[]) => mockSignInWithIdToken(...args),
    },
  },
}));

describe('signInWithNativeGoogle', () => {
  beforeEach(() => {
    jest.resetModules();
    mockConfigure.mockReset();
    mockHasPlayServices.mockReset();
    mockSignIn.mockReset();
    mockSignInWithIdToken.mockReset();
    mockGetGoogleWebClientId.mockReset();
    mockGetGoogleWebClientId.mockReturnValue('google-web-client-id');
  });

  it('signs in with the Google ID token and returns the Supabase session', async () => {
    const session = { access_token: 'session-token' };
    mockSignIn.mockResolvedValue({
      type: 'success',
      data: {
        idToken: 'google-id-token',
        scopes: ['email', 'profile'],
        serverAuthCode: null,
        user: {
          email: 'test@example.com',
          familyName: null,
          givenName: null,
          id: 'google-user',
          name: 'Test User',
          photo: null,
        },
      },
    });
    mockSignInWithIdToken.mockResolvedValue({
      data: { session },
      error: null,
    });

    const { signInWithNativeGoogle } = require('../src/services/nativeGoogleAuth');

    await expect(signInWithNativeGoogle()).resolves.toBe(session);
    expect(mockConfigure).toHaveBeenCalledWith({
      webClientId: 'google-web-client-id',
      offlineAccess: false,
    });
    expect(mockHasPlayServices).toHaveBeenCalledWith({
      showPlayServicesUpdateDialog: true,
    });
    expect(mockSignInWithIdToken).toHaveBeenCalledWith({
      provider: 'google',
      token: 'google-id-token',
    });
  });

  it('returns null when the user cancels Google sign-in', async () => {
    mockSignIn.mockResolvedValue({ type: 'cancelled' });

    const { signInWithNativeGoogle } = require('../src/services/nativeGoogleAuth');

    await expect(signInWithNativeGoogle()).resolves.toBeNull();
    expect(mockSignInWithIdToken).not.toHaveBeenCalled();
  });
});
