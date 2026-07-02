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

jest.mock('../src/utils/dialogs', () => ({
  showErrorDialog: jest.fn(),
}));

jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');

  return function MockDateTimePicker(props: { onChange: (_event: unknown, date?: Date) => void }) {
    return (
      <TouchableOpacity
        accessibilityLabel="Mock date picker"
        onPress={() => props.onChange({}, new Date('1990-01-01T00:00:00.000Z'))}
      >
        <Text>Mock date picker</Text>
      </TouchableOpacity>
    );
  };
});

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
import { showErrorDialog } from '../src/utils/dialogs';

describe('OnboardingFlow', () => {
  let consoleErrorSpy: jest.SpyInstance;
  const mockSaveCompletedOnboarding = jest.requireMock('../src/services/onboardingService')
    .onboardingService.saveCompletedOnboarding as jest.Mock;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockSaveCompletedOnboarding.mockReset();
    mockedPersistence.saveProgress.mockClear();
    mockedPersistence.restoreProgress.mockResolvedValue(null);
    mockedPersistence.clearProgress.mockClear();
    mockAuthState.signOut.mockClear();
    mockAuthState.setProfileStatus.mockClear();
    (showErrorDialog as jest.Mock).mockClear();
    mockSaveCompletedOnboarding.mockResolvedValue({
      onboardingComplete: true,
      userState: 'onboarding_complete',
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('starts on the personal profile step and blocks continue until required fields are present', async () => {
    const { getByText, queryByText } = render(
      <OnboardingFlow navigation={{ goBack: jest.fn(), navigate: jest.fn() } as never} route={{} as never} />,
    );

    await waitFor(() => {
      expect(getByText("Let's get to know you")).toBeTruthy();
    });

    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(getByText('Please enter your first name.')).toBeTruthy();
    });
    expect(queryByText('Relationship Intentions')).toBeNull();
  }, 10000);

  it('routes future hopes validation back to Future Vision with inline messaging', async () => {
    const { getByText, getByLabelText, getAllByText } = render(
      <OnboardingFlow navigation={{ goBack: jest.fn(), navigate: jest.fn() } as never} route={{} as never} />,
    );

    await waitFor(() => {
      expect(getByText("Let's get to know you")).toBeTruthy();
    });

    fireEvent.changeText(getByLabelText('First name'), 'Ada');
    fireEvent.press(getByText('Woman'));
    fireEvent.press(getByLabelText('Date of birth'));
    fireEvent.press(getByText('Mock date picker'));
    fireEvent.press(getByText('Continue'));
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

    await waitFor(() => {
      expect(getByText('Share a short note about what you hope for.')).toBeTruthy();
      expect(getAllByText('Future Vision').length).toBeGreaterThan(0);
    });
  }, 10000);

  it('routes mapped save errors back to the requested onboarding step', async () => {
    const error = Object.assign(new Error('Review your distance preference.'), {
      action: 'goToStep',
      step: 'preferences',
      code: '23502',
    });
    mockSaveCompletedOnboarding.mockRejectedValue(error);

    const { getByText, getByLabelText, getByPlaceholderText, getAllByText } = render(
      <OnboardingFlow navigation={{ goBack: jest.fn(), navigate: jest.fn() } as never} route={{} as never} />,
    );

    await waitFor(() => {
      expect(getByText("Let's get to know you")).toBeTruthy();
    });

    fireEvent.changeText(getByLabelText('First name'), 'Ada');
    fireEvent.press(getByText('Woman'));
    fireEvent.press(getByLabelText('Date of birth'));
    fireEvent.press(getByText('Mock date picker'));
    fireEvent.press(getByText('Continue'));
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
    fireEvent.changeText(getByPlaceholderText('Share your hopes for the future...'), 'A faithful home.');
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(getByText('Preferences & Stay Connected')).toBeTruthy();
    });

    fireEvent.press(getByText('Complete Alignment Profile'));

    await waitFor(() => {
      expect(getAllByText('Preferences').length).toBeGreaterThan(0);
      expect(getByText('Review your distance preference.')).toBeTruthy();
      expect(showErrorDialog).toHaveBeenCalledWith(
        'Could not complete your Alignment Profile',
        'Review your distance preference.',
      );
    });
  }, 10000);

  it('signs out when save errors require reauthentication', async () => {
    const error = Object.assign(new Error('Your session has expired. Please sign in again.'), {
      action: 'reauth',
      code: 'PGRST301',
    });
    mockSaveCompletedOnboarding.mockRejectedValue(error);

    const { getByText, getByLabelText, getByPlaceholderText } = render(
      <OnboardingFlow navigation={{ goBack: jest.fn(), navigate: jest.fn() } as never} route={{} as never} />,
    );

    await waitFor(() => {
      expect(getByText("Let's get to know you")).toBeTruthy();
    });

    fireEvent.changeText(getByLabelText('First name'), 'Ada');
    fireEvent.press(getByText('Woman'));
    fireEvent.press(getByLabelText('Date of birth'));
    fireEvent.press(getByText('Mock date picker'));
    fireEvent.press(getByText('Continue'));
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
    fireEvent.changeText(getByPlaceholderText('Share your hopes for the future...'), 'A faithful home.');
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(getByText('Preferences & Stay Connected')).toBeTruthy();
    });

    fireEvent.press(getByText('Complete Alignment Profile'));

    await waitFor(() => {
      expect(mockAuthState.signOut).toHaveBeenCalled();
      expect(showErrorDialog).toHaveBeenCalledWith(
        'Could not complete your Alignment Profile',
        'Your session has expired. Please sign in again.',
      );
    });
  }, 10000);
});
