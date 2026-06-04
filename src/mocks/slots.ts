import { mockGuides } from './guides';
import { Slot } from '../types/booking';
import { getNextWeekdays } from '../utils/date';

const slotTimes = ['9:00 AM', '10:30 AM', '1:00 PM', '2:30 PM', '4:00 PM'];

export const generateMockSlots = () => {
  const weekdays = getNextWeekdays(10);

  return weekdays.flatMap((date, dateIndex) =>
    slotTimes.map((time, timeIndex) => ({
      id: `slot_${dateIndex + 1}_${timeIndex + 1}`,
      guideId: mockGuides[(dateIndex + timeIndex) % mockGuides.length].id,
      date,
      time,
      durationMinutes: 15,
    })),
  );
};

export const mockSlots: Slot[] = generateMockSlots();
