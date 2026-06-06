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

jest.mock('../src/stores/authStore', () => ({
  useAuthStore: (selector: (state: { setBookingSelection: jest.Mock }) => unknown) =>
    selector({ setBookingSelection: jest.fn() }),
}));

jest.mock('../src/services/slotService', () => ({
  bookSlot: jest.fn(),
  fetchAvailableSlots: jest.fn(),
  fetchGuides: jest.fn(),
  releaseSlot: jest.fn(),
}));

import React from 'react';
import { render } from '@testing-library/react-native';

import { GuideCard } from '../src/components/ui/GuideCard';
import { mockGuides } from '../src/mocks/guides';
import { fetchAvailableSlots, fetchGuides } from '../src/services/slotService';
import { ChooseSlotScreen } from '../src/screens/booking/ChooseSlotScreen';

const mockedFetchGuides = fetchGuides as jest.MockedFunction<typeof fetchGuides>;
const mockedFetchAvailableSlots = fetchAvailableSlots as jest.MockedFunction<
  typeof fetchAvailableSlots
>;

describe('booking components', () => {
  beforeEach(() => {
    mockedFetchGuides.mockReset();
    mockedFetchAvailableSlots.mockReset();
  });

  it('renders a guide photo when avatarUrl is provided', () => {
    const guide = {
      ...mockGuides[0],
      avatarUrl: 'https://example.com/avatar.jpg',
    };

    const { getByLabelText, queryByText } = render(<GuideCard guide={guide} />);

    expect(getByLabelText(`${guide.name} photo`)).toBeTruthy();
    expect(queryByText(guide.initials)).toBeNull();
  });

  it('shows the ChooseSlot skeleton while slot data is loading', () => {
    mockedFetchGuides.mockReturnValue(new Promise(() => {}));

    const { getByTestId } = render(
      <ChooseSlotScreen
        navigation={{ goBack: jest.fn(), navigate: jest.fn() } as never}
        route={{ key: 'ChooseSlot-test', name: 'ChooseSlot' } as never}
      />,
    );

    expect(getByTestId('choose-slot-skeleton')).toBeTruthy();
  });
});
