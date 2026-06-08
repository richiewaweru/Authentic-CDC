jest.mock('react-native-safe-area-context', () => {
  const React = require('react');

  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    useSafeAreaInsets: jest.fn(() => ({ top: 0, right: 0, bottom: 20, left: 0 })),
  };
});

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    Ionicons: ({ name }: { name: string }) => <Text>{name}</Text>,
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

const mockSignInWithApple = jest.fn();
const mockSignInWithGoogle = jest.fn();
const mockSignInWithEmail = jest.fn();
const mockSignUpWithEmail = jest.fn();

jest.mock('../src/services/authService', () => ({
  authService: {
    signInWithApple: (...args: unknown[]) => mockSignInWithApple(...args),
    signInWithGoogle: (...args: unknown[]) => mockSignInWithGoogle(...args),
    signInWithEmail: (...args: unknown[]) => mockSignInWithEmail(...args),
    signUpWithEmail: (...args: unknown[]) => mockSignUpWithEmail(...args),
  },
}));

import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor, act } from '@testing-library/react-native';

import { AuthScreen } from '../src/screens/auth/AuthScreen';
import { WelcomeScreen } from '../src/screens/auth/WelcomeScreen';

describe('auth entry screens', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    mockSignInWithApple.mockReset();
    mockSignInWithGoogle.mockReset();
    mockSignInWithEmail.mockReset();
    mockSignUpWithEmail.mockReset();
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it('renders the Authentic logo on the welcome screen', () => {
    const { getByLabelText } = render(
      <WelcomeScreen
        navigation={{ navigate: jest.fn() } as never}
        route={{ key: 'Welcome-test', name: 'Welcome' } as never}
      />,
    );

    expect(getByLabelText('Authentic logo')).toBeTruthy();
  });

  it('renders the Authentic logo on the auth screen', () => {
    const { getByLabelText } = render(
      <AuthScreen
        navigation={{ goBack: jest.fn(), replace: jest.fn() } as never}
        route={{ key: 'Auth-test', name: 'Auth', params: { mode: 'join' } } as never}
      />,
    );

    expect(getByLabelText('Authentic logo')).toBeTruthy();
  });

  it('resets credentials and routes back to sign-in after email confirmation prompt', async () => {
    const navigation = {
      goBack: jest.fn(),
      replace: jest.fn(),
    };

    mockSignUpWithEmail.mockResolvedValue({
      needsEmailConfirmation: true,
      session: null,
      user: { id: 'user-1' },
    });

    const { getByText, getByPlaceholderText } = render(
      <AuthScreen
        navigation={navigation as never}
        route={{ key: 'Auth-test', name: 'Auth', params: { mode: 'join' } } as never}
      />,
    );

    fireEvent.press(getByText('Continue with Email'));
    fireEvent.changeText(getByPlaceholderText('Email address'), 'user@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'supersecret');
    fireEvent.press(getByText('Create Account with Email'));

    await waitFor(() => {
      expect(mockSignUpWithEmail).toHaveBeenCalledWith('user@example.com', 'supersecret');
      expect(alertSpy).toHaveBeenCalled();
    });

    const buttons = alertSpy.mock.calls[0]?.[2];
    expect(buttons).toHaveLength(1);

    await act(async () => {
      buttons?.[0]?.onPress?.();
    });

    await waitFor(() => {
      expect(navigation.replace).toHaveBeenCalledWith('Auth', { mode: 'signIn' });
      expect(getByPlaceholderText('Email address').props.value).toBe('');
      expect(getByPlaceholderText('Password').props.value).toBe('');
    });
  });
});
