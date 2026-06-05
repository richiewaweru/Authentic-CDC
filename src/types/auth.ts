import type { Session, User } from '@supabase/supabase-js';

export type UserState =
  | 'authenticated'
  | 'onboarding_incomplete'
  | 'onboarding_complete'
  | 'conversation_scheduled'
  | 'conversation_approved'
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
  userState: UserState;
}

export interface EmailAuthResult {
  session: Session | null;
  user: User | null;
  needsEmailConfirmation: boolean;
}
