export type AuthStackParamList = {
  Welcome: undefined;
  Auth: { mode?: 'join' | 'signIn' } | undefined;
  CheckYourEmail: { email: string };
  ConfirmEmail: { token_hash?: string; type?: string; email?: string };
  LegalStewardship: undefined;
  LegalCommunityValues: undefined;
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
  CommunityHome: undefined;
};

export type CommunityTabParamList = {
  Home: undefined;
  Events: undefined;
  Foundations: undefined;
  Profile: undefined;
};

export type CommunityStackParamList = {
  CommunityTabs: undefined;
  EventDetail: { eventId: string };
  ReadingDetail: { readingId: string };
  EditProfile: undefined;
};
