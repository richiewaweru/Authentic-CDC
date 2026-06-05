import { z } from 'zod';

export const onboardingSchema = z.object({
  relationshipGoal: z.string().nullable().refine(Boolean, {
    message: 'Choose the relationship you are seeking.',
  }),
  communicationStyle: z.string().nullable().refine(Boolean, {
    message: 'Choose the communication style that best fits you.',
  }),
  conflictStyle: z.string().nullable().refine(Boolean, {
    message: 'Choose how you usually handle conflict.',
  }),
  lifestyleVision: z.string().nullable().refine(Boolean, {
    message: 'Choose the lifestyle vision that feels closest to you.',
  }),
  sharedFaith: z.string().nullable().refine(Boolean, {
    message: 'Select how important shared Christian faith is to you.',
  }),
  churchInvolvement: z.string().nullable().refine(Boolean, {
    message: 'Select your current church involvement.',
  }),
  futureHopes: z.string().trim().min(1, {
    message: 'Share a short note about what you hope for.',
  }),
  ageRange: z
    .tuple([z.number().min(18).max(65), z.number().min(18).max(65)])
    .refine(([min, max]) => min < max, { message: 'Choose a valid age range.' }),
  distanceRange: z
    .tuple([z.number().min(5).max(200), z.number().min(5).max(200)])
    .refine(([min, max]) => min < max, { message: 'Choose a valid distance range.' }),
});
