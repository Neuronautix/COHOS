import {
  type AlertRuleConfig,
  type AlertRuleConfigInput,
  type CumulativeHarmPlaceholderRule,
  type EnvironmentalObservation,
  type EnvironmentalThresholdRule,
  type Event,
  type HousingUnit,
  type MortalityEvent,
  type MortalityThresholdRule,
  type RuleAlert,
  type SubjectProfileType,
  type SubjectWithProfile,
  type WelfareObservation,
  type WelfareThresholdRule,
  alertRuleSetSchema,
  ruleAlertSchema,
} from '@cohos/domain';

export const rulesPackageName = '@cohos/rules';

export type RulesPackageName = typeof rulesPackageName;

export type RuleEvaluationInputBase = {
  readonly evaluatedAt?: string;
  readonly rules: readonly AlertRuleConfigInput[];
};

export type WelfareRuleEvaluationInput = RuleEvaluationInputBase & {
  readonly observation: WelfareObservation;
  readonly subject: SubjectWithProfile;
};

export type MortalityRuleEvaluationInput = RuleEvaluationInputBase & {
  readonly mortalityEvent: MortalityEvent;
  readonly startingBatchCount?: number;
  readonly subject: SubjectWithProfile;
};

export type EnvironmentalRuleEvaluationInput = RuleEvaluationInputBase & {
  readonly housingUnit: HousingUnit;
  readonly observation: EnvironmentalObservation;
};

export type CumulativeHarmRuleEvaluationInput = RuleEvaluationInputBase & {
  readonly events: readonly Event[];
  readonly subject: SubjectWithProfile;
};

function parseRules(rules: readonly AlertRuleConfigInput[]): AlertRuleConfig[] {
  return alertRuleSetSchema.parse(rules);
}

function enabledRules<T extends AlertRuleConfig>(
  rules: readonly AlertRuleConfigInput[],
  ruleType: T['ruleType'],
): T[] {
  return parseRules(rules).filter((rule): rule is T => rule.enabled && rule.ruleType === ruleType);
}

function subjectSpeciesIds(subject: SubjectWithProfile): string[] {
  const speciesIds = new Set<string>();

  if (subject.speciesId !== undefined) {
    speciesIds.add(subject.speciesId);
  }

  if ('species' in subject.profile && subject.profile.species !== undefined) {
    speciesIds.add(subject.profile.species.id);
  }

  return [...speciesIds];
}

function subjectMatchesRule(
  subject: SubjectWithProfile,
  rule: {
    readonly appliesToProfileTypes: readonly SubjectProfileType[];
    readonly appliesToSpeciesIds: readonly string[];
  },
): boolean {
  const profileMatches =
    rule.appliesToProfileTypes.length === 0 ||
    rule.appliesToProfileTypes.includes(subject.profileType);
  const speciesIds = subjectSpeciesIds(subject);
  const speciesMatches =
    rule.appliesToSpeciesIds.length === 0 ||
    rule.appliesToSpeciesIds.some((speciesId) => speciesIds.includes(speciesId));

  return profileMatches && speciesMatches;
}

function normalizeMetric(metric: string): string {
  return metric.trim().toLocaleLowerCase();
}

function createRuleAlert(input: {
  readonly code: RuleAlert['code'];
  readonly entityId: string;
  readonly entityType: RuleAlert['entityType'];
  readonly eventIds: readonly [string, ...string[]];
  readonly evaluatedAt: string;
  readonly message: string;
  readonly metadata?: Record<string, unknown>;
  readonly rule: AlertRuleConfig;
}): RuleAlert {
  return ruleAlertSchema.parse({
    id: `alert-${input.rule.id}-${input.eventIds.join('-')}`,
    organizationId: input.rule.organizationId,
    ruleId: input.rule.id,
    ruleType: input.rule.ruleType,
    code: input.code,
    severity: input.rule.severity,
    title: input.rule.name,
    message: input.message,
    entityType: input.entityType,
    entityId: input.entityId,
    sourceEventIds: input.eventIds,
    createdAt: input.evaluatedAt,
    metadata: input.metadata ?? {},
  });
}

