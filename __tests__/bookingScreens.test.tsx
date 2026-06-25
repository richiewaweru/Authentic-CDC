jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');

  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    useSafeAreaInsets: jest.fn(() => ({ top: 0, right: 0, bottom: 20, left: 0 })),
  };
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

import React from 'react';
import { render } from '@testing-library/react-native';

import { BookingConfirmedScreen } from '../src/screens/booking/BookingConfirmedScreen';
import { PendingHomeScreen } from '../src/screens/booking/PendingHomeScreen';

const mockRescheduleBooking = jest.fn();
const mockSignOut = jest.fn();
let mockStoreState = {
  confirmedBooking: {
    bookingId: 'booking-1',
    slotId: 'slot-1',
    meetingLink: null as string | null,
    startsAt: null as string | null,
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
  },
  rescheduleBooking: mockRescheduleBooking,
  signOut: mockSignOut,
};

jest.mock('../src/stores/authStore', () => ({
  useAuthStore: (selector: (state: typeof mockStoreState) => unknown) => selector(mockStoreState),
}));

describe('booking screens', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-19T20:00:00.000Z'));
    mockRescheduleBooking.mockReset();
    mockSignOut.mockReset();
    mockStoreState = {
      ...mockStoreState,
      confirmedBooking: {
        ...mockStoreState.confirmedBooking,
        meetingLink: null,
        startsAt: null,
      },
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the Google Calendar CTA on the confirmed booking screen', () => {
    const { getByText, queryByText } = render(
      <BookingConfirmedScreen
        navigation={{ goBack: jest.fn(), navigate: jest.fn() } as never}
        route={{ key: 'BookingConfirmed-test', name: 'BookingConfirmed' } as never}
      />,
    );

    expect(getByText('Add to Google Calendar')).toBeTruthy();
    expect(queryByText('Or connect Google Calendar to sync automatically')).toBeNull();
  });

  it('shows the pending meeting-link copy when no meeting link is available', () => {
    const { getByText, queryByText } = render(
      <PendingHomeScreen
        navigation={{ goBack: jest.fn(), navigate: jest.fn() } as never}
        route={{ key: 'PendingHome-test', name: 'PendingHome' } as never}
      />,
    );

    expect(getByText('Your guide will share the meeting link before your scheduled time.')).toBeTruthy();
    expect(queryByText('Join Conversation')).toBeNull();
  });

  it('shows the join button and urgent reminder when the meeting is within an hour', () => {
    mockStoreState = {
      ...mockStoreState,
      confirmedBooking: {
        ...mockStoreState.confirmedBooking,
        meetingLink: 'https://meet.example.com/abc',
        startsAt: '2026-06-19T20:30:00.000Z',
      },
    };

    const { getByText } = render(
      <PendingHomeScreen
        navigation={{ goBack: jest.fn(), navigate: jest.fn() } as never}
        route={{ key: 'PendingHome-test', name: 'PendingHome' } as never}
      />,
    );

    expect(getByText('Join Conversation')).toBeTruthy();
    expect(getByText('Your Alignment Conversation starts in less than an hour')).toBeTruthy();
  });

  it('shows the upcoming reminder when the meeting is tomorrow', () => {
    mockStoreState = {
      ...mockStoreState,
      confirmedBooking: {
        ...mockStoreState.confirmedBooking,
        startsAt: '2026-06-20T08:00:00.000Z',
      },
    };

    const { getByText } = render(
      <PendingHomeScreen
        navigation={{ goBack: jest.fn(), navigate: jest.fn() } as never}
        route={{ key: 'PendingHome-test', name: 'PendingHome' } as never}
      />,
    );

    expect(getByText('Your Alignment Conversation is tomorrow')).toBeTruthy();
  });
});
