import { z } from 'zod';

import { animalSpeciesSchema, speciesSchema } from './species.js';
import { entityIdSchema, isoDateSchema, metadataObjectSchema } from './primitives.js';

export const subjectProfileTypeSchema = z.enum([
  'human',
  'rodent',
  'zebrafish_batch',
  'farm_animal',
  'generic',
]);

export const subjectStatusSchema = z.enum(['active', 'inactive', 'deceased', 'archived']);

export const consentStatusSchema = z.enum([
  'not_applicable',
  'pending',
  'consented',
  'withdrawn',
  'unknown',
]);

export const studyParticipationStatusSchema = z.enum([
  'screening',
  'enrolled',
  'completed',
  'withdrawn',
  'not_applicable',
]);

export const sexSchema = z.enum(['female', 'male', 'intersex', 'mixed', 'unknown', 'not_recorded']);

export const genderIdentitySchema = z.enum([
  'woman',
  'man',
  'non_binary',
  'self_described',
  'prefer_not_to_say',
  'not_recorded',
]);

export const welfareStatusSchema = z.enum([
  'normal',
  'watch',
  'concern',
  'critical',
  'not_assessed',
]);

export const developmentalStageSchema = z.enum([
  'embryo',
  'larva',
  'juvenile',
  'adult',
  'mixed',
  'not_recorded',
]);

export const humanSubjectProfileSchema = z.strictObject({
  profileType: z.literal('human'),
  pseudonymizedSubjectCode: z.string().trim().min(3),
  consentStatus: consentStatusSchema,
  studyParticipationStatus: studyParticipationStatusSchema,
  ageBand: z.string().trim().min(1).optional(),
  sex: sexSchema.optional(),
  genderIdentity: genderIdentitySchema.optional(),
});

export const rodentSubjectProfileSchema = z.strictObject({
  profileType: z.literal('rodent'),
  species: animalSpeciesSchema,
  strainId: entityIdSchema.optional(),
  lineId: entityIdSchema.optional(),
  genotypeId: entityIdSchema.optional(),
  sex: sexSchema,
  dateOfBirth: isoDateSchema.optional(),
  ageDays: z.number().int().nonnegative().optional(),
  housingUnitId: entityIdSchema.optional(),
  welfareStatus: welfareStatusSchema.default('not_assessed'),
});

export const zebrafishBatchProfileSchema = z.strictObject({
  profileType: z.literal('zebrafish_batch'),
  species: animalSpeciesSchema,
  batchIdentifier: z.string().trim().min(1),
  lineId: entityIdSchema.optional(),
  genotypeId: entityIdSchema.optional(),
  developmentalStage: developmentalStageSchema,
  tankId: entityIdSchema.optional(),
  count: z.number().int().nonnegative(),
  mortalityEventIds: z.array(entityIdSchema).default([]),
  environmentalObservationIds: z.array(entityIdSchema).default([]),
});

export const farmAnimalProfileSchema = z.strictObject({
  profileType: z.literal('farm_animal'),
  species: animalSpeciesSchema,
  groupIdentifier: z.string().trim().min(1),
  individualIdentifier: z.string().trim().min(1).optional(),
  birthDate: isoDateSchema.optional(),
  ageDescription: z.string().trim().min(1).optional(),
  sex: sexSchema,
  housingUnitId: entityIdSchema.optional(),
  welfareStatus: welfareStatusSchema.default('not_assessed'),
});

export const genericSubjectProfileSchema = z.strictObject({
  profileType: z.literal('generic'),
  species: speciesSchema.optional(),
  biologicalType: z.string().trim().min(1),
  metadata: metadataObjectSchema,
  extensibilityNotes: z.string().trim().min(1).optional(),
});

export const subjectProfileSchema = z.discriminatedUnion('profileType', [
  humanSubjectProfileSchema,
  rodentSubjectProfileSchema,
  zebrafishBatchProfileSchema,
  farmAnimalProfileSchema,
  genericSubjectProfileSchema,
]);

export const subjectSchema = z.strictObject({
  id: entityIdSchema,
  organizationId: entityIdSchema,
  subjectCode: z.string().trim().min(1),
  profileType: subjectProfileTypeSchema,
  status: subjectStatusSchema.default('active'),
  cohortId: entityIdSchema.optional(),
  speciesId: entityIdSchema.optional(),
});

export const subjectWithProfileSchema = subjectSchema
  .extend({
    profile: subjectProfileSchema,
  })
  .refine((subject) => subject.profileType === subject.profile.profileType, {
    message: 'Subject profile type must match the embedded profile type',
    path: ['profileType'],
  });

export const cohortSchema = z.strictObject({
  id: entityIdSchema,
  organizationId: entityIdSchema,
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  subjectIds: z.array(entityIdSchema).default([]),
});

export const lineSchema = z.strictObject({
  id: entityIdSchema,
  speciesId: entityIdSchema,
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
});

export const strainSchema = z.strictObject({
  id: entityIdSchema,
  speciesId: entityIdSchema,
  name: z.string().trim().min(1),
  source: z.string().trim().min(1).optional(),
});

export const genotypeSchema = z.strictObject({
  id: entityIdSchema,
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
});

export type SubjectProfileType = z.infer<typeof subjectProfileTypeSchema>;
export type SubjectProfile = z.infer<typeof subjectProfileSchema>;
export type HumanSubjectProfile = z.infer<typeof humanSubjectProfileSchema>;
export type RodentSubjectProfile = z.infer<typeof rodentSubjectProfileSchema>;
export type ZebrafishBatchProfile = z.infer<typeof zebrafishBatchProfileSchema>;
export type FarmAnimalProfile = z.infer<typeof farmAnimalProfileSchema>;
export type GenericSubjectProfile = z.infer<typeof genericSubjectProfileSchema>;
export type Subject = z.infer<typeof subjectSchema>;
export type SubjectWithProfile = z.infer<typeof subjectWithProfileSchema>;
