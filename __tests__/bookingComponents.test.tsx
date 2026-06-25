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
import { fireEvent, render } from '@testing-library/react-native';

import { GuideCard } from '../src/components/ui/GuideCard';
import { RangeSlider } from '../src/components/ui/RangeSlider';
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

  it('renders a single dual-thumb range slider and updates the minimum value when dragged', () => {
    const onChange = jest.fn();
    const { getByLabelText, getByText, getByTestId, queryByText, rerender } = render(
      <RangeSlider label="Age Range" max={65} min={18} onChange={onChange} value={[22, 35]} />,
    );

    expect(getByLabelText('Age Range minimum thumb')).toBeTruthy();
    expect(getByLabelText('Age Range maximum thumb')).toBeTruthy();
    expect(queryByText('Minimum')).toBeNull();
    expect(queryByText('Maximum')).toBeNull();
    expect(getByText('22 - 35')).toBeTruthy();
    expect(getByText('18')).toBeTruthy();
    expect(getByText('65')).toBeTruthy();

    const minimumThumb = getByTestId('Age Range-minimum-thumb');
    fireEvent(minimumThumb, 'accessibilityAction', {
      nativeEvent: { actionName: 'increment' },
    });

    expect(onChange).toHaveBeenCalledWith([23, 35]);

    rerender(
      <RangeSlider label="Age Range" max={65} min={18} onChange={onChange} value={[23, 35]} />,
    );

    expect(getByText('23 - 35')).toBeTruthy();
  });

  it('prevents the range slider thumbs from crossing', () => {
    const onChange = jest.fn();
    const { getByLabelText, getByTestId } = render(
      <RangeSlider label="Age Range" max={65} min={18} onChange={onChange} value={[22, 35]} />,
    );

    const maximumThumb = getByTestId('Age Range-maximum-thumb');
    fireEvent(maximumThumb, 'accessibilityAction', {
      nativeEvent: { actionName: 'decrement' },
    });

    expect(onChange).toHaveBeenCalledWith([22, 34]);
  });

  it('clamps the maximum thumb so it cannot cross the minimum thumb', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <RangeSlider label="Age Range" max={65} min={18} onChange={onChange} value={[22, 23]} />,
    );

    const maximumThumb = getByTestId('Age Range-maximum-thumb');
    fireEvent(maximumThumb, 'accessibilityAction', {
      nativeEvent: { actionName: 'decrement' },
    });

    expect(onChange).toHaveBeenCalledWith([22, 23]);
  });
});
