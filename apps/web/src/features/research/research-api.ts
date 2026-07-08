import {
  assayDetailSchema,
  investigationDetailSchema,
  researchVocabularySchema,
  studyDetailSchema,
  type AssayDetail,
  type InvestigationDetail,
  type ResearchVocabulary,
  type StudyDetail,
} from '@cohos/domain';

import { fetchFromApi } from '../../lib/api-client';

const investigationListSchema = investigationDetailSchema.array();

export async function fetchInvestigations(): Promise<InvestigationDetail[]> {
  const payload = await fetchFromApi<unknown>('/investigations');

  return investigationListSchema.parse(payload);
}

export async function fetchInvestigation(investigationId: string): Promise<InvestigationDetail> {
  const payload = await fetchFromApi<unknown>(
    `/investigations/${encodeURIComponent(investigationId)}`,
  );

  return investigationDetailSchema.parse(payload);
}

export async function fetchStudy(studyId: string): Promise<StudyDetail> {
  const payload = await fetchFromApi<unknown>(`/studies/${encodeURIComponent(studyId)}`);

  return studyDetailSchema.parse(payload);
}

export async function fetchAssay(assayId: string): Promise<AssayDetail> {
  const payload = await fetchFromApi<unknown>(`/assays/${encodeURIComponent(assayId)}`);

  return assayDetailSchema.parse(payload);
}

export async function fetchResearchVocabulary(): Promise<ResearchVocabulary> {
  const payload = await fetchFromApi<unknown>('/research/vocabulary');

  return researchVocabularySchema.parse(payload);
}
