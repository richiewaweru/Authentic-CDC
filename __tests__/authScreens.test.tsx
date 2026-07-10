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
const mockResendSignupConfirmation = jest.fn();
const mockVerifyOtp = jest.fn();

jest.mock('../src/services/authService', () => ({
  authService: {
    signInWithApple: (...args: unknown[]) => mockSignInWithApple(...args),
    signInWithGoogle: (...args: unknown[]) => mockSignInWithGoogle(...args),
    signInWithEmail: (...args: unknown[]) => mockSignInWithEmail(...args),
    signUpWithEmail: (...args: unknown[]) => mockSignUpWithEmail(...args),
    resendSignupConfirmation: (...args: unknown[]) => mockResendSignupConfirmation(...args),
  },
}));

jest.mock('../src/config/supabase', () => ({
  supabase: {
    auth: {
      verifyOtp: (...args: unknown[]) => mockVerifyOtp(...args),
    },
  },
}));

import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { AuthScreen } from '../src/screens/auth/AuthScreen';
import { CheckYourEmailScreen } from '../src/screens/auth/CheckYourEmailScreen';
import { ConfirmEmailScreen } from '../src/screens/auth/ConfirmEmailScreen';
import { WelcomeScreen } from '../src/screens/auth/WelcomeScreen';

describe('auth entry screens', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    mockSignInWithApple.mockReset();
    mockSignInWithGoogle.mockReset();
    mockSignInWithEmail.mockReset();
    mockSignUpWithEmail.mockReset();
    mockResendSignupConfirmation.mockReset();
    mockVerifyOtp.mockReset();
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

  it('routes to check your email after signup requires confirmation', async () => {
    const navigation = {
      goBack: jest.fn(),
      replace: jest.fn(),
      navigate: jest.fn(),
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
      expect(navigation.navigate).toHaveBeenCalledWith('CheckYourEmail', {
        email: 'user@example.com',
      });
    });
  });

  it('routes to check your email when sign-in returns email not confirmed', async () => {
    const navigation = {
      goBack: jest.fn(),
      replace: jest.fn(),
      navigate: jest.fn(),
    };

    mockSignInWithEmail.mockRejectedValue(new Error('Email not confirmed'));

    const { getByText, getByPlaceholderText } = render(
      <AuthScreen
        navigation={navigation as never}
        route={{ key: 'Auth-test', name: 'Auth', params: { mode: 'signIn' } } as never}
      />,
    );

    fireEvent.press(getByText('Continue with Email'));
    fireEvent.changeText(getByPlaceholderText('Email address'), 'user@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'supersecret');
    fireEvent.press(getByText('Sign In with Email'));

    await waitFor(() => {
      expect(mockSignInWithEmail).toHaveBeenCalledWith('user@example.com', 'supersecret');
      expect(navigation.navigate).toHaveBeenCalledWith('CheckYourEmail', {
        email: 'user@example.com',
      });
      expect(alertSpy).not.toHaveBeenCalled();
    });
  });

  it('renders check your email and handles resend success', async () => {
    mockResendSignupConfirmation.mockResolvedValue(undefined);

    const { getByText } = render(
      <CheckYourEmailScreen
        navigation={{ replace: jest.fn() } as never}
        route={{
          key: 'CheckYourEmail-test',
          name: 'CheckYourEmail',
          params: { email: 'user@example.com' },
        }}
      />,
    );

    expect(getByText('Check your email')).toBeTruthy();
    expect(getByText('user@example.com')).toBeTruthy();

    fireEvent.press(getByText('Resend confirmation email'));

    await waitFor(() => {
      expect(mockResendSignupConfirmation).toHaveBeenCalledWith('user@example.com');
      expect(getByText('Sent - check your inbox.')).toBeTruthy();
      expect(getByText('Resend confirmation email (30)')).toBeTruthy();
    });
  });

  it('shows rate-limit messaging on check your email resend failure', async () => {
    mockResendSignupConfirmation.mockRejectedValue(new Error('rate limit exceeded'));

    const { getByText } = render(
      <CheckYourEmailScreen
        navigation={{ replace: jest.fn() } as never}
        route={{
          key: 'CheckYourEmail-test',
          name: 'CheckYourEmail',
          params: { email: 'user@example.com' },
        }}
      />,
    );

    fireEvent.press(getByText('Resend confirmation email'));

    await waitFor(() => {
      expect(getByText('Please wait a moment before requesting another.')).toBeTruthy();
    });
  });

  it('shows invalid state when confirmation params are missing', async () => {
    const { getByText } = render(
      <ConfirmEmailScreen
        navigation={{ replace: jest.fn() } as never}
        route={{ key: 'ConfirmEmail-test', name: 'ConfirmEmail', params: {} }}
      />,
    );

    await waitFor(() => {
      expect(getByText('Invalid or missing confirmation link.')).toBeTruthy();
      expect(mockVerifyOtp).not.toHaveBeenCalled();
    });
  });

  it('confirms email links with Supabase token hash', async () => {
    mockVerifyOtp.mockResolvedValue({ data: {}, error: null });

    const { getByText } = render(
      <ConfirmEmailScreen
        navigation={{ replace: jest.fn() } as never}
        route={{
          key: 'ConfirmEmail-test',
          name: 'ConfirmEmail',
          params: { token_hash: 'token-hash', type: 'signup' },
        }}
      />,
    );

    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledWith({
        token_hash: 'token-hash',
        type: 'signup',
      });
      expect(getByText("You're confirmed. Redirecting...")).toBeTruthy();
    });
  });

  it('shows Supabase confirmation errors', async () => {
    mockVerifyOtp.mockResolvedValue({
      data: null,
      error: { message: 'This link has already been used' },
    });

    const { getByText } = render(
      <ConfirmEmailScreen
        navigation={{ replace: jest.fn() } as never}
        route={{
          key: 'ConfirmEmail-test',
          name: 'ConfirmEmail',
          params: { token_hash: 'token-hash', type: 'signup' },
        }}
      />,
    );

    await waitFor(() => {
      expect(getByText('This link has already been used')).toBeTruthy();
    });
  });
});
