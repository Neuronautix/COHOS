import type {
  AssayDetail,
  ConnectedResourceLink,
  InvestigationDetail,
  ResearchVocabularyTerm,
  StudyDetail,
} from '@cohos/domain';
import type { StatusTone } from '@cohos/ui';

export type ResearchField = {
  readonly label: string;
  readonly value: string;
};

export type ResearchSummary = {
  readonly assayCount: number;
  readonly cohortLinkCount: number;
  readonly connectedResourceCount: number;
  readonly datasetCount: number;
  readonly investigationCount: number;
  readonly procedureCount: number;
  readonly sampleCount: number;
  readonly studyCount: number;
  readonly subjectLinkCount: number;
};

export function formatResearchToken(value: string): string {
  return value
    .split(/[_\s-]+/)
    .filter((part) => part.length > 0)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

export function formatOptionalResearchValue(value: string | undefined): string {
  return value === undefined || value.trim().length === 0 ? 'Not recorded' : value;
}

export function formatResearchDateRange(input: {
  readonly endsOn?: string;
  readonly startsOn?: string;
}): string {
  if (input.startsOn === undefined && input.endsOn === undefined) {
    return 'Dates not recorded';
  }

  if (input.startsOn !== undefined && input.endsOn !== undefined) {
    return `${input.startsOn} to ${input.endsOn}`;
  }

  return input.startsOn === undefined ? `Until ${input.endsOn}` : `From ${input.startsOn}`;
}

export function getCountTone(count: number): StatusTone {
  return count > 0 ? 'success' : 'neutral';
}

export function getVocabularyTitle(term: ResearchVocabularyTerm): string {
  return formatResearchToken(term.canonical);
}

export function getVocabularyEquivalentLabel(term: ResearchVocabularyTerm): string {
  if (term.equivalentTerms.length === 0) {
    return 'No equivalent terms';
  }

  return `Also ${term.equivalentTerms.map(formatResearchToken).join(', ')}`;
}

export function getConnectedResourceSource(link: ConnectedResourceLink): string {
  const source = link.metadata.source;

  return typeof source === 'string' && source.trim().length > 0
    ? formatResearchToken(source)
    : 'External';
}

export function getInvestigationFields(investigation: InvestigationDetail): ResearchField[] {
  return [
    researchField('Identifier', investigation.id),
    researchField('Organization', investigation.organizationId),
    researchField('Date range', formatResearchDateRange(investigation)),
    researchField('Description', formatOptionalResearchValue(investigation.description)),
  ];
}

export function getStudyFields(study: StudyDetail): ResearchField[] {
  return [
    researchField('Identifier', study.id),
    researchField('Investigation', study.investigationId),
    researchField('Subjects', study.subjectIds.length.toString()),
    researchField('Cohorts', study.cohortIds.length.toString()),
    researchField('Description', formatOptionalResearchValue(study.description)),
  ];
}

export function getAssayFields(assay: AssayDetail): ResearchField[] {
  return [
    researchField('Identifier', assay.id),
    researchField('Study', assay.studyId),
    researchField('Measurement', formatOptionalResearchValue(assay.measurementType)),
    researchField('Technology', formatOptionalResearchValue(assay.technologyType)),
  ];
}

export function matchesInvestigationSearch(
  investigation: InvestigationDetail,
  searchTerm: string,
): boolean {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  if (normalizedSearchTerm.length === 0) {
    return true;
  }

  const searchableValues = [
    investigation.id,
    investigation.title,
    investigation.description ?? '',
    ...investigation.studies.flatMap((study) => [
      study.id,
      study.title,
      study.description ?? '',
      ...study.subjectIds,
      ...study.cohortIds,
      ...study.assays.flatMap((assay) => [
        assay.id,
        assay.title,
        assay.measurementType ?? '',
        assay.technologyType ?? '',
      ]),
    ]),
  ];

  return searchableValues.some((value) => value.toLowerCase().includes(normalizedSearchTerm));
}

export function summarizeInvestigations(
  investigations: readonly InvestigationDetail[],
): ResearchSummary {
  const studies = investigations.flatMap((investigation) => investigation.studies);
  const assays = studies.flatMap((study) => study.assays);

  return {
    assayCount: assays.length,
    cohortLinkCount: studies.reduce((total, study) => total + study.cohortIds.length, 0),
    connectedResourceCount:
      investigations.reduce(
        (total, investigation) => total + investigation.connectedResources.length,
        0,
      ) +
      studies.reduce((total, study) => total + study.connectedResources.length, 0) +
      assays.reduce((total, assay) => total + assay.connectedResources.length, 0),
    datasetCount: assays.reduce((total, assay) => total + assay.datasets.length, 0),
    investigationCount: investigations.length,
    procedureCount: assays.reduce((total, assay) => total + assay.procedures.length, 0),
    sampleCount: assays.reduce((total, assay) => total + assay.samples.length, 0),
    studyCount: studies.length,
    subjectLinkCount: studies.reduce((total, study) => total + study.subjectIds.length, 0),
  };
}

function researchField(label: string, value: string): ResearchField {
  return {
    label,
    value,
  };
}
