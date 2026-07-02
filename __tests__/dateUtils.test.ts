import { calculateAge, parseDateOfBirth } from '../src/utils/date';

describe('date of birth utilities', () => {
  it('parses date-only birth dates as local calendar dates', () => {
    const parsed = parseDateOfBirth('1994-04-12');

    expect(parsed).not.toBeNull();
    expect(parsed?.getFullYear()).toBe(1994);
    expect(parsed?.getMonth()).toBe(3);
    expect(parsed?.getDate()).toBe(12);
  });

  it('calculates age by birthday comparison', () => {
    const parsed = parseDateOfBirth('1994-04-12');

    expect(parsed).not.toBeNull();
    expect(calculateAge(parsed!, new Date(2026, 3, 11))).toBe(31);
    expect(calculateAge(parsed!, new Date(2026, 3, 12))).toBe(32);
  });

  it('rejects impossible date-only birth dates', () => {
    expect(parseDateOfBirth('2000-02-31')).toBeNull();
  });
});
