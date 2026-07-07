import { colors } from './colors';

export const shadows = {
  contact: {
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  ambient: {
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 4,
  },
  selection: {
    shadowColor: colors.gold,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 5,
  },
} as const;
