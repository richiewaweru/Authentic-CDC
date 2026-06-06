const APP_SCHEME_FALLBACK = 'authenticcdc';

function getRequiredSupabaseUrl() {
  const value = process.env.EXPO_PUBLIC_SUPABASE_URL;

  if (!value) {
    throw new Error('Missing required environment variable: EXPO_PUBLIC_SUPABASE_URL');
  }

  return value;
}

function getRequiredSupabasePublishableKey() {
  const value = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!value) {
    throw new Error('Missing required environment variable: EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  }

  return value;
}

export function getGoogleWebClientId() {
  const value = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  if (!value) {
    throw new Error('Missing required environment variable: EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
  }

  return value;
}

export function getAppScheme() {
  return process.env.EXPO_PUBLIC_APP_SCHEME ?? APP_SCHEME_FALLBACK;
}

export function getSupabasePublicConfig() {
  return {
    url: getRequiredSupabaseUrl(),
    publishableKey: getRequiredSupabasePublishableKey(),
  };
}
