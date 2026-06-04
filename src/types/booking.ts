export interface Guide {
  id: string;
  name: string;
  title: string;
  initials: string;
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
  endTime: string;
  status: 'confirmed';
}
