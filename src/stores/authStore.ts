import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { BookingRecord, BookingSelection } from '../types/booking';
import { MockUser } from '../mocks/auth';

interface AuthState {
  hasHydrated: boolean;
  isAuthenticated: boolean;
  user: MockUser | null;
  onboardingComplete: boolean;
  bookingSelection: BookingSelection | null;
  confirmedBooking: BookingRecord | null;
  setHydrated: (value: boolean) => void;
  signIn: (user: MockUser) => void;
  signOut: () => void;
  completeOnboarding: () => void;
  setBookingSelection: (selection: BookingSelection | null) => void;
  confirmBooking: (booking: BookingRecord) => void;
  clearBooking: () => void;
}

const initialState = {
  isAuthenticated: false,
  user: null,
  onboardingComplete: false,
  bookingSelection: null,
  confirmedBooking: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      ...initialState,
      setHydrated: (value) => set({ hasHydrated: value }),
      signIn: (user) =>
        set({
          isAuthenticated: true,
          user,
        }),
      signOut: () =>
        set({
          ...initialState,
        }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      setBookingSelection: (selection) => set({ bookingSelection: selection }),
      confirmBooking: (booking) => set({ confirmedBooking: booking }),
      clearBooking: () => set({ bookingSelection: null, confirmedBooking: null }),
    }),
    {
      name: 'authentic-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
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
