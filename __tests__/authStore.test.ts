jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('../src/services/authService', () => ({
  authService: {
    signOut: jest.fn(),
  },
  mapSupabaseUser: jest.fn(),
}));

jest.mock('../src/lib/onboardingStorage', () => ({
  clearOnboardingProgress: jest.fn(),
}));

jest.mock('../src/services/slotService', () => ({
  bookSlot: jest.fn(),
  fetchAvailableSlots: jest.fn(),
  fetchGuides: jest.fn(),
  releaseSlot: jest.fn(),
}));

import { mockGuides } from '../src/mocks/guides';
import { mockSlots } from '../src/mocks/slots';
import { releaseSlot } from '../src/services/slotService';
import { useAuthStore } from '../src/stores/authStore';

const mockedReleaseSlot = releaseSlot as jest.MockedFunction<typeof releaseSlot>;

describe('useAuthStore', () => {
  beforeEach(() => {
    mockedReleaseSlot.mockReset();
    useAuthStore.setState({
      bookingSelection: null,
      confirmedBooking: null,
    });
  });

  it('releases the slot and clears booking state when rescheduling', async () => {
    const guide = mockGuides[0];
    const slot = mockSlots[0];

    useAuthStore.setState({
      bookingSelection: {
        guide,
        slot,
      },
      confirmedBooking: {
        guide,
        slot,
        endTime: '9:15 AM',
        slotId: slot.id,
        status: 'confirmed',
      },
    });

    await useAuthStore.getState().rescheduleBooking();

    expect(mockedReleaseSlot).toHaveBeenCalledWith(slot.id);
    expect(useAuthStore.getState().bookingSelection).toBeNull();
    expect(useAuthStore.getState().confirmedBooking).toBeNull();
  });
});
