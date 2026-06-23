export type Direction = 'forward' | 'back';

export type DealbreakerValue = string;
export type DistanceType = 'radius' | 'state' | 'open';
export type DistanceRadiusMiles = 10 | 25 | 50 | 100;
export type Gender = 'man' | 'woman' | 'prefer_not_to_say';

export interface OnboardingData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  cityState?: string;
  bio?: string;
  relationshipGoal: string | null;
  spouseQualities: string[];
  communicationStyle: string | null;
  conflictStyle: string | null;
  lifestyleVision: string | null;
  sharedActivities: string[];
  sharedFaith: string | null;
  churchInvolvement: string | null;
  faithRole: string;
  futureHopes: string;
  authenticMeaning: string;
  ageRange: [number, number];
  distanceRange: [number, number];
  distanceType: DistanceType;
  distanceRadiusMiles: DistanceRadiusMiles;
  denominations: string[];
  dealbreakers: {
    smoking: DealbreakerValue;
    children: DealbreakerValue;
    church: DealbreakerValue;
    politics: DealbreakerValue;
  };
  notifications: {
    newAlignments: boolean;
    eventUpdates: boolean;
    communityUpdates: boolean;
  };
}

export interface OnboardingState {
  step: number;
  direction: Direction;
  data: OnboardingData;
  validationStep?: number | null;
  validationMessage?: string | null;
}

export type OnboardingAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; step: number }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; payload: OnboardingState }
  | { type: 'CLEAR_VALIDATION' }
  | { type: 'SET_VALIDATION'; step: number; message: string }
  | {
      type: 'UPDATE_DATA';
      payload: Partial<OnboardingData>;
    };
