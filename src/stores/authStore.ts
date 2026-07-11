import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { clearOnboardingProgress } from '../lib/onboardingStorage';
import { authService, mapSupabaseUser } from '../services/authService';
import { sendBookingCancellationEmail } from '../services/memberEmailService';
import { releaseSlot } from '../services/slotService';
import { BookingRecord, BookingSelection } from '../types/booking';
import type { AuthUser, ProfileStatus, UserState } from '../types/auth';
import { formatDateForEmail, formatTimeForEmail } from '../utils/date';

interface AuthState {
  hasHydrated: boolean;
  authReady: boolean;
  isAuthenticated: boolean;
  session: Session | null;
  user: AuthUser | null;
  userState: UserState | null;
  persistedAuthUserId: string | null;
  onboardingComplete: boolean;
  bookingSelection: BookingSelection | null;
  confirmedBooking: BookingRecord | null;
  setHydrated: (value: boolean) => void;
  setAuthReady: (value: boolean) => void;
  setSession: (session: Session | null, profileStatus?: ProfileStatus | null) => void;
  setProfileStatus: (profileStatus: ProfileStatus) => void;
  signOut: () => Promise<void>;
  setBookingSelection: (selection: BookingSelection | null) => void;
  confirmBooking: (booking: BookingRecord) => void;
  setConfirmedBooking: (booking: BookingRecord | null) => void;
  clearBooking: () => void;
  rescheduleBooking: () => Promise<void>;
}

const initialState = {
  authReady: false,
  isAuthenticated: false,
  session: null,
  user: null,
  userState: null,
  persistedAuthUserId: null,
  onboardingComplete: false,
  bookingSelection: null,
  confirmedBooking: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      ...initialState,
      setHydrated: (value) => set({ hasHydrated: value }),
      setAuthReady: (value) => set({ authReady: value }),
      setSession: (session, profileStatus = null) =>
        set((state) => {
          const user = mapSupabaseUser(session?.user ?? null);
          const nextUserId = user?.id ?? null;
          const changedUser = nextUserId !== state.persistedAuthUserId;

          if (!session || !user) {
            return {
              session: null,
              isAuthenticated: false,
              user: null,
              userState: null,
              persistedAuthUserId: null,
              onboardingComplete: false,
              bookingSelection: null,
              confirmedBooking: null,
            };
          }

          return {
            session,
            isAuthenticated: true,
            user,
            userState: profileStatus?.userState ?? (changedUser ? null : state.userState),
            persistedAuthUserId: nextUserId,
            onboardingComplete:
              profileStatus?.onboardingComplete ?? (changedUser ? false : state.onboardingComplete),
            bookingSelection: changedUser ? null : state.bookingSelection,
            confirmedBooking: changedUser ? null : state.confirmedBooking,
          };
        }),
      setProfileStatus: (profileStatus) =>
        set((state) => ({
          onboardingComplete: profileStatus.onboardingComplete,
          userState: profileStatus.userState,
          persistedAuthUserId: state.user?.id ?? state.persistedAuthUserId,
        })),
      signOut: async () => {
        const userId = get().persistedAuthUserId;
        await authService.signOut();
        if (userId) {
          await clearOnboardingProgress(userId);
        }
        set({
          ...initialState,
          hasHydrated: true,
          authReady: true,
        });
      },
      setBookingSelection: (selection) => set({ bookingSelection: selection }),
      confirmBooking: (booking) => set({ confirmedBooking: booking }),
      setConfirmedBooking: (booking) => set({ confirmedBooking: booking }),
      clearBooking: () => set({ bookingSelection: null, confirmedBooking: null }),
      rescheduleBooking: async () => {
        const booking = get().confirmedBooking;
        const user = get().user;

        if (!booking) {
          return;
        }

        if (booking.slotId) {
          const bookingSnapshot = {
            userEmail: user?.email ?? '',
            firstName: user?.displayName?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there',
            guideName: booking.guide.name,
            slotDate: formatDateForEmail(booking.slot.date),
            slotTime: formatTimeForEmail(booking.slot.time),
          };

          await releaseSlot(booking.slotId, 'Member rescheduled');
          const emailPromise = sendBookingCancellationEmail(bookingSnapshot);

          if (emailPromise) {
            void emailPromise.catch((err) =>
              console.error('Reschedule cancellation email failed:', err),
            );
          }
        }

        set({ confirmedBooking: null, bookingSelection: null });
      },
    }),
    {
      name: 'authentic-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        persistedAuthUserId: state.persistedAuthUserId,
        onboardingComplete: state.onboardingComplete,
        bookingSelection: state.bookingSelection,
        confirmedBooking: state.confirmedBooking,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
