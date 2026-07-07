export const motion = {
  duration: {
    fast: 150,
    pressOut: 200,
    cardSelect: 250,
    sectionEnter: 300,
    pathAdvance: 400,
    iconPulse: 600,
    confirmationShimmer: 900,
  },
  easing: {
    standard: [0.4, 0, 0.2, 1] as const,
  },
} as const;
