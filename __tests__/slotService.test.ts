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
  fetchConfirmedBookingForCurrentUser,
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

  it('maps future open slots from Supabase rows', async () => {
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
    expect(eqStatus).toHaveBeenCalledWith('status', 'open');
  });

  it('books a live slot, marks it booked, and returns the confirmed booking', async () => {
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
        starts_at: '2026-06-20T09:00:00.000Z',
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
    const eqExistingStatus = jest.fn(() => ({ limit: limitExistingBooking }));
    const eqExistingSlot = jest.fn(() => ({ eq: eqExistingStatus }));
    const eqExistingUser = jest.fn(() => ({ eq: eqExistingSlot }));
    const selectExistingBooking = jest.fn(() => ({ eq: eqExistingUser }));

    const maybeSingleAnyBooking = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const limitAnyBooking = jest.fn(() => ({ maybeSingle: maybeSingleAnyBooking }));
    const eqAnyStatus = jest.fn(() => ({ limit: limitAnyBooking }));
    const eqAnySlot = jest.fn(() => ({ eq: eqAnyStatus }));
    const selectAnyBooking = jest.fn(() => ({ eq: eqAnySlot }));

    const freshSlotSingle = jest.fn().mockResolvedValue({
      data: { status: 'open' },
      error: null,
    });
    const freshSlotEq = jest.fn(() => ({ single: freshSlotSingle }));
    const freshSlotSelect = jest.fn(() => ({ eq: freshSlotEq }));

    const bookingInsert = jest.fn().mockResolvedValue({ error: null });

    const slotStatusUpdateFinalEq = jest.fn().mockResolvedValue({ error: null });
    const slotStatusUpdateFirstEq = jest.fn(() => ({ eq: slotStatusUpdateFinalEq }));
    const slotStatusUpdate = jest.fn(() => ({ eq: slotStatusUpdateFirstEq }));

    const maybeSingleConfirmedBooking = jest.fn().mockResolvedValue({
      data: {
        id: 'booking-1',
        meeting_link: 'https://meet.example.com/abc',
      },
      error: null,
    });
    const limitConfirmedBooking = jest.fn(() => ({ maybeSingle: maybeSingleConfirmedBooking }));
    const orderConfirmedBooking = jest.fn(() => ({ limit: limitConfirmedBooking }));
    const eqConfirmedStatus = jest.fn(() => ({ order: orderConfirmedBooking }));
    const eqConfirmedSlot = jest.fn(() => ({ eq: eqConfirmedStatus }));
    const eqConfirmedUser = jest.fn(() => ({ eq: eqConfirmedSlot }));
    const selectConfirmedBooking = jest.fn(() => ({ eq: eqConfirmedUser }));

    let availableSlotsCallCount = 0;
    let bookingsSelectCount = 0;

    fromMock.mockImplementation((table: string) => {
      if (table === 'available_slots') {
        availableSlotsCallCount += 1;

        if (availableSlotsCallCount === 1) {
          return { select: slotSelect };
        }

        if (availableSlotsCallCount === 2) {
          return { select: freshSlotSelect };
        }

        return { update: slotStatusUpdate };
      }

      if (table === 'bookings') {
        return {
          select: () => {
            bookingsSelectCount += 1;

            if (bookingsSelectCount === 1) {
              return selectExistingBooking();
            }

            if (bookingsSelectCount === 2) {
              return selectAnyBooking();
            }

            return selectConfirmedBooking();
          },
          insert: bookingInsert,
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    await expect(bookSlot('slot-1')).resolves.toEqual({
      bookingId: 'booking-1',
      meetingLink: 'https://meet.example.com/abc',
      startsAt: '2026-06-20T09:00:00.000Z',
    });
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
    expect(slotStatusUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'booked',
        booked_by: 'user-1',
        booked_at: expect.any(String),
      }),
    );
    expect(slotStatusUpdateFinalEq).toHaveBeenCalledWith('status', 'open');
  });

  it('rejects a booking when another user already confirmed the slot', async () => {
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
        starts_at: '2026-06-20T09:00:00.000Z',
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
    const eqExistingStatus = jest.fn(() => ({ limit: limitExistingBooking }));
    const eqExistingSlot = jest.fn(() => ({ eq: eqExistingStatus }));
    const eqExistingUser = jest.fn(() => ({ eq: eqExistingSlot }));
    const selectExistingBooking = jest.fn(() => ({ eq: eqExistingUser }));

    const maybeSingleAnyBooking = jest.fn().mockResolvedValue({
      data: { id: 'booking-2' },
      error: null,
    });
    const limitAnyBooking = jest.fn(() => ({ maybeSingle: maybeSingleAnyBooking }));
    const eqAnyStatus = jest.fn(() => ({ limit: limitAnyBooking }));
    const eqAnySlot = jest.fn(() => ({ eq: eqAnyStatus }));
    const selectAnyBooking = jest.fn(() => ({ eq: eqAnySlot }));

    let bookingsSelectCount = 0;

    fromMock.mockImplementation((table: string) => {
      if (table === 'available_slots') {
        return { select: slotSelect };
      }

      if (table === 'bookings') {
        return {
          select: () => {
            bookingsSelectCount += 1;
            return bookingsSelectCount === 1 ? selectExistingBooking() : selectAnyBooking();
          },
          insert: jest.fn(),
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    await expect(bookSlot('slot-1')).rejects.toThrow(
      'This time has just been booked by someone else. Please choose another.',
    );
  });

  it('rejects a booking when the fresh slot re-check shows it is no longer open', async () => {
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
        starts_at: '2026-06-20T09:00:00.000Z',
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
    const eqExistingStatus = jest.fn(() => ({ limit: limitExistingBooking }));
    const eqExistingSlot = jest.fn(() => ({ eq: eqExistingStatus }));
    const eqExistingUser = jest.fn(() => ({ eq: eqExistingSlot }));
    const selectExistingBooking = jest.fn(() => ({ eq: eqExistingUser }));

    const maybeSingleAnyBooking = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const limitAnyBooking = jest.fn(() => ({ maybeSingle: maybeSingleAnyBooking }));
    const eqAnyStatus = jest.fn(() => ({ limit: limitAnyBooking }));
    const eqAnySlot = jest.fn(() => ({ eq: eqAnyStatus }));
    const selectAnyBooking = jest.fn(() => ({ eq: eqAnySlot }));

    const freshSlotSingle = jest.fn().mockResolvedValue({
      data: { status: 'booked' },
      error: null,
    });
    const freshSlotEq = jest.fn(() => ({ single: freshSlotSingle }));
    const freshSlotSelect = jest.fn(() => ({ eq: freshSlotEq }));

    let availableSlotsCallCount = 0;
    let bookingsSelectCount = 0;

    fromMock.mockImplementation((table: string) => {
      if (table === 'available_slots') {
        availableSlotsCallCount += 1;
        return availableSlotsCallCount === 1 ? { select: slotSelect } : { select: freshSlotSelect };
      }

      if (table === 'bookings') {
        return {
          select: () => {
            bookingsSelectCount += 1;
            return bookingsSelectCount === 1 ? selectExistingBooking() : selectAnyBooking();
          },
          insert: jest.fn(),
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    await expect(bookSlot('slot-1')).rejects.toThrow(
      'This time was just taken. Please choose another.',
    );
  });

  it('maps a unique-constraint booking conflict to the friendly stale-slot error', async () => {
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
        starts_at: '2026-06-20T09:00:00.000Z',
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
    const eqExistingStatus = jest.fn(() => ({ limit: limitExistingBooking }));
    const eqExistingSlot = jest.fn(() => ({ eq: eqExistingStatus }));
    const eqExistingUser = jest.fn(() => ({ eq: eqExistingSlot }));
    const selectExistingBooking = jest.fn(() => ({ eq: eqExistingUser }));

    const maybeSingleAnyBooking = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const limitAnyBooking = jest.fn(() => ({ maybeSingle: maybeSingleAnyBooking }));
    const eqAnyStatus = jest.fn(() => ({ limit: limitAnyBooking }));
    const eqAnySlot = jest.fn(() => ({ eq: eqAnyStatus }));
    const selectAnyBooking = jest.fn(() => ({ eq: eqAnySlot }));

    const freshSlotSingle = jest.fn().mockResolvedValue({
      data: { status: 'open' },
      error: null,
    });
    const freshSlotEq = jest.fn(() => ({ single: freshSlotSingle }));
    const freshSlotSelect = jest.fn(() => ({ eq: freshSlotEq }));

    const bookingInsert = jest.fn().mockResolvedValue({
      error: { code: '23505' },
    });

    let availableSlotsCallCount = 0;
    let bookingsSelectCount = 0;

    fromMock.mockImplementation((table: string) => {
      if (table === 'available_slots') {
        availableSlotsCallCount += 1;
        return availableSlotsCallCount === 1 ? { select: slotSelect } : { select: freshSlotSelect };
      }

      if (table === 'bookings') {
        return {
          select: () => {
            bookingsSelectCount += 1;
            return bookingsSelectCount === 1 ? selectExistingBooking() : selectAnyBooking();
          },
          insert: bookingInsert,
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    await expect(bookSlot('slot-1')).rejects.toThrow(
      'This time has just been booked by someone else. Please choose another.',
    );
  });

  it('hydrates the current confirmed booking for the signed-in user', async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
        },
      },
    });

    const maybeSingleBooking = jest.fn().mockResolvedValue({
      data: {
        id: 'booking-1',
        guide_id: 'guide-1',
        slot_id: 'slot-1',
        slot_date: '2026-06-20',
        slot_time: '09:00:00',
        duration_minutes: 30,
        meeting_link: 'https://meet.example.com/abc',
        status: 'confirmed',
        cancelled_at: null,
        cancel_reason: null,
      },
      error: null,
    });
    const limitBooking = jest.fn(() => ({ maybeSingle: maybeSingleBooking }));
    const orderBooking = jest.fn(() => ({ limit: limitBooking }));
    const eqBookingStatus = jest.fn(() => ({ order: orderBooking }));
    const eqBookingUser = jest.fn(() => ({ eq: eqBookingStatus }));
    const selectBooking = jest.fn(() => ({ eq: eqBookingUser }));

    const maybeSingleGuide = jest.fn().mockResolvedValue({
      data: {
        id: 'guide-1',
        display_name: 'Ada Love',
        name: null,
        title: 'Lead Guide',
        initials: null,
        avatar_url: 'https://example.com/ada.jpg',
      },
      error: null,
    });
    const eqGuide = jest.fn(() => ({ maybeSingle: maybeSingleGuide }));
    const selectGuide = jest.fn(() => ({ eq: eqGuide }));

    const maybeSingleSlot = jest.fn().mockResolvedValue({
      data: {
        starts_at: '2026-06-20T09:00:00.000Z',
      },
      error: null,
    });
    const eqSlot = jest.fn(() => ({ maybeSingle: maybeSingleSlot }));
    const selectSlot = jest.fn(() => ({ eq: eqSlot }));

    fromMock.mockImplementation((table: string) => {
      if (table === 'bookings') {
        return { select: selectBooking };
      }

      if (table === 'guide_profiles') {
        return { select: selectGuide };
      }

      if (table === 'available_slots') {
        return { select: selectSlot };
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    await expect(fetchConfirmedBookingForCurrentUser()).resolves.toEqual({
      bookingId: 'booking-1',
      slotId: 'slot-1',
      meetingLink: 'https://meet.example.com/abc',
      startsAt: '2026-06-20T09:00:00.000Z',
      endTime: '9:30 AM',
      status: 'confirmed',
      guide: {
        id: 'guide-1',
        name: 'Ada Love',
        title: 'Lead Guide',
        initials: 'AL',
        avatarUrl: 'https://example.com/ada.jpg',
      },
      slot: {
        id: 'slot-1',
        guideId: 'guide-1',
        date: '2026-06-20',
        time: '9:00 AM',
        durationMinutes: 30,
      },
    });
  });

  it('releases a live booking by cancelling the booking row and reopening the slot', async () => {
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

    const reopenSlotFinalEq = jest.fn().mockResolvedValue({ error: null });
    const reopenSlotFirstEq = jest.fn(() => ({ eq: reopenSlotFinalEq }));
    const updateSlot = jest.fn(() => ({ eq: reopenSlotFirstEq }));

    let availableSlotsCalled = false;

    fromMock.mockImplementation((table: string) => {
      if (table === 'bookings') {
        return { update: updateBooking };
      }

      if (table === 'available_slots') {
        availableSlotsCalled = true;
        return { update: updateSlot };
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
    expect(availableSlotsCalled).toBe(true);
    expect(updateSlot).toHaveBeenCalledWith({
      status: 'open',
      booked_by: null,
      booked_at: null,
    });
    expect(reopenSlotFinalEq).toHaveBeenCalledWith('status', 'booked');
  });

  it('throws when no confirmed booking was actually cancelled during release', async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
        },
      },
    });

    const selectCancelled = jest.fn().mockResolvedValue({
      data: [],
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

      if (table === 'available_slots') {
        return { update: jest.fn() };
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    await expect(releaseSlot('slot-1')).rejects.toThrow(
      'Your current booking could not be released.',
    );
  });
});
