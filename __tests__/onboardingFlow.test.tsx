const mockedPersistence = {
  saveProgress: jest.fn().mockResolvedValue(undefined),
  restoreProgress: jest.fn().mockResolvedValue(null),
  clearProgress: jest.fn().mockResolvedValue(undefined),
};

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

jest.mock('../src/hooks/useOnboardingPersistence', () => ({
  useOnboardingPersistence: () => mockedPersistence,
}));

jest.mock('../src/services/onboardingService', () => ({
  onboardingService: {
    saveCompletedOnboarding: jest.fn(),
  },
}));

const mockAuthState = {
  user: { id: 'user-1' },
  signOut: jest.fn(),
  setProfileStatus: jest.fn(),
};

jest.mock('../src/stores/authStore', () => ({
  useAuthStore: (selector: (state: typeof mockAuthState) => unknown) => selector(mockAuthState),
}));

import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { OnboardingFlow } from '../src/screens/onboarding/OnboardingFlow';

describe('OnboardingFlow', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('routes future hopes validation back to Future Vision with inline messaging', async () => {
    const { findByText, getByText, getAllByText } = render(
      <OnboardingFlow navigation={{ goBack: jest.fn(), navigate: jest.fn() } as never} route={{} as never} />,
    );

    await findByText('Build your Alignment Profile');

    fireEvent.press(getByText('Start Alignment Profile'));
    fireEvent.press(getByText('Intentional dating'));
    fireEvent.press(getByText('Continue'));

    fireEvent.press(getByText('Calm & reflective'));
    fireEvent.press(getByText('I prefer calm discussion'));
    fireEvent.press(getByText('Continue'));

    fireEvent.press(getByText('Faith-centered family'));
    fireEvent.press(getByText('Continue'));

    fireEvent.press(getByText('Essential'));
    fireEvent.press(getByText('Weekly active'));
    fireEvent.press(getByText('Continue'));

    fireEvent.press(getByText('Continue'));
    fireEvent.press(getByText('Complete Alignment Profile'));

    await waitFor(() => {
      expect(getByText('Share a short note about what you hope for.')).toBeTruthy();
      expect(getAllByText('Future Vision').length).toBeGreaterThan(0);
    });
  }, 10000);
});
