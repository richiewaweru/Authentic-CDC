describe('env helpers', () => {
  const originalEnv = process.env;

  function loadEnvModule() {
    jest.resetModules();
    return require('../src/config/env') as typeof import('../src/config/env');
  }

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns the Google web client id when configured', () => {
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = 'google-web-client-id';
    const { getGoogleWebClientId } = loadEnvModule();

    expect(getGoogleWebClientId()).toBe('google-web-client-id');
  });

  it('throws when the Google web client id is missing', () => {
    delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    const { getGoogleWebClientId } = loadEnvModule();

    expect(() => getGoogleWebClientId()).toThrow(
      'Missing required environment variable: EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
    );
  });
});
