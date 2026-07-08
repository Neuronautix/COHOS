import { entityIdSchema, isoDateTimeSchema } from '@cohos/domain';
import { z } from 'zod';

const eventCommandBaseSchema = z.strictObject({
  organizationId: entityIdSchema,
  occurredAt: isoDateTimeSchema,
  recordedByUserId: entityIdSchema,
  reason: z.string().trim().min(1).optional(),
});

export const recordTransferSchema = eventCommandBaseSchema.extend({
  subjectId: entityIdSchema,
  fromHousingUnitId: entityIdSchema.optional(),
  toHousingUnitId: entityIdSchema,
});

export const recordMortalitySchema = eventCommandBaseSchema.extend({
  subjectId: entityIdSchema,
  housingUnitId: entityIdSchema.optional(),
  count: z.number().int().positive().default(1),
  cause: z.string().trim().min(1).optional(),
});

export const recordWelfareObservationSchema = eventCommandBaseSchema.extend({
  subjectId: entityIdSchema,
  score: z.number().int().min(0).max(5),
  status: z.enum(['normal', 'watch', 'concern', 'critical']),
  notes: z.string().trim().min(1).optional(),
});

export const recordEnvironmentalObservationSchema = eventCommandBaseSchema.extend({
  housingUnitId: entityIdSchema,
  metric: z.string().trim().min(1),
  value: z.number(),
  unit: z.string().trim().min(1),
});

export type RecordTransferDto = z.infer<typeof recordTransferSchema>;
export type RecordMortalityDto = z.infer<typeof recordMortalitySchema>;
export type RecordWelfareObservationDto = z.infer<typeof recordWelfareObservationSchema>;
export type RecordEnvironmentalObservationDto = z.infer<
  typeof recordEnvironmentalObservationSchema
>;
