import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import type { AuthChangeEvent, Provider, Session, User } from '@supabase/supabase-js';

import { supabase } from '../config/supabase';
import { getAppScheme, getSlotDataSource } from '../config/env';
import type { AuthUser, EmailAuthResult } from '../types/auth';
import { buildDisplayNameFromEmail, parseAuthCallbackUrl } from './authUtils';
import { signInWithNativeGoogle } from './nativeGoogleAuth';

WebBrowser.maybeCompleteAuthSession();

type SupportedProvider = 'google' | 'apple';
type AuthChangeHandler = (event: AuthChangeEvent, session: Session | null) => void;
const EMAIL_TRIGGERS_ENABLED = getSlotDataSource() === 'supabase';

function buildEmailFirstName(email: string) {
  return email.split('@')[0] || 'there';
}

async function fireWelcomeEmail(email: string) {
  if (!EMAIL_TRIGGERS_ENABLED || !email) {
    return;
  }

  try {
    await supabase.functions.invoke('send-member-email', {
      body: {
        type: 'welcome',
        userEmail: email,
        firstName: buildEmailFirstName(email),
      },
    });
  } catch (error) {
    console.warn('[Email] Welcome email failed:', error);
  }
}

async function maybeSendWelcomeEmailForOAuthSession(session: Session | null, provider: SupportedProvider) {
  if (!session?.user?.email || provider !== 'google') {
    return;
  }

  try {
    const createdAt = session.user.created_at ? new Date(session.user.created_at).getTime() : null;
    const lastSignInAt = session.user.last_sign_in_at
      ? new Date(session.user.last_sign_in_at).getTime()
      : null;
    const firstSignIn =
      createdAt !== null &&
      lastSignInAt !== null &&
      Math.abs(lastSignInAt - createdAt) < 60 * 1000;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('onboarding_complete')
      .eq('id', session.user.id)
      .single();

    if (error) {
      return;
    }

    if (!firstSignIn || profile?.onboarding_complete) {
      return;
    }

    await fireWelcomeEmail(session.user.email);
  } catch (error) {
    console.warn('[Auth] Could not determine whether to send the welcome email:', error);
  }
}

export function mapSupabaseUser(user: User | null): AuthUser | null {
  if (!user) {
    return null;
  }

  const rawProviders = user.app_metadata?.providers;
  const providers = Array.isArray(rawProviders)
    ? rawProviders.filter((provider): provider is string => typeof provider === 'string')
    : [];

  return {
    id: user.id,
    email: user.email ?? null,
    displayName:
      (typeof user.user_metadata?.display_name === 'string' && user.user_metadata.display_name) ||
      (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
      null,
    providers,
  };
}

function getRedirectUrl() {
  return AuthSession.makeRedirectUri({
    scheme: getAppScheme(),
    path: 'auth/callback',
  });
}

function clearWebAuthCallbackUrl() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return;
  }

  window.history.replaceState({}, window.document.title, '/');
}

async function consumePendingWebAuthSession() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null;
  }

  const callback = parseAuthCallbackUrl(window.location.href);

  if (callback.error) {
    clearWebAuthCallbackUrl();
    throw new Error(callback.errorDescription ?? callback.error);
  }

  if (callback.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(callback.code);

    clearWebAuthCallbackUrl();

    if (error) {
      throw error;
    }

    void maybeSendWelcomeEmailForOAuthSession(data.session, 'google');
    return data.session;
  }

  if (callback.accessToken && callback.refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: callback.accessToken,
      refresh_token: callback.refreshToken,
    });

    clearWebAuthCallbackUrl();

    if (error) {
      throw error;
    }

    void maybeSendWelcomeEmailForOAuthSession(data.session, 'google');
    return data.session;
  }

  return null;
}

async function completeOAuthSession(provider: SupportedProvider) {
  if (provider === 'apple' && Platform.OS !== 'ios') {
    throw new Error('Apple Sign-In is only available on iOS for this setup.');
  }

  const redirectTo = getRedirectUrl();

  if (Platform.OS === 'web') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo,
      },
    });

    if (error) {
      throw error;
    }

    return null;
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as Provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw error;
  }

  if (!data?.url) {
    throw new Error('Unable to start authentication with the selected provider.');
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== 'success' || !result.url) {
    throw new Error('Authentication was cancelled before completion.');
  }

  const callback = parseAuthCallbackUrl(result.url);

  if (callback.error) {
    throw new Error(callback.errorDescription ?? callback.error);
  }

  if (callback.code) {
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      callback.code,
    );

    if (exchangeError) {
      throw exchangeError;
    }

    void maybeSendWelcomeEmailForOAuthSession(sessionData.session, provider);
    return sessionData.session;
  }

  if (callback.accessToken && callback.refreshToken) {
    const { data: sessionData, error: setSessionError } = await supabase.auth.setSession({
      access_token: callback.accessToken,
      refresh_token: callback.refreshToken,
    });

    if (setSessionError) {
      throw setSessionError;
    }

    void maybeSendWelcomeEmailForOAuthSession(sessionData.session, provider);
    return sessionData.session;
  }

  const { data: sessionResult } = await supabase.auth.getSession();
  void maybeSendWelcomeEmailForOAuthSession(sessionResult.session, provider);
  return sessionResult.session;
}

export const authService = {
  async completePendingAuthSession() {
    return consumePendingWebAuthSession();
  },

  async signUpWithEmail(email: string, password: string): Promise<EmailAuthResult> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://app.authenticcdc.com/auth/confirm',
        data: {
          display_name: buildDisplayNameFromEmail(email),
        },
      },
    });

    if (error) {
      throw error;
    }

    return {
      session: data.session,
      user: data.user,
      needsEmailConfirmation: Boolean(data.user && !data.session),
    };
  },

  async signInWithEmail(email: string, password: string): Promise<EmailAuthResult> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return {
      session: data.session,
      user: data.user,
      needsEmailConfirmation: false,
    };
  },

  async resendSignupConfirmation(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      throw error;
    }
  },

  async signInWithGoogle() {
    if (Platform.OS === 'android') {
      return signInWithNativeGoogle();
    }

    return completeOAuthSession('google');
  },

  async signInWithApple() {
    return completeOAuthSession('apple');
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return data.session;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut({ scope: 'local' });

    if (error) {
      throw error;
    }
  },

  subscribeToAuthChanges(handler: AuthChangeHandler) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handler);

    return () => subscription.unsubscribe();
  },
};
