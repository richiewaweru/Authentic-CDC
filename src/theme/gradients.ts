export const gradients = {
  heroDark: {
    colors: ['#082717', '#1F3D2B', '#2A4A35'] as const,
    locations: [0, 0.55, 1] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  sandLight: {
    colors: ['#E9E2D6', '#F7F5F2'] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  pathFill: {
    colors: ['#1F3D2B', '#C6A85E'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
} as const;
