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
  slotId?: string;
  googleEventId?: string;
  endTime: string;
  status: 'confirmed' | 'cancelled';
  cancelledAt?: string;
  cancelReason?: string;
}
