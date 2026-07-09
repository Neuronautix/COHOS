import {
  subjectAggregateMembershipSchema,
  subjectAggregateSchema,
  subjectWithProfileSchema,
  type SubjectAggregate,
  type SubjectAggregateMembership,
  type SubjectWithProfile,
} from '@cohos/domain';

import { fetchFromApi } from '../../lib/api-client';

const subjectListSchema = subjectWithProfileSchema.array();
const subjectAggregateListSchema = subjectAggregateSchema.array();
const subjectAggregateMembershipListSchema = subjectAggregateMembershipSchema.array();

export async function fetchSubjects(): Promise<SubjectWithProfile[]> {
  const payload = await fetchFromApi<unknown>('/subjects');

  return subjectListSchema.parse(payload);
}

export async function fetchSubject(subjectId: string): Promise<SubjectWithProfile> {
  const payload = await fetchFromApi<unknown>(`/subjects/${encodeURIComponent(subjectId)}`);

  return subjectWithProfileSchema.parse(payload);
}

export async function fetchSubjectAggregates(): Promise<SubjectAggregate[]> {
  const payload = await fetchFromApi<unknown>('/subject-aggregates');

  return subjectAggregateListSchema.parse(payload);
}

export async function fetchSubjectAggregate(aggregateId: string): Promise<SubjectAggregate> {
  const payload = await fetchFromApi<unknown>(
    `/subject-aggregates/${encodeURIComponent(aggregateId)}`,
  );

  return subjectAggregateSchema.parse(payload);
}

export async function fetchSubjectAggregateMemberships(
  aggregateId: string,
): Promise<SubjectAggregateMembership[]> {
  const payload = await fetchFromApi<unknown>(
    `/subject-aggregates/${encodeURIComponent(aggregateId)}/memberships`,
  );

  return subjectAggregateMembershipListSchema.parse(payload);
}
