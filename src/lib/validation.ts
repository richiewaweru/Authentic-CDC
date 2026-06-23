import { z } from 'zod';

const distanceRadiusSchema = z.union([
  z.literal(10),
  z.literal(25),
  z.literal(50),
  z.literal(100),
]);
const distanceTypeSchema = z.enum(['radius', 'state', 'open']).default('open');

const ageRangeSchema = z
  .tuple([z.number().min(18).max(65), z.number().min(18).max(65)])
  .refine(([min, max]) => min < max, { message: 'Choose a valid age range.' });

const personalProfileStepSchema = z.object({
  firstName: z.string().trim().min(1, {
    message: 'Please enter your first name.',
  }),
  gender: z
    .enum(['man', 'woman', 'prefer_not_to_say'])
    .optional()
    .refine(Boolean, {
      message: 'Please select one.',
    }),
  dateOfBirth: z.string().refine((value) => {
    if (!value) {
      return false;
    }

    const age = (Date.now() - new Date(value).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    return age >= 18;
  }, {
    message: 'You must be at least 18 to join.',
  }),
});

const relationshipStepSchema = z.object({
  relationshipGoal: z.string().nullable().refine(Boolean, {
    message: 'Choose the relationship you are seeking.',
  }),
});

const communicationStepSchema = z.object({
  communicationStyle: z.string().nullable().refine(Boolean, {
    message: 'Choose the communication style that best fits you.',
  }),
  conflictStyle: z.string().nullable().refine(Boolean, {
    message: 'Choose how you usually handle conflict.',
  }),
});

const lifestyleStepSchema = z.object({
  lifestyleVision: z.string().nullable().refine(Boolean, {
    message: 'Choose the lifestyle vision that feels closest to you.',
  }),
});

const faithStepSchema = z.object({
  sharedFaith: z.string().nullable().refine(Boolean, {
    message: 'Select how important shared Christian faith is to you.',
  }),
  churchInvolvement: z.string().nullable().refine(Boolean, {
    message: 'Select your current church involvement.',
  }),
});

const futureVisionStepSchema = z.object({
  futureHopes: z.string().trim().min(1, {
    message: 'Share a short note about what you hope for.',
  }),
});

const preferencesStepSchema = z
  .object({
    ageRange: ageRangeSchema,
    distanceType: distanceTypeSchema,
    distanceRadiusMiles: distanceRadiusSchema.optional(),
  })
  .refine(
    (data) => data.distanceType !== 'radius' || Boolean(data.distanceRadiusMiles),
    {
      message: 'Choose a nearby distance.',
      path: ['distanceRadiusMiles'],
    },
  );

export const onboardingStepSchemas = [
  personalProfileStepSchema,
  relationshipStepSchema,
  communicationStepSchema,
  lifestyleStepSchema,
  faithStepSchema,
  futureVisionStepSchema,
  preferencesStepSchema,
] as const;

export const onboardingSchema = z
  .object({
    firstName: personalProfileStepSchema.shape.firstName,
    lastName: z.string().optional(),
    dateOfBirth: personalProfileStepSchema.shape.dateOfBirth,
    gender: personalProfileStepSchema.shape.gender,
    cityState: z.string().optional(),
    bio: z.string().max(150, { message: 'Keep your bio to 150 characters or fewer.' }).optional(),
    relationshipGoal: relationshipStepSchema.shape.relationshipGoal,
    communicationStyle: communicationStepSchema.shape.communicationStyle,
    conflictStyle: communicationStepSchema.shape.conflictStyle,
    lifestyleVision: lifestyleStepSchema.shape.lifestyleVision,
    sharedFaith: faithStepSchema.shape.sharedFaith,
    churchInvolvement: faithStepSchema.shape.churchInvolvement,
    futureHopes: futureVisionStepSchema.shape.futureHopes,
    ageRange: ageRangeSchema,
    distanceRange: z
      .tuple([z.number().min(5).max(200), z.number().min(5).max(200)])
      .refine(([min, max]) => min < max, { message: 'Choose a valid distance range.' }),
    distanceType: distanceTypeSchema,
    distanceRadiusMiles: distanceRadiusSchema.optional(),
  })
  .refine(
    (data) => data.distanceType !== 'radius' || Boolean(data.distanceRadiusMiles),
    {
      message: 'Choose a nearby distance.',
      path: ['distanceRadiusMiles'],
    },
  );
