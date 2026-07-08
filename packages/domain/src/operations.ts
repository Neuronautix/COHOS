import { z } from 'zod';

import {
  auditSnapshotSchema,
  entityIdSchema,
  isoDateTimeSchema,
  metadataObjectSchema,
} from './primitives.js';

export const eventTypeSchema = z.enum([
  'transfer',
  'mortality',
  'welfare_observation',
  'environmental_observation',
]);

export const alertSeveritySchema = z.enum(['info', 'warning', 'critical']);
export const aliveStatusSchema = z.enum(['alive', 'deceased']);
export const requestStatusSchema = z.enum([
  'draft',
  'submitted',
  'approved',
  'rejected',
  'cancelled',
]);
export const taskStatusSchema = z.enum(['open', 'in_progress', 'done', 'cancelled']);

export const eventBaseSchema = z.strictObject({
  id: entityIdSchema,
  organizationId: entityIdSchema,
  subjectId: entityIdSchema.optional(),
  housingUnitId: entityIdSchema.optional(),
  occurredAt: isoDateTimeSchema,
  recordedByUserId: entityIdSchema,
  reason: z.string().trim().min(1).optional(),
});

export const transferEventSchema = eventBaseSchema.extend({
  eventType: z.literal('transfer'),
  fromHousingUnitId: entityIdSchema.optional(),
  toHousingUnitId: entityIdSchema,
});

export const mortalityEventSchema = eventBaseSchema.extend({
  eventType: z.literal('mortality'),
  count: z.number().int().positive().default(1),
  cause: z.string().trim().min(1).optional(),
});

export const welfareObservationSchema = eventBaseSchema.extend({
  eventType: z.literal('welfare_observation'),
  score: z.number().int().min(0).max(5),
  status: z.enum(['normal', 'watch', 'concern', 'critical']),
  notes: z.string().trim().min(1).optional(),
});

export const environmentalObservationSchema = eventBaseSchema.extend({
  eventType: z.literal('environmental_observation'),
  metric: z.string().trim().min(1),
  value: z.number(),
  unit: z.string().trim().min(1),
});

export const eventSchema = z.discriminatedUnion('eventType', [
  transferEventSchema,
  mortalityEventSchema,
  welfareObservationSchema,
  environmentalObservationSchema,
]);

export const auditEventSchema = z.strictObject({
  id: entityIdSchema,
  organizationId: entityIdSchema,
  actorUserId: entityIdSchema,
  entityType: z.string().trim().min(1),
  entityId: entityIdSchema,
  action: z.string().trim().min(1),
  reason: z.string().trim().min(1).optional(),
  previousValue: auditSnapshotSchema.optional(),
  newValue: auditSnapshotSchema.optional(),
  createdAt: isoDateTimeSchema,
  requestId: entityIdSchema.optional(),
  correlationId: entityIdSchema.optional(),
  source: z.string().trim().min(1),
  eventId: entityIdSchema.optional(),
});

export const derivedAlertCodeSchema = z.enum([
  'mortality_recorded',
  'batch_depleted',
  'welfare_watch',
  'welfare_concern',
  'welfare_critical',
  'environmental_recorded',
]);

export const derivedAlertFlagSchema = z.strictObject({
  code: derivedAlertCodeSchema,
  severity: alertSeveritySchema,
  message: z.string().trim().min(1),
  sourceEventId: entityIdSchema,
});

export const subjectEventStateSchema = z.strictObject({
  subjectId: entityIdSchema,
  aliveStatus: aliveStatusSchema.default('alive'),
  currentHousingUnitId: entityIdSchema.optional(),
  batchCount: z.number().int().nonnegative().optional(),
  latestWelfareStatus: z.enum(['normal', 'watch', 'concern', 'critical']).optional(),
  latestEventId: entityIdSchema.optional(),
  alertFlags: z.array(derivedAlertFlagSchema).default([]),
});

export const housingEventStateSchema = z.strictObject({
  housingUnitId: entityIdSchema,
  latestEnvironmentalObservationId: entityIdSchema.optional(),
  alertFlags: z.array(derivedAlertFlagSchema).default([]),
});

export const requestSchema = z.strictObject({
  id: entityIdSchema,
  organizationId: entityIdSchema,
  requestedByUserId: entityIdSchema,
  title: z.string().trim().min(1),
  status: requestStatusSchema.default('draft'),
  metadata: metadataObjectSchema.default({}),
});

export const approvalSchema = z.strictObject({
  id: entityIdSchema,
  requestId: entityIdSchema,
  approverUserId: entityIdSchema,
  decision: z.enum(['approved', 'rejected']),
  decidedAt: isoDateTimeSchema,
  reason: z.string().trim().min(1).optional(),
});

export const taskSchema = z.strictObject({
  id: entityIdSchema,
  organizationId: entityIdSchema,
  title: z.string().trim().min(1),
  status: taskStatusSchema.default('open'),
  assigneeUserId: entityIdSchema.optional(),
  dueAt: isoDateTimeSchema.optional(),
});

export const alertSchema = z.strictObject({
  id: entityIdSchema,
  organizationId: entityIdSchema,
  severity: alertSeveritySchema,
  title: z.string().trim().min(1),
  entityType: z.string().trim().min(1),
  entityId: entityIdSchema,
  createdAt: isoDateTimeSchema,
  resolvedAt: isoDateTimeSchema.optional(),
});

export const connectorCredentialSchema = z.strictObject({
  id: entityIdSchema,
  organizationId: entityIdSchema,
  connectorType: z.string().trim().min(1),
  credentialReference: z.string().trim().min(1),
  createdAt: isoDateTimeSchema,
});

export const qrTokenSchema = z.strictObject({
  id: entityIdSchema,
  organizationId: entityIdSchema,
  purpose: z.enum(['subject_lookup', 'housing_lookup', 'quick_action']),
  targetEntityType: z.string().trim().min(1),
  targetEntityId: entityIdSchema,
  expiresAt: isoDateTimeSchema,
  revokedAt: isoDateTimeSchema.optional(),
  createdAt: isoDateTimeSchema,
});

export type Event = z.infer<typeof eventSchema>;
export type TransferEvent = z.infer<typeof transferEventSchema>;
export type MortalityEvent = z.infer<typeof mortalityEventSchema>;
export type WelfareObservation = z.infer<typeof welfareObservationSchema>;
export type EnvironmentalObservation = z.infer<typeof environmentalObservationSchema>;
export type AuditEvent = z.infer<typeof auditEventSchema>;
export type AliveStatus = z.infer<typeof aliveStatusSchema>;
export type DerivedAlertCode = z.infer<typeof derivedAlertCodeSchema>;
export type DerivedAlertFlag = z.infer<typeof derivedAlertFlagSchema>;
export type SubjectEventState = z.infer<typeof subjectEventStateSchema>;
export type HousingEventState = z.infer<typeof housingEventStateSchema>;
export type Request = z.infer<typeof requestSchema>;
export type Approval = z.infer<typeof approvalSchema>;
export type Task = z.infer<typeof taskSchema>;
export type Alert = z.infer<typeof alertSchema>;
export type ConnectorCredential = z.infer<typeof connectorCredentialSchema>;
export type QRToken = z.infer<typeof qrTokenSchema>;
