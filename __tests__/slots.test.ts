import { generateMockSlots } from '../src/mocks/slots';

describe('generateMockSlots', () => {
  it('creates five slots for each of the next ten weekdays', () => {
    const slots = generateMockSlots();

    expect(slots).toHaveLength(50);
  });

  it('avoids weekend dates', () => {
    const slots = generateMockSlots();
    const uniqueDays = Array.from(new Set(slots.map((slot) => slot.date)));

    uniqueDays.forEach((date) => {
      const day = new Date(date).getDay();
      expect(day).not.toBe(0);
      expect(day).not.toBe(6);
    });
  });
});
