export interface Guide {
  id: string;
  name: string;
  title: string;
  initials: string;
  avatarUrl?: string | null;
}

export interface Slot {
  id: string;
  guideId: string;
  date: string;
  time: string;
  durationMinutes: number;
}

export interface BookingSelection {
  guide: Guide;
  slot: Slot;
}

export interface BookingRecord extends BookingSelection {
  id?: string;
  bookingId?: string;
  slotId?: string;
  googleEventId?: string;
  meetingLink?: string | null;
  startsAt?: string | null;
  endTime: string;
  status: 'confirmed' | 'cancelled';
  cancelledAt?: string;
  cancelReason?: string;
}