export function evaluateWelfareObservationRules(input: WelfareRuleEvaluationInput): RuleAlert[] {
  if (input.observation.subjectId !== input.subject.id) {
    return [];
  }

  const status = input.observation.status;

  if (status === 'normal') {
    return [];
  }

  return enabledRules<WelfareThresholdRule>(input.rules, 'welfare_threshold')
    .filter((rule) => subjectMatchesRule(input.subject, rule))
    .filter((rule) => rule.statuses.includes(status))
    .filter(
      (rule) => rule.minimumScore === undefined || input.observation.score >= rule.minimumScore,
    )
    .map((rule) =>
      createRuleAlert({
        code: 'welfare_threshold_exceeded',
        entityId: input.subject.id,
        entityType: 'subject',
        eventIds: [input.observation.id],
        evaluatedAt: input.evaluatedAt ?? input.observation.occurredAt,
        message: `Welfare observation ${input.observation.id} met the configured ${status} threshold.`,
        metadata: {
          score: input.observation.score,
          status,
        },
        rule,
      }),
    );
}

function subjectMortalityContext(subject: SubjectWithProfile): 'batch' | 'individual' {
  return subject.profileType === 'zebrafish_batch' ? 'batch' : 'individual';
}

function mortalityPercent(
  mortalityEvent: MortalityEvent,
  startingBatchCount: number | undefined,
): number | undefined {
  if (startingBatchCount === undefined || startingBatchCount <= 0) {
    return undefined;
  }

  return mortalityEvent.count / startingBatchCount;
}

function mortalityRuleTriggered(input: {
  readonly mortalityEvent: MortalityEvent;
  readonly percent: number | undefined;
  readonly rule: MortalityThresholdRule;
}): boolean {
  const countTriggered =
    input.rule.minimumCount !== undefined && input.mortalityEvent.count >= input.rule.minimumCount;
  const percentTriggered =
    input.rule.minimumPercent !== undefined &&
    input.percent !== undefined &&
    input.percent >= input.rule.minimumPercent;

  return countTriggered || percentTriggered;
}

export function evaluateMortalityRules(input: MortalityRuleEvaluationInput): RuleAlert[] {
  if (input.mortalityEvent.subjectId !== input.subject.id) {
    return [];
  }

  const context = subjectMortalityContext(input.subject);
  const percent = mortalityPercent(input.mortalityEvent, input.startingBatchCount);

  return enabledRules<MortalityThresholdRule>(input.rules, 'mortality_threshold')
    .filter((rule) => subjectMatchesRule(input.subject, rule))
    .filter((rule) => rule.context === 'both' || rule.context === context)
    .filter((rule) =>
      mortalityRuleTriggered({ mortalityEvent: input.mortalityEvent, percent, rule }),
    )
    .map((rule) =>
      createRuleAlert({
        code: 'mortality_threshold_exceeded',
        entityId: input.subject.id,
        entityType: 'subject',
        eventIds: [input.mortalityEvent.id],
        evaluatedAt: input.evaluatedAt ?? input.mortalityEvent.occurredAt,
        message: `Mortality event ${input.mortalityEvent.id} met the configured ${context} threshold.`,
        metadata: {
          context,
          count: input.mortalityEvent.count,
          mortalityPercent: percent,
        },
        rule,
      }),
    );
}

function environmentalRuleTriggered(
  observation: EnvironmentalObservation,
  rule: EnvironmentalThresholdRule,
): boolean {
  const belowMinimum = rule.minimumValue !== undefined && observation.value < rule.minimumValue;
  const aboveMaximum = rule.maximumValue !== undefined && observation.value > rule.maximumValue;

  return belowMinimum || aboveMaximum;
}

