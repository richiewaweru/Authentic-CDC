import { onboardingSchema } from '../src/lib/validation';
import { initialOnboardingData } from '../src/screens/onboarding/state';

describe('onboardingSchema', () => {
  const validData = {
    ...initialOnboardingData,
    relationshipGoal: 'Intentional dating',
    communicationStyle: 'Calm & reflective',
    conflictStyle: 'I prefer calm discussion',
    lifestyleVision: 'Faith-centered family',
    sharedFaith: 'Essential',
    churchInvolvement: 'Weekly active',
    futureHopes: 'Build a peaceful, faith-centered home.',
  };

  it('accepts the minimum required fields when ranges are valid', () => {
    const result = onboardingSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it.each([
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
});
