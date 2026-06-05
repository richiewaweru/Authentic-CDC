import { BookingSelection, BookingRecord } from '../types/booking';
import { addMinutesToTime } from '../utils/date';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const confirmMockPayment = async (
  selection: BookingSelection,
): Promise<BookingRecord> => {
  await delay(1500);

  // TODO: Replace this mock success path with the real payment provider integration.
  return {
    ...selection,
    slotId: selection.slot.id,
    endTime: addMinutesToTime(selection.slot.time, selection.slot.durationMinutes),
    status: 'confirmed',
  };
};
