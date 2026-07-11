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

const mockCommunityService = {
  getActiveGuides: jest.fn(),
  getAnnouncements: jest.fn(),
  getEvents: jest.fn(),
  getMyProfile: jest.fn(),
  getReadings: jest.fn(),
  getUpcomingEvents: jest.fn(),
};

jest.mock('../src/services/communityService', () => mockCommunityService);

jest.mock('../src/stores/authStore', () => ({
  useAuthStore: (selector: (state: { user: { id: string } }) => unknown) =>
    selector({ user: { id: 'member-1' } }),
}));

import React from 'react';
import { StyleSheet } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';

import { EventsScreen } from '../src/screens/community/EventsScreen';
import { FoundationsScreen } from '../src/screens/community/FoundationsScreen';
import { HomeScreen } from '../src/screens/community/HomeScreen';
import { ProfileScreen } from '../src/screens/community/ProfileScreen';
import { spacing } from '../src/theme';

const navigation = {
  addListener: jest.fn(() => jest.fn()),
  navigate: jest.fn(),
};

describe('Community Access screens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCommunityService.getActiveGuides.mockResolvedValue([]);
    mockCommunityService.getAnnouncements.mockResolvedValue([]);
    mockCommunityService.getEvents.mockResolvedValue([]);
    mockCommunityService.getMyProfile.mockResolvedValue(null);
    mockCommunityService.getReadings.mockResolvedValue([]);
    mockCommunityService.getUpcomingEvents.mockResolvedValue([]);
  });

  it('renders the Home empty state with a padded, stable card', async () => {
    const { getByTestId, getByText } = render(<HomeScreen navigation={navigation as never} />);

    await waitFor(() => {
      expect(getByText('Welcome to the community.')).toBeTruthy();
    });

    const emptyCardStyle = StyleSheet.flatten(getByTestId('community-home-empty-card').props.style);

    expect(emptyCardStyle.padding).toBe(spacing.lg);
    expect(emptyCardStyle.gap).toBe(spacing.sm);
    expect(emptyCardStyle.minHeight).toBeGreaterThanOrEqual(96);
  });

  it('renders empty states across Events, Foundations, and Profile', async () => {
    const events = render(<EventsScreen navigation={navigation as never} />);

    await waitFor(() => {
      expect(events.getByText('No events yet')).toBeTruthy();
    });
    expect(events.getByText('Upcoming gatherings will appear here once they are published.')).toBeTruthy();
    events.unmount();

    const foundations = render(<FoundationsScreen navigation={navigation as never} />);

    await waitFor(() => {
      expect(foundations.getByText('No readings yet')).toBeTruthy();
    });
    expect(foundations.getByText('Published Foundation pieces will appear here.')).toBeTruthy();
    foundations.unmount();

    const profile = render(<ProfileScreen navigation={navigation as never} />);

    await waitFor(() => {
      expect(profile.getByText('Your active guide details will appear here soon.')).toBeTruthy();
    });
  });
});