export function evaluateEnvironmentalRules(input: EnvironmentalRuleEvaluationInput): RuleAlert[] {
  if (input.observation.housingUnitId !== input.housingUnit.id) {
    return [];
  }

  return enabledRules<EnvironmentalThresholdRule>(input.rules, 'environmental_threshold')
    .filter((rule) => normalizeMetric(rule.metric) === normalizeMetric(input.observation.metric))
    .filter((rule) => rule.unit === undefined || rule.unit === input.observation.unit)
    .filter(
      (rule) =>
        rule.appliesToHousingUnitTypes.length === 0 ||
        rule.appliesToHousingUnitTypes.includes(input.housingUnit.type),
    )
    .filter((rule) => environmentalRuleTriggered(input.observation, rule))
    .map((rule) =>
      createRuleAlert({
        code: 'environmental_threshold_exceeded',
        entityId: input.housingUnit.id,
        entityType: 'housing_unit',
        eventIds: [input.observation.id],
        evaluatedAt: input.evaluatedAt ?? input.observation.occurredAt,
        message: `Environmental observation ${input.observation.id} was outside the configured ${rule.metric} range.`,
        metadata: {
          metric: input.observation.metric,
          unit: input.observation.unit,
          value: input.observation.value,
          minimumValue: rule.minimumValue,
          maximumValue: rule.maximumValue,
        },
        rule,
      }),
    );
}

function eventWithinWindow(event: Event, evaluatedAt: string, reviewWindowDays?: number) {
  if (reviewWindowDays === undefined) {
    return true;
  }

  const windowStart = Date.parse(evaluatedAt) - reviewWindowDays * 24 * 60 * 60 * 1000;

  return Date.parse(event.occurredAt) >= windowStart;
}

function eventWeight(event: Event, rule: CumulativeHarmPlaceholderRule): number {
  return rule.eventWeights[event.eventType] ?? 0;
}

export function evaluateCumulativeHarmPlaceholders(
  input: CumulativeHarmRuleEvaluationInput,
): RuleAlert[] {
  const evaluatedAt = input.evaluatedAt ?? new Date().toISOString();

  return enabledRules<CumulativeHarmPlaceholderRule>(input.rules, 'cumulative_harm_placeholder')
    .filter((rule) => subjectMatchesRule(input.subject, rule))
    .flatMap((rule) => {
      const matchingEvents = input.events.filter(
        (event) =>
          event.subjectId === input.subject.id &&
          eventWithinWindow(event, evaluatedAt, rule.reviewWindowDays),
      );
      const reviewScore = matchingEvents.reduce(
        (score, event) => score + eventWeight(event, rule),
        0,
      );

      if (reviewScore < rule.reviewScoreThreshold || matchingEvents.length === 0) {
        return [];
      }

      return [
        createRuleAlert({
          code: 'cumulative_harm_review',
          entityId: input.subject.id,
          entityType: 'subject',
          eventIds: matchingEvents.map((event) => event.id) as [string, ...string[]],
          evaluatedAt,
          message: `Subject ${input.subject.id} met the configured cumulative review placeholder threshold.`,
          metadata: {
            reviewScore,
          },
          rule,
        }),
      ];
    });
}

export function evaluateEventRules(input: {
  readonly event: Event;
  readonly evaluatedAt?: string;
  readonly housingUnit?: HousingUnit;
  readonly rules: readonly AlertRuleConfigInput[];
  readonly startingBatchCount?: number;
  readonly subject?: SubjectWithProfile;
}): RuleAlert[] {
  if (input.event.eventType === 'welfare_observation' && input.subject !== undefined) {
    return evaluateWelfareObservationRules({
      evaluatedAt: input.evaluatedAt,
      observation: input.event,
      rules: input.rules,
      subject: input.subject,
    });
  }

  if (input.event.eventType === 'mortality' && input.subject !== undefined) {
    return evaluateMortalityRules({
      evaluatedAt: input.evaluatedAt,
      mortalityEvent: input.event,
      rules: input.rules,
      startingBatchCount: input.startingBatchCount,
      subject: input.subject,
    });
  }

  if (input.event.eventType === 'environmental_observation' && input.housingUnit !== undefined) {
    return evaluateEnvironmentalRules({
      evaluatedAt: input.evaluatedAt,
      housingUnit: input.housingUnit,
      observation: input.event,
      rules: input.rules,
    });
  }

  return [];
}
