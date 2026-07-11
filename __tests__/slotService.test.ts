jest.mock('../src/config/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

import { supabase } from '../src/config/supabase';
import {
  bookSlot,
  fetchAvailableSlots,
  fetchConfirmedBookingForCurrentUser,
  fetchGuides,
  releaseSlot,
} from '../src/services/slotService';

describe('slotService', () => {
  const fromMock = supabase.from as jest.Mock;
  const rpcMock = supabase.rpc as jest.Mock;
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

  it('books a live slot through the atomic book_my_slot RPC', async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
        },
      },
    });
    rpcMock.mockResolvedValue({
      data: [
        {
          booking_id: 'booking-1',
          meeting_link: 'https://meet.example.com/abc',
          starts_at: '2026-06-20T09:00:00.000Z',
        },
      ],
      error: null,
    });

    await expect(bookSlot('slot-1')).resolves.toEqual({
      bookingId: 'booking-1',
      meetingLink: 'https://meet.example.com/abc',
      startsAt: '2026-06-20T09:00:00.000Z',
    });
    expect(rpcMock).toHaveBeenCalledWith('book_my_slot', { p_slot_id: 'slot-1' });
    expect(fromMock).not.toHaveBeenCalledWith('bookings');
    expect(fromMock).not.toHaveBeenCalledWith('available_slots');
  });

  it('maps an object RPC result when Supabase returns a single row', async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
        },
      },
    });
    rpcMock.mockResolvedValue({
      data: {
        booking_id: 'booking-1',
        meeting_link: null,
        starts_at: '2026-06-20T09:00:00.000Z',
      },
      error: null,
    });

    await expect(bookSlot('slot-1')).resolves.toEqual({
      bookingId: 'booking-1',
      meetingLink: null,
      startsAt: '2026-06-20T09:00:00.000Z',
    });
  });

  it('maps stale or unavailable slot RPC failures to friendly copy', async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
        },
      },
    });
    rpcMock.mockResolvedValue({ data: null, error: { code: 'P0002' } });

    await expect(bookSlot('slot-1')).rejects.toThrow(
      'That time is no longer available. Please choose another.',
    );
  });

  it('maps unique-constraint booking conflicts to friendly copy', async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
        },
      },
    });
    rpcMock.mockResolvedValue({ data: null, error: { code: '23505' } });

    await expect(bookSlot('slot-1')).rejects.toThrow(
      'This time has just been booked by someone else. Please choose another.',
    );
  });

  it('maps active booking RPC failures to friendly copy', async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
        },
      },
    });
    rpcMock.mockResolvedValue({ data: null, error: { code: 'P0001' } });

    await expect(bookSlot('slot-1')).rejects.toThrow(
      'You already have an upcoming conversation booked.',
    );
  });

  it('throws generic copy for unexpected booking RPC failures', async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
        },
      },
    });
    rpcMock.mockResolvedValue({ data: null, error: { code: '42501' } });

    await expect(bookSlot('slot-1')).rejects.toThrow(
      'Could not complete your booking. Please try again.',
    );
  });

  it('requires a signed-in user before booking', async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: null,
      },
    });

    await expect(bookSlot('slot-1')).rejects.toThrow('You must be signed in to book a time.');
    expect(rpcMock).not.toHaveBeenCalled();
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
    const inBookingStatus = jest.fn(() => ({ order: orderBooking }));
    const eqBookingUser = jest.fn(() => ({ in: inBookingStatus }));
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

  it('releases a live booking through the release_my_slot RPC', async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
        },
      },
    });

    rpcMock.mockResolvedValue({ error: null });

    await expect(releaseSlot('slot-1')).resolves.toBeUndefined();
    expect(rpcMock).toHaveBeenCalledWith('release_my_slot', {
      p_slot_id: 'slot-1',
      p_reason: 'Member cancelled booking',
    });
    expect(fromMock).not.toHaveBeenCalledWith('bookings');
    expect(fromMock).not.toHaveBeenCalledWith('available_slots');
  });

  it('treats missing active booking during release as already released', async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
        },
      },
    });

    rpcMock.mockResolvedValue({ error: { code: 'P0002' } });

    await expect(releaseSlot('slot-1')).resolves.toBeUndefined();
  });

  it('throws when release_my_slot fails during release', async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
        },
      },
    });

    rpcMock.mockResolvedValue({ error: { code: '42501', message: 'permission denied' } });

    await expect(releaseSlot('slot-1')).rejects.toThrow('Could not release that time.');
  });
});
