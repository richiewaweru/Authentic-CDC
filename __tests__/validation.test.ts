import { onboardingSchema } from '../src/lib/validation';
import { initialOnboardingData } from '../src/screens/onboarding/state';

describe('onboardingSchema', () => {
  const validData = {
    ...initialOnboardingData,
    firstName: 'Ada',
    dateOfBirth: '1992-05-10T00:00:00.000Z',
    gender: 'woman' as const,
    relationshipGoal: 'Intentional dating',
    communicationStyle: 'Calm & reflective',
    conflictStyle: 'I prefer calm discussion',
    lifestyleVision: 'Faith-centered family',
    sharedFaith: 'Essential',
    churchInvolvement: 'Weekly active',
    futureHopes: 'Build a peaceful, faith-centered home.',
    distanceType: 'radius' as const,
    distanceRadiusMiles: 25 as const,
  };

  it('accepts the minimum required fields when ranges are valid', () => {
    const result = onboardingSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it.each([
    ['firstName', '', 'Please enter your first name.'],
    ['relationshipGoal', null, 'Choose the relationship you are seeking.'],
    ['communicationStyle', null, 'Choose the communication style that best fits you.'],
    ['conflictStyle', null, 'Choose how you usually handle conflict.'],
    ['lifestyleVision', null, 'Choose the lifestyle vision that feels closest to you.'],
    ['sharedFaith', null, 'Select how important shared Christian faith is to you.'],
    ['churchInvolvement', null, 'Select your current church involvement.'],
  ])('rejects missing required field %s', (field, value, message) => {
    const result = onboardingSchema.safeParse({
      ...validData,
      [field]: value,
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(message);
  });

  it('rejects missing gender', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      gender: undefined,
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Please select one.');
  });

  it('rejects users under 18', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      dateOfBirth: '2012-01-01T00:00:00.000Z',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('You must be at least 18 to join.');
  });

  it('accepts date-only birth dates exactly 18 years ago', () => {
    const today = new Date();
    const birthDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const dateOnly = [
      birthDate.getFullYear(),
      String(birthDate.getMonth() + 1).padStart(2, '0'),
      String(birthDate.getDate()).padStart(2, '0'),
    ].join('-');

    const result = onboardingSchema.safeParse({
      ...validData,
      dateOfBirth: dateOnly,
    });

    expect(result.success).toBe(true);
  });

  it('rejects date-only birth dates one day under 18', () => {
    const today = new Date();
    const birthDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate() + 1);
    const dateOnly = [
      birthDate.getFullYear(),
      String(birthDate.getMonth() + 1).padStart(2, '0'),
      String(birthDate.getDate()).padStart(2, '0'),
    ].join('-');

    const result = onboardingSchema.safeParse({
      ...validData,
      dateOfBirth: dateOnly,
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('You must be at least 18 to join.');
  });

  it('continues accepting native ISO timestamp birth dates', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      dateOfBirth: '1992-05-10T00:00:00.000Z',
    });

    expect(result.success).toBe(true);
  });

  it('rejects empty future hopes', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      futureHopes: '   ',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Share a short note about what you hope for.');
  });

  it('rejects invalid age range', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      ageRange: [30, 30] as [number, number],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Choose a valid age range.');
  });

  it('rejects invalid distance range', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      distanceRange: [15, 15] as [number, number],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Choose a valid distance range.');
  });

  it('accepts nearby distance preferences with supported radius values', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      distanceType: 'radius',
      distanceRadiusMiles: 100,
    });

    expect(result.success).toBe(true);
  });
});
