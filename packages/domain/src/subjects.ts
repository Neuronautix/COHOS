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

export type SubjectProfileType = z.infer<typeof subjectProfileTypeSchema>;

export const subjectStatusSchema = z.enum(['active', 'inactive', 'deceased', 'archived']);

export const subjectAggregateKindSchema = z.enum(['batch', 'group', 'cohort']);

export type SubjectAggregateKind = z.infer<typeof subjectAggregateKindSchema>;

export const subjectAggregateStatusSchema = z.enum(['planned', 'active', 'closed', 'archived']);

export const aggregateCountUnitSchema = z.enum([
  'individuals',
  'animals',
  'embryos',
  'larvae',
  'samples',
  'cultures',
]);

export const subjectBatchOriginTypeSchema = z.enum([
  'litter',
  'shipment',
  'spawn',
  'hatch',
  'birth_lot',
  'culture_lot',
  'sample_batch',
  'recruitment_wave',
  'other',
]);

export const subjectGroupPurposeSchema = z.enum([
  'housing',
  'treatment',
  'management',
  'operational',
  'social',
  'other',
]);

export const subjectGroupMembershipPolicySchema = z.enum([
  'static',
  'dynamic',
  'scheduled',
  'event_derived',
]);

export const subjectCohortKindSchema = z.enum([
  'observational',
  'interventional_arm',
  'analysis_set',
  'screening',
  'recruitment_wave',
]);

export const subjectRandomizationUnitSchema = z.enum([
  'subject',
  'batch',
  'group',
  'cage',
  'tank',
  'pen',
  'not_applicable',
]);

export const subjectBlindingSchema = z.enum([
  'none',
  'single',
  'double',
  'assessor_blinded',
  'not_recorded',
]);

export const subjectAggregateMembershipRoleSchema = z.enum([
  'member',
  'source',
  'descendant',
  'randomized_unit',
  'housing_member',
  'analysis_member',
]);

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

export const subjectBatchMetadataSchema = z.strictObject({
  originType: subjectBatchOriginTypeSchema,
  sourceOrganization: z.string().trim().min(1).optional(),
  parentSubjectIds: z.array(entityIdSchema).default([]),
  sourceAggregateIds: z.array(entityIdSchema).default([]),
  lineId: entityIdSchema.optional(),
  strainId: entityIdSchema.optional(),
  genotypeId: entityIdSchema.optional(),
  birthDate: isoDateSchema.optional(),
  spawnDate: isoDateSchema.optional(),
  hatchDate: isoDateSchema.optional(),
  arrivalDate: isoDateSchema.optional(),
  developmentalStage: developmentalStageSchema.optional(),
  sexComposition: sexSchema.optional(),
  initialCount: z.number().int().nonnegative(),
  currentCount: z.number().int().nonnegative().optional(),
  countUnit: aggregateCountUnitSchema,
  splitMergeEventIds: z.array(entityIdSchema).default([]),
});

export const subjectGroupMetadataSchema = z.strictObject({
  groupPurpose: subjectGroupPurposeSchema,
  housingUnitId: entityIdSchema.optional(),
  environmentalContext: metadataObjectSchema.default({}),
  husbandryProtocolId: entityIdSchema.optional(),
  diet: z.string().trim().min(1).optional(),
  density: z
    .strictObject({
      value: z.number().nonnegative(),
      unit: z.string().trim().min(1),
    })
    .optional(),
  membershipPolicy: subjectGroupMembershipPolicySchema,
});

export const subjectCohortMetadataSchema = z.strictObject({
  cohortKind: subjectCohortKindSchema,
  studyId: entityIdSchema.optional(),
  inclusionCriteria: z.array(z.string().trim().min(1)).default([]),
  exclusionCriteria: z.array(z.string().trim().min(1)).default([]),
  recruitmentSource: z.string().trim().min(1).optional(),
  exposure: z.string().trim().min(1).optional(),
  intervention: z.string().trim().min(1).optional(),
  randomizationMethod: z.string().trim().min(1).optional(),
  randomizationUnit: subjectRandomizationUnitSchema.optional(),
  blinding: subjectBlindingSchema.default('not_recorded'),
  plannedSize: z.number().int().positive().optional(),
  followUpSchedule: z.array(z.string().trim().min(1)).default([]),
});

const subjectAggregateBaseSchema = z.strictObject({
  id: entityIdSchema,
  organizationId: entityIdSchema,
  code: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  profileTypes: z.array(subjectProfileTypeSchema).default([]),
  speciesId: entityIdSchema.optional(),
  status: subjectAggregateStatusSchema.default('active'),
  validFrom: isoDateSchema.optional(),
  validTo: isoDateSchema.optional(),
  metadata: metadataObjectSchema.default({}),
  subjectIds: z.array(entityIdSchema).default([]),
});

export const subjectBatchAggregateSchema = subjectAggregateBaseSchema.extend({
  kind: z.literal('batch'),
  batch: subjectBatchMetadataSchema,
});

export const subjectGroupAggregateSchema = subjectAggregateBaseSchema.extend({
  kind: z.literal('group'),
  group: subjectGroupMetadataSchema,
});

export const subjectCohortAggregateSchema = subjectAggregateBaseSchema.extend({
  kind: z.literal('cohort'),
  cohort: subjectCohortMetadataSchema,
});

