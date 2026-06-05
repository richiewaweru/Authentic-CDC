import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts as useInterFonts,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
  useFonts as usePlayfairFonts,
} from '@expo-google-fonts/playfair-display';

import { RootNavigator } from './navigation/RootNavigator';
import { authService } from './services/authService';
import { onboardingService } from './services/onboardingService';
import { useAuthStore } from './stores/authStore';
import { colors } from './theme';

WebBrowser.maybeCompleteAuthSession();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.onSurface,
    border: colors.outlineVariant,
    primary: colors.primary,
  },
};

export default function App() {
  const setAuthReady = useAuthStore((state) => state.setAuthReady);
  const setSession = useAuthStore((state) => state.setSession);
  const [interLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  const [playfairLoaded] = usePlayfairFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
  });
  const [authInitializationError, setAuthInitializationError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    const syncSession = async (session: Awaited<ReturnType<typeof authService.getSession>>) => {
      if (!mounted) {
        return;
      }

      if (!session) {
        setSession(null);
        return;
      }

      const profileStatus = await onboardingService.getProfileStatus(session.user.id);

      if (!mounted) {
        return;
      }

      setSession(session, profileStatus);
    };

    const bootstrapAuth = async () => {
      try {
        const callbackSession = await authService.completePendingAuthSession();
        const session = callbackSession ?? (await authService.getSession());

        await syncSession(session);
        unsubscribe = authService.subscribeToAuthChanges((_event, nextSession) => {
          void syncSession(nextSession);
        });
      } catch (error) {
        if (mounted) {
          const message = error instanceof Error ? error.message : 'Unable to initialize authentication.';
          setAuthInitializationError(message);
        }
      } finally {
        if (mounted) {
          setAuthReady(true);
        }
      }
    };

    void bootstrapAuth();

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [setAuthReady, setSession]);

  if (!interLoaded || !playfairLoaded) {
    return (
      <View style={styles.loader}>
        <StatusBar style="dark" />
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (authInitializationError) {
    return (
      <View style={styles.loader}>
        <StatusBar style="dark" />
        <Text style={styles.errorTitle}>Configuration needed</Text>
        <Text style={styles.errorCopy}>{authInitializationError}</Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style="dark" />
      <RootNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    gap: 12,
  },
  errorTitle: {
    color: colors.primaryDark,
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
  },
  errorCopy: {
    color: colors.onSurfaceVariant,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});
