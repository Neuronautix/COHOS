import type {
  SubjectAggregate,
  SubjectAggregateKind,
  SubjectAggregateMembership,
  SubjectProfileType,
  SubjectWithProfile,
} from '@cohos/domain';
import type { StatusTone } from '@cohos/ui';

export type SubjectField = {
  readonly label: string;
  readonly value: string;
};

export type SubjectListSummary = {
  readonly activeSubjects: number;
  readonly animalSubjects: number;
  readonly profileTypes: number;
  readonly protectedHumanSubjects: number;
  readonly totalSubjects: number;
};

export type SubjectAggregateSummary = {
  readonly activeAggregates: number;
  readonly batches: number;
  readonly cohorts: number;
  readonly groups: number;
  readonly totalAggregates: number;
};

type SubjectStatus = SubjectWithProfile['status'];
type SubjectAggregateStatus = SubjectAggregate['status'];

export const subjectProfileLabels = {
  farm_animal: 'Farm animal',
  generic: 'Generic subject',
  human: 'Human participant',
  rodent: 'Rodent subject',
  zebrafish_batch: 'Zebrafish batch',
} satisfies Record<SubjectProfileType, string>;

export const subjectAggregateKindLabels = {
  batch: 'Batch',
  cohort: 'Cohort',
  group: 'Group',
} satisfies Record<SubjectAggregateKind, string>;

export function formatToken(value: string): string {
  return value
    .split('_')
    .map((part) => (part.length === 0 ? part : `${part[0]?.toUpperCase()}${part.slice(1)}`))
    .join(' ');
}

export function getSubjectDisplayCode(subject: SubjectWithProfile): string {
  if (subject.profile.profileType === 'human') {
    return subject.profile.pseudonymizedSubjectCode;
  }

  return subject.subjectCode;
}

export function getSubjectProfileLabel(subject: SubjectWithProfile): string {
  return subjectProfileLabels[subject.profileType];
}

export function getSubjectAggregateKindLabel(kind: SubjectAggregateKind): string {
  return subjectAggregateKindLabels[kind];
}

export function getSubjectAggregateLabel(aggregate: SubjectAggregate): string {
  return `${getSubjectAggregateKindLabel(aggregate.kind)} ${aggregate.code}`;
}

export function getSubjectAggregateKindTone(kind: SubjectAggregateKind): StatusTone {
  switch (kind) {
    case 'batch':
      return 'info';
    case 'group':
      return 'success';
    case 'cohort':
      return 'warning';
  }
}

export function getSubjectAggregateStatusTone(status: SubjectAggregateStatus): StatusTone {
  switch (status) {
    case 'active':
      return 'success';
    case 'planned':
      return 'info';
    case 'closed':
    case 'archived':
      return 'neutral';
  }
}

export function getSubjectSpeciesLabel(subject: SubjectWithProfile): string {
  if ('species' in subject.profile && subject.profile.species !== undefined) {
    return `${subject.profile.species.commonName} (${subject.profile.species.ncbiTaxonId})`;
  }

  return 'Not applicable';
}

export function getSubjectLocationLabel(subject: SubjectWithProfile): string {
  switch (subject.profile.profileType) {
    case 'farm_animal':
    case 'rodent':
      return subject.profile.housingUnitId ?? 'Unassigned';
    case 'zebrafish_batch':
      return subject.profile.tankId ?? 'Unassigned';
    case 'generic':
    case 'human':
      return 'Not assigned';
  }
}

export function getSubjectStatusTone(status: SubjectStatus): StatusTone {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'neutral';
    case 'deceased':
      return 'danger';
    case 'archived':
      return 'info';
  }
}

export function getSubjectWelfareTone(subject: SubjectWithProfile): StatusTone {
  if (!('welfareStatus' in subject.profile)) {
    return 'neutral';
  }

  switch (subject.profile.welfareStatus) {
    case 'normal':
      return 'success';
    case 'watch':
      return 'warning';
    case 'concern':
    case 'critical':
      return 'danger';
    case 'not_assessed':
      return 'neutral';
  }
}

export function getSubjectWelfareLabel(subject: SubjectWithProfile): string {
  if (!('welfareStatus' in subject.profile)) {
    return 'Not assessed';
  }

  return formatToken(subject.profile.welfareStatus);
}

function subjectField(label: string, value: string): SubjectField {
  return {
    label,
    value,
  };
}

export function getSubjectAggregateMembershipLabel(membership: SubjectAggregateMembership): string {
  return `${formatToken(membership.aggregateKind)}: ${
    membership.aggregateCode ?? membership.aggregateId
  }`;
}