export const subjectAggregateSchema = z
  .discriminatedUnion('kind', [
    subjectBatchAggregateSchema,
    subjectGroupAggregateSchema,
    subjectCohortAggregateSchema,
  ])
  .superRefine((aggregate, context) => {
    if (
      aggregate.validFrom !== undefined &&
      aggregate.validTo !== undefined &&
      aggregate.validTo < aggregate.validFrom
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Aggregate validTo must be on or after validFrom',
        path: ['validTo'],
      });
    }
  });

export const subjectAggregateMembershipSchema = z
  .strictObject({
    subjectId: entityIdSchema,
    aggregateId: entityIdSchema,
    aggregateKind: subjectAggregateKindSchema,
    aggregateCode: z.string().trim().min(1).optional(),
    aggregateName: z.string().trim().min(1).optional(),
    role: subjectAggregateMembershipRoleSchema.default('member'),
    validFrom: isoDateSchema.optional(),
    validTo: isoDateSchema.optional(),
    count: z.number().int().nonnegative().optional(),
    metadata: metadataObjectSchema.default({}),
  })
  .superRefine((membership, context) => {
    if (
      membership.validFrom !== undefined &&
      membership.validTo !== undefined &&
      membership.validTo < membership.validFrom
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Membership validTo must be on or after validFrom',
        path: ['validTo'],
      });
    }
  });

type SubjectAggregateBehavior = {
  readonly subjectUnit: 'individual' | 'counted_batch' | 'individual_or_group' | 'material';
  readonly primaryAggregateKinds: readonly SubjectAggregateKind[];
  readonly optionalAggregateKinds: readonly SubjectAggregateKind[];
  readonly metadataFocus: readonly string[];
};

export const subjectAggregateBehaviorByProfileType = {
  human: {
    subjectUnit: 'individual',
    primaryAggregateKinds: ['cohort'],
    optionalAggregateKinds: ['batch', 'group'],
    metadataFocus: [
      'pseudonymization',
      'consent status',
      'eligibility criteria',
      'recruitment source',
      'follow-up schedule',
    ],
  },
  rodent: {
    subjectUnit: 'individual',
    primaryAggregateKinds: ['batch', 'group', 'cohort'],
    optionalAggregateKinds: [],
    metadataFocus: [
      'litter or shipment provenance',
      'strain and genotype',
      'cage or treatment group',
      'allocation method',
      'welfare context',
    ],
  },
  zebrafish_batch: {
    subjectUnit: 'counted_batch',
    primaryAggregateKinds: ['batch', 'group', 'cohort'],
    optionalAggregateKinds: [],
    metadataFocus: [
      'spawn or hatch provenance',
      'developmental stage',
      'tank context',
      'count history',
      'environmental context',
    ],
  },
  farm_animal: {
    subjectUnit: 'individual_or_group',
    primaryAggregateKinds: ['batch', 'group', 'cohort'],
    optionalAggregateKinds: [],
    metadataFocus: [
      'birth lot or shipment',
      'herd, flock, pen, or pasture membership',
      'management exposure',
      'trial allocation',
      'welfare status',
    ],
  },
  generic: {
    subjectUnit: 'material',
    primaryAggregateKinds: ['batch', 'cohort'],
    optionalAggregateKinds: ['group'],
    metadataFocus: [
      'culture lot or pooled biospecimen provenance',
      'biological material type',
      'processing metadata',
      'analysis set',
    ],
  },
} satisfies Record<SubjectProfileType, SubjectAggregateBehavior>;

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
    aggregateMemberships: z.array(subjectAggregateMembershipSchema).optional(),
    profile: subjectProfileSchema,
  })
  .refine((subject) => subject.profileType === subject.profile.profileType, {
    message: 'Subject profile type must match the embedded profile type',
    path: ['profileType'],
  })
  .superRefine((subject, context) => {
    if (
      subject.profile.profileType === 'human' &&
      subject.subjectCode !== subject.profile.pseudonymizedSubjectCode
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Human subject code must match the pseudonymized subject code',
        path: ['subjectCode'],
      });
    }
  });

export const cohortSchema = subjectCohortAggregateSchema;

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

export type SubjectAggregate = z.infer<typeof subjectAggregateSchema>;
export type SubjectBatchAggregate = z.infer<typeof subjectBatchAggregateSchema>;
export type SubjectGroupAggregate = z.infer<typeof subjectGroupAggregateSchema>;
export type SubjectCohortAggregate = z.infer<typeof subjectCohortAggregateSchema>;
export type SubjectAggregateMembership = z.infer<typeof subjectAggregateMembershipSchema>;
export type Cohort = z.infer<typeof cohortSchema>;
export type SubjectProfile = z.infer<typeof subjectProfileSchema>;
export type HumanSubjectProfile = z.infer<typeof humanSubjectProfileSchema>;
export type RodentSubjectProfile = z.infer<typeof rodentSubjectProfileSchema>;
export type ZebrafishBatchProfile = z.infer<typeof zebrafishBatchProfileSchema>;
export type FarmAnimalProfile = z.infer<typeof farmAnimalProfileSchema>;
export type GenericSubjectProfile = z.infer<typeof genericSubjectProfileSchema>;
export type Subject = z.infer<typeof subjectSchema>;
export type SubjectWithProfile = z.infer<typeof subjectWithProfileSchema>;
