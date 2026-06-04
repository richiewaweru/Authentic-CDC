import { onboardingReducer, initialOnboardingState } from '../src/screens/onboarding/state';

describe('onboardingReducer', () => {
  it('moves forward and backward while retaining updates', () => {
    const updated = onboardingReducer(initialOnboardingState, {
      type: 'UPDATE_DATA',
      payload: { relationshipGoal: 'Intentional dating' },
    });

    const next = onboardingReducer(updated, { type: 'NEXT_STEP' });
    const previous = onboardingReducer(next, { type: 'PREV_STEP' });

    expect(next.step).toBe(1);
    expect(previous.step).toBe(0);
    expect(previous.data.relationshipGoal).toBe('Intentional dating');
  });

  it('merges nested objects without losing sibling values', () => {
    const updated = onboardingReducer(initialOnboardingState, {
      type: 'UPDATE_DATA',
      payload: {
        dealbreakers: {
          ...initialOnboardingState.data.dealbreakers,
          smoking: 'Dealbreaker',
        },
      },
    });

    expect(updated.data.dealbreakers.smoking).toBe('Dealbreaker');
    expect(updated.data.dealbreakers.children).toBe('Open to kids');
  });
});
