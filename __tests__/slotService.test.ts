jest.mock('../src/config/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

import { supabase } from '../src/config/supabase';
import {
  bookSlot,
  fetchAvailableSlots,
  fetchGuides,
  releaseSlot,
} from '../src/services/slotService';

describe('slotService', () => {
  const fromMock = supabase.from as jest.Mock;
  const getUserMock = supabase.auth.getUser as jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('maps active guides from Supabase rows', async () => {
    const order = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'guide-1',
          display_name: 'Ada Love',
          name: null,
          title: 'Lead Guide',
          initials: null,
          avatar_url: 'https://example.com/ada.jpg',
        },
      ],
      error: null,
    });
    const eq = jest.fn(() => ({ order }));
    const select = jest.fn(() => ({ eq }));

    fromMock.mockImplementation((table: string) => {
      if (table === 'guide_profiles') {
        return { select };
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    await expect(fetchGuides()).resolves.toEqual([
      {
        id: 'guide-1',
        name: 'Ada Love',
        title: 'Lead Guide',
        initials: 'AL',
        avatarUrl: 'https://example.com/ada.jpg',
      },
    ]);
  });

  it('maps future slots from Supabase rows', async () => {
    const orderTime = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'slot-1',
          guide_id: 'guide-1',
          slot_date: '2026-06-20',
          slot_time: '09:00:00',
          duration_minutes: 30,
        },
      ],
      error: null,
    });
    const orderDate = jest.fn(() => ({ order: orderTime }));
    const gte = jest.fn(() => ({ order: orderDate }));
    const eqStatus = jest.fn(() => ({ gte }));
    const eqGuide = jest.fn(() => ({ eq: eqStatus }));
    const select = jest.fn(() => ({ eq: eqGuide }));

    fromMock.mockImplementation((table: string) => {
      if (table === 'available_slots') {
        return { select };
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    await expect(fetchAvailableSlots('guide-1')).resolves.toEqual([
      {
        id: 'slot-1',
        guideId: 'guide-1',
        date: '2026-06-20',
        time: '9:00 AM',
        durationMinutes: 30,
      },
    ]);
  });

  it('books a live slot and creates a booking row', async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
        },
      },
    });

    const slotSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'slot-1',
        guide_id: 'guide-1',
        slot_date: '2026-06-20',
        slot_time: '09:00:00',
        duration_minutes: 30,
        status: 'open',
      },
      error: null,
    });
    const slotEq = jest.fn(() => ({ single: slotSingle }));
    const slotSelect = jest.fn(() => ({ eq: slotEq }));

    const maybeSingleExistingBooking = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const limitExistingBooking = jest.fn(() => ({ maybeSingle: maybeSingleExistingBooking }));
    const eqBookingStatus = jest.fn(() => ({ limit: limitExistingBooking }));
    const eqBookingSlot = jest.fn(() => ({ eq: eqBookingStatus }));
    const eqBookingUser = jest.fn(() => ({ eq: eqBookingSlot }));
    const selectExistingBooking = jest.fn(() => ({ eq: eqBookingUser }));
    const bookingInsert = jest.fn().mockResolvedValue({ error: null });

    fromMock.mockImplementation((table: string) => {
      if (table === 'available_slots') {
        return {
          select: slotSelect,
        };
      }

      if (table === 'bookings') {
        return {
          select: selectExistingBooking,
          insert: bookingInsert,
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    await expect(bookSlot('slot-1')).resolves.toBeUndefined();
    expect(bookingInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        guide_id: 'guide-1',
        slot_id: 'slot-1',
        slot_date: '2026-06-20',
        slot_time: '09:00:00',
        duration_minutes: 30,
        status: 'confirmed',
        payment_status: 'pending',
      }),
    );
  });

  it('releases a live booking by cancelling the booking row', async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
        },
      },
    });

    const selectCancelled = jest.fn().mockResolvedValue({
      data: [{ id: 'booking-1' }],
      error: null,
    });
    const bookingStatusEq = jest.fn(() => ({ select: selectCancelled }));
    const bookingUserEq = jest.fn(() => ({ eq: bookingStatusEq }));
    const updateBookingEq = jest.fn(() => ({ eq: bookingUserEq }));
    const updateBooking = jest.fn(() => ({ eq: updateBookingEq }));

    fromMock.mockImplementation((table: string) => {
      if (table === 'bookings') {
        return { update: updateBooking };
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    await expect(releaseSlot('slot-1')).resolves.toBeUndefined();
    expect(updateBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'cancelled',
        cancel_reason: 'Member rescheduled',
      }),
    );
  });
});
