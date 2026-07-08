import { subjectWithProfileSchema, type SubjectWithProfile } from '@cohos/domain';

import { fetchFromApi } from '../../lib/api-client';

const subjectListSchema = subjectWithProfileSchema.array();

export async function fetchSubjects(): Promise<SubjectWithProfile[]> {
  const payload = await fetchFromApi<unknown>('/subjects');

  return subjectListSchema.parse(payload);
}

export async function fetchSubject(subjectId: string): Promise<SubjectWithProfile> {
  const payload = await fetchFromApi<unknown>(`/subjects/${encodeURIComponent(subjectId)}`);

  return subjectWithProfileSchema.parse(payload);
}
