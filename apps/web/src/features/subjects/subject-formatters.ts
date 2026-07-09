import type {
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

type SubjectStatus = SubjectWithProfile['status'];

export const subjectProfileLabels = {
  farm_animal: 'Farm animal',
  generic: 'Generic subject',
  human: 'Human participant',
  rodent: 'Rodent subject',
  zebrafish_batch: 'Zebrafish batch',
} satisfies Record<SubjectProfileType, string>;

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
