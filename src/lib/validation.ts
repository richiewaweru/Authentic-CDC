import { z } from 'zod';

export const onboardingSchema = z.object({
  relationshipGoal: z.string().nullable().refine(Boolean, {
    message: 'Choose the relationship you are seeking.',
  }),
  sharedFaith: z.string().nullable().refine(Boolean, {
    message: 'Select how important shared Christian faith is to you.',
  }),
  ageRange: z
    .tuple([z.number().min(18).max(65), z.number().min(18).max(65)])
    .refine(([min, max]) => min < max, { message: 'Choose a valid age range.' }),
  distanceRange: z
    .tuple([z.number().min(5).max(200), z.number().min(5).max(200)])
    .refine(([min, max]) => min < max, { message: 'Choose a valid distance range.' }),
});
