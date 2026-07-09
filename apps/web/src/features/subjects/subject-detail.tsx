'use client';

import Link from 'next/link';

import { MetricTile, PageHeader, StatusBadge, WorkspacePanel } from '@cohos/ui';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';

import { fetchSubject } from './subject-api';
import {
  formatToken,
  getSubjectAggregateKindLabel,
  getSubjectAggregateKindTone,
  getSubjectDisplayCode,
  getSubjectLocationLabel,
  getSubjectProfileFields,
  getSubjectProfileLabel,
  getSubjectSpeciesLabel,
  getSubjectStatusTone,
  getSubjectWelfareLabel,
  getSubjectWelfareTone,
} from './subject-formatters';
import { SubjectBackLink, SubjectLoadingState, SubjectState } from './subject-states';

export type SubjectDetailProps = {
  readonly subjectId: string;
};

export function SubjectDetail({ subjectId }: SubjectDetailProps) {
  const subjectQuery = useQuery({
    queryFn: () => fetchSubject(subjectId),
    queryKey: ['subject', subjectId],
  });

  if (subjectQuery.isLoading) {
    return <SubjectLoadingState />;
  }

  if (subjectQuery.isError) {
    return (
      <SubjectState
        action={<SubjectBackLink />}
        detail={
          subjectQuery.error instanceof Error ? subjectQuery.error.message : 'Request failed.'
        }
        title="Subject unavailable"
      />
    );
  }

  const subject = subjectQuery.data;

  if (subject === undefined) {
    return (
      <SubjectState
        action={<SubjectBackLink />}
        detail="The configured API returned no subject for this route."
        title="Subject unavailable"
      />
    );
  }

  const displayCode = getSubjectDisplayCode(subject);
  const aggregateMemberships = subject.aggregateMemberships ?? [];

  return (
    <div className="subject-page">
      <PageHeader
        actions={
          <Link className="action-link" href="/subjects">
            Subjects
          </Link>
        }
        eyebrow={getSubjectProfileLabel(subject)}
        summary={`${formatToken(subject.status)} record with source identifier ${subject.id}.`}
        title={displayCode}
      />

      <section aria-label={`${displayCode} summary`} className="metric-grid">
        <MetricTile
          detail="Shared domain profile"
          label="Model"
          tone="info"
          value={getSubjectProfileLabel(subject)}
        />
        <MetricTile
          detail={getSubjectSpeciesLabel(subject)}
          label="Species"
          tone="neutral"
          value={subject.speciesId ?? 'N/A'}
        />
        <MetricTile
          detail={getSubjectLocationLabel(subject)}
          label="Location"
          tone="success"
          value={getSubjectLocationLabel(subject) === 'Not assigned' ? 'None' : 'Assigned'}
        />
        <MetricTile
          detail={getSubjectWelfareLabel(subject)}
          label="Welfare"
          tone={getSubjectWelfareTone(subject)}
          value={getSubjectWelfareLabel(subject)}
        />
      </section>

      <div className="workspace-grid">
        <WorkspacePanel title="Profile fields">
          <dl className="field-list">
            {getSubjectProfileFields(subject).map((field) => (
              <div key={field.label}>
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
        </WorkspacePanel>

        <WorkspacePanel title="Operational context">
          <div className="subject-context">
            <article>
              <h3>Status</h3>
              <StatusBadge tone={getSubjectStatusTone(subject.status)}>
                {formatToken(subject.status)}
              </StatusBadge>
            </article>
            <article>
              <h3>Organization</h3>
              <p>{subject.organizationId}</p>
            </article>
            <article>
              <h3>Source subject code</h3>
              <p>{displayCode}</p>
            </article>
            <article>
              <h3>Housing context</h3>
              <p>{getSubjectLocationLabel(subject)}</p>
            </article>
          </div>
        </WorkspacePanel>

        <WorkspacePanel title={`Batch, group, and cohort links (${aggregateMemberships.length})`}>
          {aggregateMemberships.length === 0 ? (
            <div className="inline-empty-state">
              <h3>No aggregate memberships</h3>
              <p>This subject is not linked to a batch, group, or cohort in the API response.</p>
            </div>
          ) : (
            <div className="research-card-list">
              {aggregateMemberships.map((membership) => (
                <article
                  className="research-card-list__item"
                  key={`${membership.aggregateId}-${membership.role}`}
                >
                  <div>
                    <h3>{membership.aggregateCode ?? membership.aggregateId}</h3>
                    <p>
                      {membership.aggregateName ?? membership.aggregateId} -{' '}
                      {formatToken(membership.role)}
                      {membership.count === undefined ? '' : `, count ${membership.count}`}
                    </p>
                  </div>
                  <StatusBadge tone={getSubjectAggregateKindTone(membership.aggregateKind)}>
                    {getSubjectAggregateKindLabel(membership.aggregateKind)}
                  </StatusBadge>
                  <Link
                    className="icon-link"
                    href={`/subjects/aggregates/${membership.aggregateId}`}
                  >
                    <span>Open</span>
                    <ArrowRight aria-hidden="true" size={16} />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </WorkspacePanel>
      </div>
    </div>
  );
}