function getSubjectAggregateFieldValue(subject: SubjectWithProfile): string {
  const memberships = subject.aggregateMemberships ?? [];

  if (memberships.length === 0) {
    return 'None';
  }

  return memberships.map(getSubjectAggregateMembershipLabel).join(', ');
}

function getSubjectAggregateFields(subject: SubjectWithProfile): SubjectField[] {
  return [subjectField('Aggregate memberships', getSubjectAggregateFieldValue(subject))];
}

export function getSubjectAggregateDetailFields(aggregate: SubjectAggregate): SubjectField[] {
  const baseFields = [
    subjectField('Code', aggregate.code),
    subjectField('Name', aggregate.name),
    subjectField('Kind', getSubjectAggregateKindLabel(aggregate.kind)),
    subjectField('Status', formatToken(aggregate.status)),
    subjectField('Subject count', aggregate.subjectIds.length.toString()),
    subjectField(
      'Profile types',
      aggregate.profileTypes.length === 0
        ? 'Not restricted'
        : aggregate.profileTypes.map((profileType) => subjectProfileLabels[profileType]).join(', '),
    ),
    subjectField('Species', aggregate.speciesId ?? 'Not restricted'),
    subjectField('Valid from', aggregate.validFrom ?? 'Not recorded'),
    subjectField('Valid to', aggregate.validTo ?? 'Open'),
  ];

  switch (aggregate.kind) {
    case 'batch':
      return [
        ...baseFields,
        subjectField('Origin type', formatToken(aggregate.batch.originType)),
        subjectField('Initial count', aggregate.batch.initialCount.toString()),
        subjectField('Current count', aggregate.batch.currentCount?.toString() ?? 'Not recorded'),
        subjectField('Count unit', formatToken(aggregate.batch.countUnit)),
        subjectField(
          'Developmental stage',
          aggregate.batch.developmentalStage === undefined
            ? 'Not recorded'
            : formatToken(aggregate.batch.developmentalStage),
        ),
        subjectField('Source organization', aggregate.batch.sourceOrganization ?? 'Not recorded'),
      ];
    case 'group':
      return [
        ...baseFields,
        subjectField('Purpose', formatToken(aggregate.group.groupPurpose)),
        subjectField('Housing unit', aggregate.group.housingUnitId ?? 'Not assigned'),
        subjectField('Membership policy', formatToken(aggregate.group.membershipPolicy)),
        subjectField('Husbandry protocol', aggregate.group.husbandryProtocolId ?? 'Not recorded'),
        subjectField('Diet', aggregate.group.diet ?? 'Not recorded'),
        subjectField(
          'Density',
          aggregate.group.density === undefined
            ? 'Not recorded'
            : `${aggregate.group.density.value} ${aggregate.group.density.unit}`,
        ),
      ];
    case 'cohort':
      return [
        ...baseFields,
        subjectField('Cohort kind', formatToken(aggregate.cohort.cohortKind)),
        subjectField('Study', aggregate.cohort.studyId ?? 'Not linked'),
        subjectField('Planned size', aggregate.cohort.plannedSize?.toString() ?? 'Not recorded'),
        subjectField('Blinding', formatToken(aggregate.cohort.blinding)),
        subjectField(
          'Randomization unit',
          aggregate.cohort.randomizationUnit === undefined
            ? 'Not recorded'
            : formatToken(aggregate.cohort.randomizationUnit),
        ),
        subjectField(
          'Follow-up',
          aggregate.cohort.followUpSchedule.length === 0
            ? 'Not recorded'
            : aggregate.cohort.followUpSchedule.join(', '),
        ),
      ];
  }
}

