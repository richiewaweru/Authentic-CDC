import { buildDisplayNameFromEmail, parseAuthCallbackUrl } from '../src/services/authUtils';

describe('auth utils', () => {
  it('parses PKCE callback URLs', () => {
    const parsed = parseAuthCallbackUrl('authenticcdc://auth/callback?code=abc123');

    expect(parsed.code).toBe('abc123');
    expect(parsed.accessToken).toBeNull();
  });

  it('parses token callback fragments', () => {
    const parsed = parseAuthCallbackUrl(
      'authenticcdc://auth/callback#access_token=token123&refresh_token=refresh456',
    );

    expect(parsed.accessToken).toBe('token123');
    expect(parsed.refreshToken).toBe('refresh456');
  });

  it('builds a display name from an email address', () => {
    expect(buildDisplayNameFromEmail('richie.waweru@example.com')).toBe('Richie Waweru');
  });
});
