import { z } from 'zod';

import { entityIdSchema, isoDateTimeSchema } from './primitives.js';
import { subjectProfileTypeSchema, subjectStatusSchema } from './subjects.js';

export const housingUnitTypeSchema = z.enum(['cage', 'tank', 'pasture', 'pen', 'room', 'other']);

export const facilitySchema = z.strictObject({
  id: entityIdSchema,
  organizationId: entityIdSchema,
  name: z.string().trim().min(1),
  code: z.string().trim().min(1),
});

export const roomSchema = z.strictObject({
  id: entityIdSchema,
  facilityId: entityIdSchema,
  name: z.string().trim().min(1),
  code: z.string().trim().min(1),
});

export const rackSchema = z.strictObject({
  id: entityIdSchema,
  roomId: entityIdSchema,
  name: z.string().trim().min(1),
  code: z.string().trim().min(1),
});

export const housingUnitSchema = z.strictObject({
  id: entityIdSchema,
  roomId: entityIdSchema,
  rackId: entityIdSchema.optional(),
  type: housingUnitTypeSchema,
  name: z.string().trim().min(1),
  code: z.string().trim().min(1),
});

export const cageSchema = housingUnitSchema.extend({
  type: z.literal('cage'),
  cageType: z.string().trim().min(1).optional(),
});

export const tankSchema = housingUnitSchema.extend({
  type: z.literal('tank'),
  volumeLiters: z.number().positive().optional(),
});

export const housingOccupantSummarySchema = z.strictObject({
  subjectId: entityIdSchema,
  subjectCode: z.string().trim().min(1),
  profileType: subjectProfileTypeSchema,
  status: subjectStatusSchema,
  count: z.number().int().nonnegative().optional(),
});

export const environmentalObservationSummarySchema = z.strictObject({
  id: entityIdSchema,
  housingUnitId: entityIdSchema,
  occurredAt: isoDateTimeSchema,
  metric: z.string().trim().min(1),
  value: z.number(),
  unit: z.string().trim().min(1),
});

export const housingUnitSummarySchema = housingUnitSchema.extend({
  currentOccupantSubjectIds: z.array(entityIdSchema).default([]),
  currentOccupantCount: z.number().int().nonnegative().default(0),
  recentEnvironmentalObservationIds: z.array(entityIdSchema).default([]),
});

export const roomHierarchySchema = roomSchema.extend({
  racks: z.array(rackSchema).default([]),
  housingUnits: z.array(housingUnitSummarySchema).default([]),
});

export const facilityHierarchySchema = facilitySchema.extend({
  rooms: z.array(roomHierarchySchema).default([]),
});

const environmentalObservationTargetSchema = z.strictObject({
  housingUnitId: entityIdSchema,
  supportedEventType: z.literal('environmental_observation'),
});

const transferTargetSchema = z.strictObject({
  housingUnitId: entityIdSchema,
  supportedEventType: z.literal('transfer'),
});

const housingUnitDetailFields = {
  occupants: z.array(housingOccupantSummarySchema).default([]),
  recentEnvironmentalObservations: z.array(environmentalObservationSummarySchema).default([]),
  environmentalObservationTarget: environmentalObservationTargetSchema,
  transferTarget: transferTargetSchema,
};

export const cageDetailSchema = cageSchema.extend(housingUnitDetailFields);
export const tankDetailSchema = tankSchema.extend(housingUnitDetailFields);
export const otherHousingUnitDetailSchema = housingUnitSchema
  .extend({
    type: z.enum(['pasture', 'pen', 'room', 'other']),
  })
  .extend(housingUnitDetailFields);

export const housingUnitDetailSchema = z.discriminatedUnion('type', [
  cageDetailSchema,
  tankDetailSchema,
  otherHousingUnitDetailSchema,
]);

export type Facility = z.infer<typeof facilitySchema>;
export type Room = z.infer<typeof roomSchema>;
export type Rack = z.infer<typeof rackSchema>;
export type HousingUnit = z.infer<typeof housingUnitSchema>;
export type Cage = z.infer<typeof cageSchema>;
export type Tank = z.infer<typeof tankSchema>;
export type HousingOccupantSummary = z.infer<typeof housingOccupantSummarySchema>;
export type EnvironmentalObservationSummary = z.infer<typeof environmentalObservationSummarySchema>;
export type HousingUnitSummary = z.infer<typeof housingUnitSummarySchema>;
export type RoomHierarchy = z.infer<typeof roomHierarchySchema>;
export type FacilityHierarchy = z.infer<typeof facilityHierarchySchema>;
export type HousingUnitDetail = z.infer<typeof housingUnitDetailSchema>;
