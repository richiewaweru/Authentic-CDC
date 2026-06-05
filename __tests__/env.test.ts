describe('env config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns the configured app scheme', () => {
    process.env.EXPO_PUBLIC_APP_SCHEME = 'authenticcdc-test';
    let envModule: typeof import('../src/config/env');

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      envModule = require('../src/config/env');
    });

    expect(envModule!.getAppScheme()).toBe('authenticcdc-test');
  });

  it('throws when required supabase values are missing', () => {
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    let envModule: typeof import('../src/config/env');

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      envModule = require('../src/config/env');
    });

    expect(() => envModule!.getSupabasePublicConfig()).toThrow(
      'Missing required environment variable: EXPO_PUBLIC_SUPABASE_URL',
    );
  });
});
