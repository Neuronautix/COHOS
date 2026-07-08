import { z } from 'zod';

import { qrTokenSchema } from './operations.js';
import { entityIdSchema, isoDateTimeSchema, metadataObjectSchema } from './primitives.js';

export const qrTargetEntityTypeSchema = z.enum([
  'subject',
  'housing_unit',
  'facility',
  'study',
  'assay',
]);

export const quickActionTypeSchema = z.enum([
  'open_subject',
  'open_housing_unit',
  'record_transfer',
  'record_welfare_observation',
  'record_environmental_observation',
]);

export const qrTokenContractSchema = qrTokenSchema.extend({
  targetEntityType: qrTargetEntityTypeSchema,
  createdByUserId: entityIdSchema.optional(),
  metadata: metadataObjectSchema.default({}),
});

export const qrScanRequestSchema = z.strictObject({
  tokenId: entityIdSchema,
  scannedAt: isoDateTimeSchema.optional(),
});

export const qrTokenValidationStatusSchema = z.enum(['valid', 'expired', 'revoked']);

export const quickActionIntentSchema = z.strictObject({
  actionType: quickActionTypeSchema,
  label: z.string().trim().min(1),
  targetEntityType: qrTargetEntityTypeSchema,
  targetEntityId: entityIdSchema,
  payload: metadataObjectSchema.default({}),
});

export const qrScanResultSchema = z.strictObject({
  token: qrTokenContractSchema,
  status: qrTokenValidationStatusSchema,
  scannedAt: isoDateTimeSchema,
  message: z.string().trim().min(1),
  quickActionIntents: z.array(quickActionIntentSchema).default([]),
});

export type QRTargetEntityType = z.infer<typeof qrTargetEntityTypeSchema>;
export type QuickActionType = z.infer<typeof quickActionTypeSchema>;
export type QRTokenContract = z.infer<typeof qrTokenContractSchema>;
export type QRScanRequest = z.infer<typeof qrScanRequestSchema>;
export type QRTokenValidationStatus = z.infer<typeof qrTokenValidationStatusSchema>;
export type QuickActionIntent = z.infer<typeof quickActionIntentSchema>;
export type QRScanResult = z.infer<typeof qrScanResultSchema>;
