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

const mockSlider = jest.fn();

jest.mock('@miblanchard/react-native-slider', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    Slider: (props: unknown) => {
      mockSlider(props);
      return <View testID="mock-native-slider" />;
    },
  };
});

import React from 'react';
import { act, render } from '@testing-library/react-native';

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
    mockSlider.mockClear();
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

  it('renders the range slider labels and current value', () => {
    const onChange = jest.fn();
    const { getByLabelText, getByText, queryByText } = render(
      <RangeSlider label="Age Range" max={65} min={18} onChange={onChange} value={[22, 35]} />,
    );

    expect(getByLabelText('Age Range range slider')).toBeTruthy();
    expect(queryByText('Minimum')).toBeNull();
    expect(queryByText('Maximum')).toBeNull();
    expect(getByText('22 - 35')).toBeTruthy();
    expect(getByText('18')).toBeTruthy();
    expect(getByText('65')).toBeTruthy();
  });

  it('updates the displayed value during native drag without committing to parent state', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <RangeSlider label="Age Range" max={65} min={18} onChange={onChange} value={[22, 35]} />,
    );

    const latestProps = mockSlider.mock.calls.at(-1)?.[0] as {
      onValueChange?: (value: number[], index: number) => void;
    };

    act(() => {
      latestProps.onValueChange?.([23, 35], 0);
    });

    expect(getByText('23 - 35')).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('commits the final native value on sliding complete', () => {
    const onChange = jest.fn();
    render(<RangeSlider label="Age Range" max={65} min={18} onChange={onChange} value={[22, 35]} />);

    const latestProps = mockSlider.mock.calls.at(-1)?.[0] as {
      onSlidingComplete?: (value: number[], index: number) => void;
    };

    act(() => {
      latestProps.onSlidingComplete?.([23, 35], 0);
    });

    expect(onChange).toHaveBeenCalledWith([23, 35]);
  });

  it('syncs the mirrored local value when the parent rerenders with a new range', () => {
    const onChange = jest.fn();
    const { getByText, rerender } = render(
      <RangeSlider label="Age Range" max={65} min={18} onChange={onChange} value={[23, 35]} />,
    );

    const latestProps = mockSlider.mock.calls.at(-1)?.[0] as {
      onValueChange?: (value: number[], index: number) => void;
    };

    act(() => {
      latestProps.onValueChange?.([24, 36], 0);
    });

    expect(getByText('24 - 36')).toBeTruthy();

    rerender(
      <RangeSlider label="Age Range" max={65} min={18} onChange={onChange} value={[26, 40]} />,
    );

    expect(getByText('26 - 40')).toBeTruthy();
  });
});
