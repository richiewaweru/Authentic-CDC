import { mockGuides } from '../mocks/guides';
import { mockSlots } from '../mocks/slots';
import { Guide, Slot } from '../types/booking';

const DATA_SOURCE: 'mock' | 'supabase' = 'mock';

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

export async function bookSlot(slotId: string): Promise<void> {
  if (DATA_SOURCE === 'supabase') {
    return bookSlotInSupabase(slotId);
  }
}

export async function releaseSlot(slotId: string): Promise<void> {
  if (DATA_SOURCE === 'supabase') {
    return releaseSlotInSupabase(slotId);
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
  // TODO: import the Supabase client and map guide_profiles rows into Guide objects.
  throw new Error('Supabase not wired yet - keep DATA_SOURCE set to "mock".');
}

async function fetchSlotsFromSupabase(guideId: string): Promise<Slot[]> {
  // TODO: import the Supabase client and map available_slots rows into Slot objects.
  void guideId;
  throw new Error('Supabase not wired yet - keep DATA_SOURCE set to "mock".');
}

async function bookSlotInSupabase(slotId: string): Promise<void> {
  // TODO: mark the selected available_slots row as booked.
  void slotId;
  throw new Error('Supabase not wired yet - keep DATA_SOURCE set to "mock".');
}

async function releaseSlotInSupabase(slotId: string): Promise<void> {
  // TODO: mark the selected available_slots row as unbooked.
  void slotId;
  throw new Error('Supabase not wired yet - keep DATA_SOURCE set to "mock".');
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
