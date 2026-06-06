import type { Session } from '@supabase/supabase-js';
import {
  GoogleSignin,
  isCancelledResponse,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';

import { getGoogleWebClientId } from '../config/env';
import { supabase } from '../config/supabase';

let configured = false;

function configureGoogleSignIn() {
  if (configured) {
    return;
  }

  GoogleSignin.configure({
    webClientId: getGoogleWebClientId(),
    offlineAccess: false,
  });

  configured = true;
}

export async function signInWithNativeGoogle(): Promise<Session | null> {
  configureGoogleSignIn();

  await GoogleSignin.hasPlayServices({
    showPlayServicesUpdateDialog: true,
  });

  const response = await GoogleSignin.signIn();

  if (isCancelledResponse(response)) {
    return null;
  }

  if (!isSuccessResponse(response)) {
    throw new Error('Google sign-in did not complete successfully.');
  }

  const idToken = response.data.idToken;

  if (!idToken) {
    throw new Error('Google did not return an ID token.');
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });

  if (error) {
    throw error;
  }

  return data.session;
}
