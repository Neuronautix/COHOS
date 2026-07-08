import { z } from 'zod';

import { entityIdSchema } from './primitives.js';

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

export type Facility = z.infer<typeof facilitySchema>;
export type Room = z.infer<typeof roomSchema>;
export type Rack = z.infer<typeof rackSchema>;
export type HousingUnit = z.infer<typeof housingUnitSchema>;
export type Cage = z.infer<typeof cageSchema>;
export type Tank = z.infer<typeof tankSchema>;
