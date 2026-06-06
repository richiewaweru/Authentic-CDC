jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock('@expo-google-fonts/inter', () => ({
  Inter_400Regular: 'Inter_400Regular',
  Inter_500Medium: 'Inter_500Medium',
  Inter_600SemiBold: 'Inter_600SemiBold',
  useFonts: jest.fn(() => [true]),
}));

jest.mock('@expo-google-fonts/playfair-display', () => ({
  PlayfairDisplay_600SemiBold: 'PlayfairDisplay_600SemiBold',
  PlayfairDisplay_700Bold: 'PlayfairDisplay_700Bold',
  useFonts: jest.fn(() => [true]),
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');

  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    useSafeAreaInsets: jest.fn(() => ({ top: 0, right: 0, bottom: 20, left: 0 })),
  };
});

jest.mock('../src/navigation/RootNavigator', () => ({
  RootNavigator: () => null,
}));

const mockCompletePendingAuthSession = jest.fn();
const mockGetSession = jest.fn();
const mockSubscribeToAuthChanges = jest.fn();
const mockGetProfileStatus = jest.fn();
const mockSetAuthReady = jest.fn();
const mockSetSession = jest.fn();

jest.mock('../src/services/authService', () => ({
  authService: {
    completePendingAuthSession: (...args: unknown[]) => mockCompletePendingAuthSession(...args),
    getSession: (...args: unknown[]) => mockGetSession(...args),
    subscribeToAuthChanges: (...args: unknown[]) => mockSubscribeToAuthChanges(...args),
  },
}));

jest.mock('../src/services/onboardingService', () => ({
  onboardingService: {
    getProfileStatus: (...args: unknown[]) => mockGetProfileStatus(...args),
  },
}));

jest.mock('../src/stores/authStore', () => ({
  useAuthStore: (selector: (state: { setAuthReady: typeof mockSetAuthReady; setSession: typeof mockSetSession }) => unknown) =>
    selector({
      setAuthReady: mockSetAuthReady,
      setSession: mockSetSession,
    }),
}));

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

import App from '../src/App';

describe('App auth session sync', () => {
  const session = {
    user: {
      id: 'user-1',
    },
  };
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockCompletePendingAuthSession.mockReset();
    mockGetSession.mockReset();
    mockSubscribeToAuthChanges.mockReset();
    mockGetProfileStatus.mockReset();
    mockSetAuthReady.mockReset();
    mockSetSession.mockReset();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('sets the session even when profile status fails during bootstrap', async () => {
    mockCompletePendingAuthSession.mockResolvedValue(null);
    mockGetSession.mockResolvedValue(session);
    mockGetProfileStatus.mockRejectedValue(new Error('profile query failed'));
    mockSubscribeToAuthChanges.mockReturnValue(jest.fn());

    render(<App />);

    await waitFor(() => {
      expect(mockSetSession).toHaveBeenCalledWith(session, null);
      expect(mockSetAuthReady).toHaveBeenCalledWith(true);
    });
  });

  it('falls back to a null profile status when auth change sync throws', async () => {
    let authChangeHandler: ((event: string, nextSession: typeof session | null) => void) | undefined;

    mockCompletePendingAuthSession.mockResolvedValue(null);
    mockGetSession.mockResolvedValue(null);
    mockGetProfileStatus.mockRejectedValue(new Error('profile query failed'));
    mockSubscribeToAuthChanges.mockImplementation((handler) => {
      authChangeHandler = handler;
      return jest.fn();
    });

    render(<App />);

    await waitFor(() => {
      expect(mockSubscribeToAuthChanges).toHaveBeenCalled();
    });

    if (!authChangeHandler) {
      throw new Error('Expected auth change handler to be registered.');
    }

    authChangeHandler('SIGNED_IN', session);

    await waitFor(() => {
      expect(mockSetSession).toHaveBeenCalledWith(session, null);
    });
  });
});
