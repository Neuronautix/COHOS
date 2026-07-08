import { z } from 'zod';

import { entityIdSchema, isoDateSchema, metadataObjectSchema } from './primitives.js';

export const roleSchema = z.strictObject({
  id: entityIdSchema,
  organizationId: entityIdSchema,
  name: z.string().trim().min(1),
  permissions: z.array(z.string().trim().min(1)).default([]),
});

export const organizationSchema = z.strictObject({
  id: entityIdSchema,
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
});

export const userSchema = z.strictObject({
  id: entityIdSchema,
  organizationId: entityIdSchema,
  displayName: z.string().trim().min(1),
  roleIds: z.array(entityIdSchema).default([]),
});

export const investigationSchema = z.strictObject({
  id: entityIdSchema,
  organizationId: entityIdSchema,
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  startsOn: isoDateSchema.optional(),
  endsOn: isoDateSchema.optional(),
});

export const studySchema = z.strictObject({
  id: entityIdSchema,
  investigationId: entityIdSchema,
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  subjectIds: z.array(entityIdSchema).default([]),
  cohortIds: z.array(entityIdSchema).default([]),
});

export const assaySchema = z.strictObject({
  id: entityIdSchema,
  studyId: entityIdSchema,
  title: z.string().trim().min(1),
  measurementType: z.string().trim().min(1).optional(),
  technologyType: z.string().trim().min(1).optional(),
});

export const procedureSchema = z.strictObject({
  id: entityIdSchema,
  assayId: entityIdSchema,
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
});

export const sampleSchema = z.strictObject({
  id: entityIdSchema,
  subjectId: entityIdSchema,
  assayId: entityIdSchema.optional(),
  sampleCode: z.string().trim().min(1),
  sampleType: z.string().trim().min(1),
  collectedOn: isoDateSchema.optional(),
});

export const datasetSchema = z.strictObject({
  id: entityIdSchema,
  assayId: entityIdSchema.optional(),
  sampleId: entityIdSchema.optional(),
  title: z.string().trim().min(1),
  format: z.string().trim().min(1),
  uri: z.string().url().optional(),
});

export const connectedResourceLinkSchema = z.strictObject({
  id: entityIdSchema,
  organizationId: entityIdSchema,
  entityType: z.string().trim().min(1),
  entityId: entityIdSchema,
  label: z.string().trim().min(1),
  url: z.string().url(),
  metadata: metadataObjectSchema.default({}),
});

export const assayDetailSchema = assaySchema.extend({
  procedures: z.array(procedureSchema).default([]),
  samples: z.array(sampleSchema).default([]),
  datasets: z.array(datasetSchema).default([]),
  connectedResources: z.array(connectedResourceLinkSchema).default([]),
});

export const studyDetailSchema = studySchema.extend({
  assays: z.array(assayDetailSchema).default([]),
  connectedResources: z.array(connectedResourceLinkSchema).default([]),
});

export const investigationDetailSchema = investigationSchema.extend({
  studies: z.array(studyDetailSchema).default([]),
  connectedResources: z.array(connectedResourceLinkSchema).default([]),
});

export const researchVocabularyTermSchema = z.strictObject({
  canonical: z.enum(['investigation', 'study', 'assay']),
  equivalentTerms: z.array(z.string().trim().min(1)).default([]),
  description: z.string().trim().min(1),
});

export const researchVocabularySchema = z.strictObject({
  terms: z.array(researchVocabularyTermSchema),
});

export type Organization = z.infer<typeof organizationSchema>;
export type User = z.infer<typeof userSchema>;
export type Role = z.infer<typeof roleSchema>;
export type Investigation = z.infer<typeof investigationSchema>;
export type Study = z.infer<typeof studySchema>;
export type Assay = z.infer<typeof assaySchema>;
export type Procedure = z.infer<typeof procedureSchema>;
export type Sample = z.infer<typeof sampleSchema>;
export type Dataset = z.infer<typeof datasetSchema>;
export type ConnectedResourceLink = z.infer<typeof connectedResourceLinkSchema>;
export type AssayDetail = z.infer<typeof assayDetailSchema>;
export type StudyDetail = z.infer<typeof studyDetailSchema>;
export type InvestigationDetail = z.infer<typeof investigationDetailSchema>;
export type ResearchVocabularyTerm = z.infer<typeof researchVocabularyTermSchema>;
export type ResearchVocabulary = z.infer<typeof researchVocabularySchema>;
