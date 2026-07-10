jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('../src/services/nativeGoogleAuth', () => ({
  signInWithNativeGoogle: jest.fn(),
}));

jest.mock('../src/config/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

import { getInitialBookingRoute } from '../src/navigation/RootNavigator';

describe('booking lifecycle navigation', () => {
  const confirmedBooking = {
    bookingId: 'booking-1',
    slotId: 'slot-1',
    endTime: '9:30 AM',
    status: 'confirmed' as const,
    guide: {
      id: 'guide-1',
      name: 'Ada Love',
      title: 'Lead Guide',
      initials: 'AL',
      avatarUrl: null,
    },
    slot: {
      id: 'slot-1',
      guideId: 'guide-1',
      date: '2026-06-20',
      time: '9:00 AM',
      durationMinutes: 30,
    },
  };

  it('routes members with community access to CommunityHome', () => {
    expect(getInitialBookingRoute('community_active', null)).toBe('CommunityHome');
    expect(getInitialBookingRoute('membership_active', null)).toBe('CommunityHome');
    expect(getInitialBookingRoute('full_member', null)).toBe('CommunityHome');
  });

  it('routes completed conversations to PendingHome', () => {
    expect(getInitialBookingRoute('conversation_complete', null)).toBe('PendingHome');
    expect(getInitialBookingRoute('conversation_approved', null)).toBe('PendingHome');
  });

  it('routes confirmed bookings to PendingHome', () => {
    expect(getInitialBookingRoute('booking_confirmed', null)).toBe('PendingHome');
    expect(getInitialBookingRoute('conversation_scheduled', null)).toBe('PendingHome');
    expect(getInitialBookingRoute(null, confirmedBooking)).toBe('PendingHome');
  });

  it('routes onboarded members without bookings to ProfileReady', () => {
    expect(getInitialBookingRoute('onboarding_complete', null)).toBe('ProfileReady');
    expect(getInitialBookingRoute(null, null)).toBe('ProfileReady');
  });
});
