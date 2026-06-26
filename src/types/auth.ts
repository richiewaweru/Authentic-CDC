import type { Session, User } from '@supabase/supabase-js';

export type UserState =
  | 'authenticated'
  | 'onboarding_incomplete'
  | 'onboarding_complete'
  | 'booking_confirmed'
  | 'conversation_scheduled'
  | 'conversation_complete'
  | 'conversation_approved'
  | 'community_active'
  | 'membership_active'
  | 'bylaws_accepted'
  | 'full_member';

export interface AuthUser {
  id: string;
  email: string | null;
  displayName: string | null;
  providers: string[];
}

export interface ProfileStatus {
  onboardingComplete: boolean;
  userState: UserState | null;
}

export interface EmailAuthResult {
  session: Session | null;
  user: User | null;
  needsEmailConfirmation: boolean;
}
