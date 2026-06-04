import { onboardingSchema } from '../src/lib/validation';
import { initialOnboardingData } from '../src/screens/onboarding/state';

describe('onboardingSchema', () => {
  it('accepts the minimum required fields when ranges are valid', () => {
    const result = onboardingSchema.safeParse({
      ...initialOnboardingData,
      relationshipGoal: 'Intentional dating',
      sharedFaith: 'Essential',
    });

    expect(result.success).toBe(true);
  });

  it('rejects missing relationship goal', () => {
    const result = onboardingSchema.safeParse({
      ...initialOnboardingData,
      sharedFaith: 'Essential',
    });

    expect(result.success).toBe(false);
  });
});
