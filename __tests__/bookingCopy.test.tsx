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

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    LinearGradient: ({
      children,
      style,
    }: {
      children?: React.ReactNode;
      style?: unknown;
    }) => <View style={style}>{children}</View>,
  };
});

const mockStoreState = {
  bookingSelection: null as any,
  confirmedBooking: null as any,
  confirmBooking: jest.fn(),
  rescheduleBooking: jest.fn(),
  setBookingSelection: jest.fn(),
  signOut: jest.fn(),
};

jest.mock('../src/stores/authStore', () => ({
  useAuthStore: (selector: (state: typeof mockStoreState) => unknown) => selector(mockStoreState),
}));

jest.mock('../src/services/slotService', () => ({
  bookSlot: jest.fn(),
  fetchAvailableSlots: jest.fn(),
  fetchGuides: jest.fn(),
  releaseSlot: jest.fn(),
}));

import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { mockGuides } from '../src/mocks/guides';
import { mockSlots } from '../src/mocks/slots';
import { ConfirmBookingScreen } from '../src/screens/booking/ConfirmBookingScreen';
import { PendingHomeScreen } from '../src/screens/booking/PendingHomeScreen';
import { ProfileReadyScreen } from '../src/screens/booking/ProfileReadyScreen';

describe('booking copy updates', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    alertSpy = jest.spyOn(require('react-native').Alert, 'alert').mockImplementation(jest.fn());
    mockStoreState.bookingSelection = null;
    mockStoreState.confirmedBooking = null;
    mockStoreState.confirmBooking.mockReset();
    mockStoreState.rescheduleBooking.mockReset();
    mockStoreState.setBookingSelection.mockReset();
    mockStoreState.signOut.mockReset();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it('renders the configurable $10 Confirmation Fee copy without numbered step labels', () => {
    mockStoreState.bookingSelection = {
      guide: mockGuides[0],
      slot: mockSlots[0],
    };

    const { getByText, queryByText, getAllByText } = render(
      <ConfirmBookingScreen
        navigation={{ goBack: jest.fn(), navigate: jest.fn() } as never}
        route={{ key: 'ConfirmBooking-test', name: 'ConfirmBooking' } as never}
      />,
    );

    expect(getAllByText('Confirm Your Place').length).toBeGreaterThan(0);
    expect(getByText('Confirmation Fee')).toBeTruthy();
    expect(getAllByText('$10')).toHaveLength(2);
    expect(queryByText(/Step \d of \d/i)).toBeNull();
  });

  it('shows Pending Access status tracking and aligned locked preview cards', () => {
    mockStoreState.confirmedBooking = {
      guide: mockGuides[0],
      slot: mockSlots[0],
      endTime: '9:15 AM',
      slotId: mockSlots[0].id,
      status: 'confirmed',
    };

    const { getByText, queryByText } = render(
      <PendingHomeScreen
        navigation={{ goBack: jest.fn(), navigate: jest.fn() } as never}
        route={{ key: 'PendingHome-test', name: 'PendingHome' } as never}
      />,
    );

    expect(getByText('Pending Access')).toBeTruthy();
    expect(getByText('Account Created')).toBeTruthy();
    expect(getByText('Alignment Profile Complete')).toBeTruthy();
    expect(getByText('Confirmation Fee Received')).toBeTruthy();
    expect(getByText('Alignment Conversation Scheduled')).toBeTruthy();
    expect(getByText('Pending Community Access')).toBeTruthy();
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Events')).toBeTruthy();
    expect(getByText('Foundations')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
    expect(queryByText('PROFILE COMPLETION: 20%')).toBeNull();
  });

  it('shows the profile review alert and confirms sign-out on Profile Ready', async () => {
    const { getByText, getByLabelText } = render(
      <ProfileReadyScreen
        navigation={{ goBack: jest.fn(), navigate: jest.fn() } as never}
        route={{ key: 'ProfileReady-test', name: 'ProfileReady' } as never}
      />,
    );

    fireEvent.press(getByText('Review Alignment Profile'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Alignment Profile',
      'Your full Alignment Profile will be available to review and edit in your Profile tab once Community Access is granted.',
    );

    fireEvent.press(getByLabelText('Sign out'));

    const signOutButtons = alertSpy.mock.calls[1]?.[2];
    await signOutButtons?.[1]?.onPress?.();

    expect(mockStoreState.signOut).toHaveBeenCalledTimes(1);
  });

  it('confirms sign-out from Pending Access', async () => {
    mockStoreState.confirmedBooking = {
      guide: mockGuides[0],
      slot: mockSlots[0],
      endTime: '9:15 AM',
      slotId: mockSlots[0].id,
      status: 'confirmed',
    };

    const { getByLabelText } = render(
      <PendingHomeScreen
        navigation={{ goBack: jest.fn(), navigate: jest.fn() } as never}
        route={{ key: 'PendingHome-test', name: 'PendingHome' } as never}
      />,
    );

    fireEvent.press(getByLabelText('Sign out'));

    const signOutButtons = alertSpy.mock.calls[0]?.[2];
    await signOutButtons?.[1]?.onPress?.();

    expect(mockStoreState.signOut).toHaveBeenCalledTimes(1);
  });
});
