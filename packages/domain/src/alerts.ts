import { z } from 'zod';

import { housingUnitTypeSchema } from './facility.js';
import { entityIdSchema, isoDateTimeSchema, metadataObjectSchema } from './primitives.js';
import { subjectProfileTypeSchema } from './subjects.js';
import { alertSeveritySchema, eventTypeSchema } from './operations.js';

const entityIdListSchema = z.array(entityIdSchema).default([]);
const profileTypeListSchema = z.array(subjectProfileTypeSchema).default([]);

export const alertRuleTypeSchema = z.enum([
  'welfare_threshold',
  'mortality_threshold',
  'environmental_threshold',
  'cumulative_harm_placeholder',
]);

export const ruleAlertCodeSchema = z.enum([
  'welfare_threshold_exceeded',
  'mortality_threshold_exceeded',
  'environmental_threshold_exceeded',
  'cumulative_harm_review',
]);

export const welfareObservationRuleStatusSchema = z.enum(['watch', 'concern', 'critical']);

export const ruleContextFilterSchema = z.strictObject({
  appliesToProfileTypes: profileTypeListSchema,
  appliesToSpeciesIds: entityIdListSchema,
});

export const alertRuleBaseSchema = z.strictObject({
  id: entityIdSchema,
  organizationId: entityIdSchema,
  name: z.string().trim().min(1),
  enabled: z.boolean().default(true),
  severity: alertSeveritySchema,
  guidance: z.string().trim().min(1).optional(),
});

export const welfareThresholdRuleSchema = alertRuleBaseSchema
  .extend(ruleContextFilterSchema.shape)
  .extend({
    ruleType: z.literal('welfare_threshold'),
    statuses: z.array(welfareObservationRuleStatusSchema).min(1),
    minimumScore: z.number().int().min(0).max(5).optional(),
  });

export const mortalityThresholdRuleSchema = alertRuleBaseSchema
  .extend(ruleContextFilterSchema.shape)
  .extend({
    ruleType: z.literal('mortality_threshold'),
    context: z.enum(['individual', 'batch', 'both']).default('both'),
    minimumCount: z.number().int().positive().optional(),
    minimumPercent: z.number().positive().max(1).optional(),
  })
  .superRefine((rule, context) => {
    if (rule.minimumCount === undefined && rule.minimumPercent === undefined) {
      context.addIssue({
        code: 'custom',
        message: 'Mortality threshold rules require minimumCount or minimumPercent',
        path: ['minimumCount'],
      });
    }
  });

export const environmentalThresholdRuleSchema = alertRuleBaseSchema.extend({
  ruleType: z.literal('environmental_threshold'),
  metric: z.string().trim().min(1),
  unit: z.string().trim().min(1).optional(),
  minimumValue: z.number().optional(),
  maximumValue: z.number().optional(),
  appliesToHousingUnitTypes: z.array(housingUnitTypeSchema).default([]),
});

export const cumulativeHarmPlaceholderRuleSchema = alertRuleBaseSchema
  .extend(ruleContextFilterSchema.shape)
  .extend({
    ruleType: z.literal('cumulative_harm_placeholder'),
    reviewScoreThreshold: z.number().positive(),
    reviewWindowDays: z.number().int().positive().optional(),
    eventWeights: z.partialRecord(eventTypeSchema, z.number().positive()).default({}),
  });

export const alertRuleConfigSchema = z
  .discriminatedUnion('ruleType', [
    welfareThresholdRuleSchema,
    mortalityThresholdRuleSchema,
    environmentalThresholdRuleSchema,
    cumulativeHarmPlaceholderRuleSchema,
  ])
  .superRefine((rule, context) => {
    if (
      rule.ruleType === 'environmental_threshold' &&
      rule.minimumValue === undefined &&
      rule.maximumValue === undefined
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Environmental threshold rules require minimumValue or maximumValue',
        path: ['minimumValue'],
      });
    }
  });

export const alertRuleSetSchema = z.array(alertRuleConfigSchema);

export const ruleAlertSchema = z.strictObject({
  id: entityIdSchema,
  organizationId: entityIdSchema,
  ruleId: entityIdSchema,
  ruleType: alertRuleTypeSchema,
  code: ruleAlertCodeSchema,
  severity: alertSeveritySchema,
  title: z.string().trim().min(1),
  message: z.string().trim().min(1),
  entityType: z.enum(['subject', 'housing_unit']),
  entityId: entityIdSchema,
  sourceEventIds: z.array(entityIdSchema).min(1),
  createdAt: isoDateTimeSchema,
  metadata: metadataObjectSchema.default({}),
});

export type AlertRuleType = z.infer<typeof alertRuleTypeSchema>;
export type RuleAlertCode = z.infer<typeof ruleAlertCodeSchema>;
export type WelfareObservationRuleStatus = z.infer<typeof welfareObservationRuleStatusSchema>;
export type WelfareThresholdRule = z.infer<typeof welfareThresholdRuleSchema>;
export type MortalityThresholdRule = z.infer<typeof mortalityThresholdRuleSchema>;
export type EnvironmentalThresholdRule = z.infer<typeof environmentalThresholdRuleSchema>;
export type CumulativeHarmPlaceholderRule = z.infer<typeof cumulativeHarmPlaceholderRuleSchema>;
export type AlertRuleConfig = z.infer<typeof alertRuleConfigSchema>;
export type AlertRuleConfigInput = z.input<typeof alertRuleConfigSchema>;
export type RuleAlert = z.infer<typeof ruleAlertSchema>;
