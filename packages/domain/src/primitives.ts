import { z } from 'zod';

export const entityIdSchema = z.string().trim().min(1);

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected an ISO calendar date in YYYY-MM-DD format');

export const isoDateTimeSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/, 'Expected an ISO timestamp in UTC');

export const ncbiTaxonIdSchema = z
  .string()
  .regex(/^NCBITaxon:\d+$/, 'Expected an NCBITaxon identifier such as NCBITaxon:10090');

export const metadataObjectSchema = z.record(z.string(), z.unknown());

export const auditSnapshotSchema = z.strictObject({
  hash: z.string().min(1),
  redacted: z.boolean().default(true),
});

export type EntityId = z.infer<typeof entityIdSchema>;
export type MetadataObject = z.infer<typeof metadataObjectSchema>;
