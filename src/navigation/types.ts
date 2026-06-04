export type AuthStackParamList = {
  Welcome: undefined;
  Auth: { mode?: 'join' | 'signIn' } | undefined;
};

export type OnboardingStackParamList = {
  Onboarding: undefined;
};

export type BookingStackParamList = {
  ProfileReady: undefined;
  ConversationInfo: undefined;
  ChooseSlot: undefined;
  ConfirmBooking: undefined;
  BookingConfirmed: undefined;
  PendingHome: undefined;
};
