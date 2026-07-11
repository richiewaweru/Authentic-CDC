import { mockGuides } from '../mocks/guides';
import { mockSlots } from '../mocks/slots';
import { getSlotDataSource } from '../config/env';
import { supabase } from '../config/supabase';
import { addMinutesToTime, formatSlotTime } from '../utils/date';
import { BookingRecord, Guide, Slot } from '../types/booking';

const DATA_SOURCE = getSlotDataSource();

interface BookSlotResult {
  bookingId: string;
  meetingLink: string | null;
  startsAt: string | null;
}

export async function fetchGuides(): Promise<Guide[]> {
  if (DATA_SOURCE === 'supabase') {
    return fetchGuidesFromSupabase();
  }

  return fetchGuidesFromMock();
}

export async function fetchAvailableSlots(guideId: string): Promise<Slot[]> {
  if (DATA_SOURCE === 'supabase') {
    return fetchSlotsFromSupabase(guideId);
  }

  return fetchSlotsFromMock(guideId);
}

export async function bookSlot(slotId: string): Promise<BookSlotResult> {
  if (DATA_SOURCE === 'supabase') {
    return bookSlotInSupabase(slotId);
  }

  return {
    bookingId: '',
    meetingLink: null,
    startsAt: null,
  };
}

export async function releaseSlot(slotId: string, reason = 'Member cancelled booking'): Promise<void> {
  if (DATA_SOURCE === 'supabase') {
    return releaseSlotInSupabase(slotId, reason);
  }
}

async function fetchGuidesFromMock(): Promise<Guide[]> {
  await delay(300);
  return mockGuides;
}

async function fetchSlotsFromMock(guideId: string): Promise<Slot[]> {
  await delay(300);
  return mockSlots.filter((slot) => slot.guideId === guideId);
}

async function fetchGuidesFromSupabase(): Promise<Guide[]> {
  const { data, error } = await supabase
    .from('guide_profiles')
    .select('id, display_name, name, title, initials, avatar_url')
    .eq('is_active', true)
    .order('display_name', { ascending: true });

  if (error) {
    console.error('Failed to fetch guides:', error);
    throw new Error('Could not load available guides.');
  }

  return (data ?? []).map((row) => {
    const name = row.display_name || row.name || 'Guide';

    return {
      id: row.id,
      name,
      title: row.title || 'Community Guide',
      initials: row.initials || buildInitials(name),
      avatarUrl: row.avatar_url ?? null,
    };
  });
}

async function fetchSlotsFromSupabase(guideId: string): Promise<Slot[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('available_slots')
    .select('id, guide_id, slot_date, slot_time, duration_minutes')
    .eq('guide_id', guideId)
    .eq('status', 'open')
    .gte('slot_date', today)
    .order('slot_date', { ascending: true })
    .order('slot_time', { ascending: true });

  if (error) {
    console.error('Failed to fetch slots:', error);
    throw new Error('Could not load available times.');
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    guideId: row.guide_id,
    date: row.slot_date ?? '',
    time: formatSlotTime(row.slot_time ?? '00:00:00'),
    durationMinutes: row.duration_minutes ?? 30,
  }));
}

export async function fetchConfirmedBookingForCurrentUser(): Promise<BookingRecord | null> {
  if (DATA_SOURCE !== 'supabase') {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select(
      'id, guide_id, slot_id, slot_date, slot_time, duration_minutes, meeting_link, status, cancelled_at, cancel_reason',
    )
    .eq('user_id', user.id)
    .in('status', ['confirmed', 'completed'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (bookingError) {
    console.error('Failed to fetch confirmed booking:', bookingError);
    throw new Error('Could not load your confirmed booking.');
  }

  if (!booking) {
    return null;
  }

  const [{ data: guide, error: guideError }, { data: slotDetails, error: slotError }] =
    await Promise.all([
      supabase
        .from('guide_profiles')
        .select('id, display_name, name, title, initials, avatar_url')
        .eq('id', booking.guide_id)
        .maybeSingle(),
      supabase
        .from('available_slots')
        .select('starts_at')
        .eq('id', booking.slot_id)
        .maybeSingle(),
    ]);

  if (guideError) {
    console.error('Failed to fetch guide for confirmed booking:', guideError);
    throw new Error('Could not load your confirmed booking.');
  }

  if (slotError) {
    console.error('Failed to fetch slot timing for confirmed booking:', slotError);
    throw new Error('Could not load your confirmed booking.');
  }

  const guideName = guide?.display_name || guide?.name || 'Guide';
  const displayTime = formatSlotTime(booking.slot_time ?? '00:00:00');
  const durationMinutes = booking.duration_minutes ?? 30;

  return {
    bookingId: booking.id,
    slotId: booking.slot_id,
    meetingLink: booking.meeting_link ?? null,
    startsAt: slotDetails?.starts_at ?? null,
    endTime: addMinutesToTime(displayTime, durationMinutes),
    status: booking.status,
    cancelledAt: booking.cancelled_at ?? undefined,
    cancelReason: booking.cancel_reason ?? undefined,
    guide: {
      id: booking.guide_id,
      name: guideName,
      title: guide?.title || 'Community Guide',
      initials: guide?.initials || buildInitials(guideName),
      avatarUrl: guide?.avatar_url ?? null,
    },
    slot: {
      id: booking.slot_id,
      guideId: booking.guide_id,
      date: booking.slot_date ?? '',
      time: displayTime,
      durationMinutes,
    },
  };
}

async function bookSlotInSupabase(slotId: string): Promise<BookSlotResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be signed in to book a time.');
  }

  const { data, error } = await supabase.rpc('book_my_slot', { p_slot_id: slotId });

  if (error) {
    console.error('book_my_slot failed:', error);

    if (error.code === 'P0002') {
      throw new Error('That time is no longer available. Please choose another.');
    }

    if (error.code === '23505') {
      throw new Error('This time has just been booked by someone else. Please choose another.');
    }

    if (error.code === 'P0001') {
      throw new Error('You already have an upcoming conversation booked.');
    }

    throw new Error('Could not complete your booking. Please try again.');
  }

  const row = Array.isArray(data) ? data[0] : data;

  return {
    bookingId: row?.booking_id ?? '',
    meetingLink: row?.meeting_link ?? null,
    startsAt: row?.starts_at ?? null,
  };
}

async function releaseSlotInSupabase(slotId: string, reason: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be signed in to change your booking.');
  }

  const { error } = await supabase.rpc('release_my_slot', {
    p_slot_id: slotId,
    p_reason: reason,
  });

  if (error) {
    if (error.code === 'P0002') {
      return;
    }

    console.error('release_my_slot failed:', error);
    throw new Error('Could not release that time.');
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildInitials(name: string) {
  return name
    .split(/[\s._-]+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}
