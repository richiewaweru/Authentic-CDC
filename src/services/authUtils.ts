export function parseAuthCallbackUrl(url: string) {
  const [base, hash = ''] = url.split('#');
  const parsedUrl = new URL(base);
  const query = parsedUrl.searchParams;
  const fragment = new URLSearchParams(hash);

  return {
    code: query.get('code') ?? fragment.get('code'),
    accessToken: query.get('access_token') ?? fragment.get('access_token'),
    refreshToken: query.get('refresh_token') ?? fragment.get('refresh_token'),
    error: query.get('error') ?? fragment.get('error'),
    errorDescription: query.get('error_description') ?? fragment.get('error_description'),
  };
}

export function buildDisplayNameFromEmail(email: string) {
  const candidate = email.split('@')[0]?.replace(/[._-]+/g, ' ') ?? '';
  return candidate
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
