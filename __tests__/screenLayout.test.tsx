const mockLinearGradient = jest.fn(
  ({ children }: { children?: React.ReactNode }) => children ?? null,
);

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: (props: { children?: React.ReactNode }) => mockLinearGradient(props),
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');

  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    useSafeAreaInsets: jest.fn(() => ({ top: 0, right: 0, bottom: 20, left: 0 })),
  };
});

import React from 'react';
import { ScrollView, Text } from 'react-native';
import { render } from '@testing-library/react-native';

import { ScreenLayout } from '../src/components/layout';

describe('ScreenLayout', () => {
  beforeEach(() => {
    mockLinearGradient.mockClear();
  });

  it('renders header, body, footer, and the footer gradient by default', () => {
    const { getByText } = render(
      <ScreenLayout
        footer={<Text>Footer content</Text>}
        header={<Text>Header content</Text>}
      >
        <Text>Body content</Text>
      </ScreenLayout>,
    );

    expect(getByText('Header content')).toBeTruthy();
    expect(getByText('Body content')).toBeTruthy();
    expect(getByText('Footer content')).toBeTruthy();
    expect(mockLinearGradient).toHaveBeenCalledTimes(1);
  });

  it('supports screens without a footer', () => {
    const { getByText, queryByText } = render(
      <ScreenLayout>
        <Text>Only body</Text>
      </ScreenLayout>,
    );

    expect(getByText('Only body')).toBeTruthy();
    expect(queryByText('Footer content')).toBeNull();
    expect(mockLinearGradient).not.toHaveBeenCalled();
  });

  it('allows the footer gradient to be disabled', () => {
    const { getByText } = render(
      <ScreenLayout footer={<Text>Footer content</Text>} footerGradient={false}>
        <Text>Body content</Text>
      </ScreenLayout>,
    );

    expect(getByText('Footer content')).toBeTruthy();
    expect(mockLinearGradient).not.toHaveBeenCalled();
  });

  it('accepts a scroll ref for the internal ScrollView', () => {
    const scrollRef = React.createRef<ScrollView>();

    render(
      <ScreenLayout scrollRef={scrollRef}>
        <Text>Body content</Text>
      </ScreenLayout>,
    );

    expect(scrollRef.current).toBeTruthy();
  });
});
