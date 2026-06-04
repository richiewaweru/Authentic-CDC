import { OnboardingAction, OnboardingData, OnboardingState } from '../../types/onboarding';

export const initialOnboardingData: OnboardingData = {
  relationshipGoal: null,
  spouseQualities: [],
  communicationStyle: null,
  conflictStyle: null,
  lifestyleVision: null,
  sharedActivities: [],
  sharedFaith: null,
  churchInvolvement: null,
  faithRole: '',
  futureHopes: '',
  authenticMeaning: '',
  ageRange: [22, 35],
  distanceRange: [5, 50],
  denominations: [],
  dealbreakers: {
    smoking: 'Prefer no',
    children: 'Open to kids',
    church: 'Prefer active',
    politics: 'Prefer similar',
  },
  notifications: {
    newAlignments: true,
    eventUpdates: true,
    communityUpdates: true,
  },
};

export const initialOnboardingState: OnboardingState = {
  step: 0,
  direction: 'forward',
  data: initialOnboardingData,
  validationStep: null,
  validationMessage: null,
};

export function onboardingReducer(
  state: OnboardingState,
  action: OnboardingAction,
): OnboardingState {
  switch (action.type) {
    case 'NEXT_STEP':
      return {
        ...state,
        step: Math.min(state.step + 1, 6),
        direction: 'forward',
        validationMessage: null,
        validationStep: null,
      };
    case 'PREV_STEP':
      return {
        ...state,
        step: Math.max(state.step - 1, 0),
        direction: 'back',
        validationMessage: null,
        validationStep: null,
      };
    case 'GO_TO_STEP':
      return {
        ...state,
        step: action.step,
        direction: action.step >= state.step ? 'forward' : 'back',
      };
    case 'UPDATE_DATA':
      return {
        ...state,
        data: {
          ...state.data,
          ...action.payload,
          dealbreakers: {
            ...state.data.dealbreakers,
            ...(action.payload.dealbreakers ?? {}),
          },
          notifications: {
            ...state.data.notifications,
            ...(action.payload.notifications ?? {}),
          },
        },
        validationMessage: null,
        validationStep: null,
      };
    case 'SET_VALIDATION':
      return {
        ...state,
        validationStep: action.step,
        validationMessage: action.message,
      };
    case 'CLEAR_VALIDATION':
      return {
        ...state,
        validationMessage: null,
        validationStep: null,
      };
    case 'HYDRATE':
      return action.payload;
    case 'RESET':
      return initialOnboardingState;
    default:
      return state;
  }
}
