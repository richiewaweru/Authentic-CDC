import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../theme';
import { useAuthStore } from '../stores/authStore';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { AuthScreen } from '../screens/auth/AuthScreen';
import { OnboardingFlow } from '../screens/onboarding/OnboardingFlow';
import { ProfileReadyScreen } from '../screens/booking/ProfileReadyScreen';
import { ConversationInfoScreen } from '../screens/booking/ConversationInfoScreen';
import { ChooseSlotScreen } from '../screens/booking/ChooseSlotScreen';
import { ConfirmBookingScreen } from '../screens/booking/ConfirmBookingScreen';
import { BookingConfirmedScreen } from '../screens/booking/BookingConfirmedScreen';
import { PendingHomeScreen } from '../screens/booking/PendingHomeScreen';
import { AuthStackParamList, BookingStackParamList, OnboardingStackParamList } from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const BookingStack = createNativeStackNavigator<BookingStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen component={WelcomeScreen} name="Welcome" />
      <AuthStack.Screen component={AuthScreen} name="Auth" />
    </AuthStack.Navigator>
  );
}

function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
      <OnboardingStack.Screen component={OnboardingFlow} name="Onboarding" />
    </OnboardingStack.Navigator>
  );
}

function BookingNavigator() {
  const confirmedBooking = useAuthStore((state) => state.confirmedBooking);

  return (
    <BookingStack.Navigator
      initialRouteName={confirmedBooking ? 'PendingHome' : 'ProfileReady'}
      screenOptions={{ headerShown: false }}
    >
      <BookingStack.Screen component={ProfileReadyScreen} name="ProfileReady" />
      <BookingStack.Screen component={ConversationInfoScreen} name="ConversationInfo" />
      <BookingStack.Screen component={ChooseSlotScreen} name="ChooseSlot" />
      <BookingStack.Screen component={ConfirmBookingScreen} name="ConfirmBooking" />
      <BookingStack.Screen component={BookingConfirmedScreen} name="BookingConfirmed" />
      <BookingStack.Screen component={PendingHomeScreen} name="PendingHome" />
    </BookingStack.Navigator>
  );
}

export function RootNavigator() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const onboardingComplete = useAuthStore((state) => state.onboardingComplete);

  if (!hasHydrated) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  if (!onboardingComplete) {
    return <OnboardingNavigator />;
  }

  return <BookingNavigator />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
