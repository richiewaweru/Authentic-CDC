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

  it('defaults the slot data source to supabase', () => {
    delete process.env.EXPO_PUBLIC_SLOT_DATA_SOURCE;
    const { getSlotDataSource } = loadEnvModule();

    expect(getSlotDataSource()).toBe('supabase');
  });

  it('returns mock when the slot data source env is set to mock', () => {
    process.env.EXPO_PUBLIC_SLOT_DATA_SOURCE = 'mock';
    const { getSlotDataSource } = loadEnvModule();

    expect(getSlotDataSource()).toBe('mock');
  });

  it('throws when the slot data source env is invalid', () => {
    process.env.EXPO_PUBLIC_SLOT_DATA_SOURCE = 'invalid';
    const { getSlotDataSource } = loadEnvModule();

    expect(() => getSlotDataSource()).toThrow(
      'Invalid EXPO_PUBLIC_SLOT_DATA_SOURCE value. Expected "mock" or "supabase".',
    );
  });
});