export function getSubjectProfileFields(subject: SubjectWithProfile): SubjectField[] {
  switch (subject.profile.profileType) {
    case 'human':
      return [
        subjectField('Pseudonymized code', subject.profile.pseudonymizedSubjectCode),
        subjectField('Consent', formatToken(subject.profile.consentStatus)),
        subjectField('Study participation', formatToken(subject.profile.studyParticipationStatus)),
        subjectField('Age band', subject.profile.ageBand ?? 'Not recorded'),
        subjectField(
          'Sex',
          subject.profile.sex === undefined ? 'Not recorded' : formatToken(subject.profile.sex),
        ),
        subjectField(
          'Gender identity',
          subject.profile.genderIdentity === undefined
            ? 'Not recorded'
            : formatToken(subject.profile.genderIdentity),
        ),
        ...getSubjectAggregateFields(subject),
      ];
    case 'rodent':
      return [
        subjectField('Species', getSubjectSpeciesLabel(subject)),
        subjectField('Strain', subject.profile.strainId ?? 'Not recorded'),
        subjectField('Genotype', subject.profile.genotypeId ?? 'Not recorded'),
        subjectField('Sex', formatToken(subject.profile.sex)),
        subjectField(
          'Age',
          subject.profile.ageDays === undefined
            ? 'Not recorded'
            : `${subject.profile.ageDays} days`,
        ),
        subjectField('Housing unit', subject.profile.housingUnitId ?? 'Unassigned'),
        subjectField('Welfare', formatToken(subject.profile.welfareStatus)),
        ...getSubjectAggregateFields(subject),
      ];
    case 'zebrafish_batch':
      return [
        subjectField('Species', getSubjectSpeciesLabel(subject)),
        subjectField('Batch identifier', subject.profile.batchIdentifier),
        subjectField('Developmental stage', formatToken(subject.profile.developmentalStage)),
        subjectField('Tank', subject.profile.tankId ?? 'Unassigned'),
        subjectField('Current count', subject.profile.count.toString()),
        subjectField('Mortality events', subject.profile.mortalityEventIds.length.toString()),
        subjectField(
          'Environmental observations',
          subject.profile.environmentalObservationIds.length.toString(),
        ),
        ...getSubjectAggregateFields(subject),
      ];
    case 'farm_animal':
      return [
        subjectField('Species', getSubjectSpeciesLabel(subject)),
        subjectField('Group', subject.profile.groupIdentifier),
        subjectField(
          'Individual identifier',
          subject.profile.individualIdentifier ?? 'Not recorded',
        ),
        subjectField('Age', subject.profile.ageDescription ?? 'Not recorded'),
        subjectField('Sex', formatToken(subject.profile.sex)),
        subjectField('Housing unit', subject.profile.housingUnitId ?? 'Unassigned'),
        subjectField('Welfare', formatToken(subject.profile.welfareStatus)),
        ...getSubjectAggregateFields(subject),
      ];
    case 'generic':
      return [
        subjectField('Biological type', subject.profile.biologicalType),
        subjectField('Species', getSubjectSpeciesLabel(subject)),
        subjectField('Metadata fields', Object.keys(subject.profile.metadata).length.toString()),
        subjectField('Notes', subject.profile.extensibilityNotes ?? 'Not recorded'),
        ...getSubjectAggregateFields(subject),
      ];
  }
}

export function summarizeSubjects(subjects: readonly SubjectWithProfile[]): SubjectListSummary {
  const profileTypes = new Set(subjects.map((subject) => subject.profileType));

  return {
    activeSubjects: subjects.filter((subject) => subject.status === 'active').length,
    animalSubjects: subjects.filter(
      (subject) =>
        subject.profileType === 'rodent' ||
        subject.profileType === 'zebrafish_batch' ||
        subject.profileType === 'farm_animal',
    ).length,
    profileTypes: profileTypes.size,
    protectedHumanSubjects: subjects.filter((subject) => subject.profileType === 'human').length,
    totalSubjects: subjects.length,
  };
}

export function summarizeSubjectAggregates(
  aggregates: readonly SubjectAggregate[],
): SubjectAggregateSummary {
  return {
    activeAggregates: aggregates.filter((aggregate) => aggregate.status === 'active').length,
    batches: aggregates.filter((aggregate) => aggregate.kind === 'batch').length,
    cohorts: aggregates.filter((aggregate) => aggregate.kind === 'cohort').length,
    groups: aggregates.filter((aggregate) => aggregate.kind === 'group').length,
    totalAggregates: aggregates.length,
  };
}

export function matchesSubjectSearch(subject: SubjectWithProfile, searchTerm: string): boolean {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  if (normalizedSearchTerm.length === 0) {
    return true;
  }

  return [
    getSubjectDisplayCode(subject),
    getSubjectProfileLabel(subject),
    subject.status,
    getSubjectSpeciesLabel(subject),
    getSubjectLocationLabel(subject),
    ...(subject.aggregateMemberships ?? []).map(getSubjectAggregateMembershipLabel),
  ]
    .join(' ')
    .toLowerCase()
    .includes(normalizedSearchTerm);
}

export function matchesSubjectAggregateSearch(
  aggregate: SubjectAggregate,
  searchTerm: string,
): boolean {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  if (normalizedSearchTerm.length === 0) {
    return true;
  }

  return [
    aggregate.code,
    aggregate.name,
    aggregate.description ?? '',
    getSubjectAggregateKindLabel(aggregate.kind),
    aggregate.status,
    aggregate.speciesId ?? '',
    ...aggregate.profileTypes.map((profileType) => subjectProfileLabels[profileType]),
    ...aggregate.subjectIds,
  ]
    .join(' ')
    .toLowerCase()
    .includes(normalizedSearchTerm);
}
