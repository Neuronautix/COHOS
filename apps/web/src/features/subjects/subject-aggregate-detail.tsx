'use client';

import Link from 'next/link';

import { MetricTile, PageHeader, StatusBadge, WorkspacePanel } from '@cohos/ui';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';

import { fetchSubjectAggregate, fetchSubjectAggregateMemberships } from './subject-api';
import {
  formatToken,
  getSubjectAggregateDetailFields,
  getSubjectAggregateKindLabel,
  getSubjectAggregateKindTone,
  getSubjectAggregateLabel,
  getSubjectAggregateStatusTone,
} from './subject-formatters';
import { SubjectLoadingState, SubjectState } from './subject-states';

export type SubjectAggregateDetailProps = {
  readonly aggregateId: string;
};

export function SubjectAggregateDetail({ aggregateId }: SubjectAggregateDetailProps) {
  const aggregateQuery = useQuery({
    queryFn: () => fetchSubjectAggregate(aggregateId),
    queryKey: ['subject-aggregate', aggregateId],
  });
  const membershipsQuery = useQuery({
    queryFn: () => fetchSubjectAggregateMemberships(aggregateId),
    queryKey: ['subject-aggregate-memberships', aggregateId],
  });

  if (aggregateQuery.isLoading || membershipsQuery.isLoading) {
    return <SubjectLoadingState />;
  }

  if (aggregateQuery.isError || membershipsQuery.isError) {
    const error = aggregateQuery.error ?? membershipsQuery.error;

    return (
      <SubjectState
        action={
          <Link className="action-link" href="/subjects/aggregates">
            Aggregates
          </Link>
        }
        detail={error instanceof Error ? error.message : 'Request failed.'}
        title="Subject aggregate unavailable"
      />
    );
  }

  const aggregate = aggregateQuery.data;
  const memberships = membershipsQuery.data ?? [];

  if (aggregate === undefined) {
    return (
      <SubjectState
        action={
          <Link className="action-link" href="/subjects/aggregates">
            Aggregates
          </Link>
        }
        detail="The configured API returned no subject aggregate for this route."
        title="Subject aggregate unavailable"
      />
    );
  }

  return (
    <div className="subject-page">
      <PageHeader
        actions={
          <Link className="action-link" href="/subjects/aggregates">
            Aggregates
          </Link>
        }
        eyebrow={getSubjectAggregateKindLabel(aggregate.kind)}
        summary={aggregate.description ?? getSubjectAggregateLabel(aggregate)}
        title={aggregate.code}
      />

      <section aria-label={`${aggregate.code} summary`} className="metric-grid">
        <MetricTile
          detail={aggregate.name}
          label="Aggregate"
          tone={getSubjectAggregateKindTone(aggregate.kind)}
          value={getSubjectAggregateKindLabel(aggregate.kind)}
        />
        <MetricTile
          detail="Linked through aggregate memberships"
          label="Members"
          tone="info"
          value={memberships.length.toString()}
        />
        <MetricTile
          detail={
            aggregate.profileTypes.length === 0
              ? 'All subject models'
              : aggregate.profileTypes.map(formatToken).join(', ')
          }
          label="Subject models"
          tone="neutral"
          value={
            aggregate.profileTypes.length === 0 ? 'All' : aggregate.profileTypes.length.toString()
          }
        />
        <MetricTile
          detail={
            aggregate.validFrom === undefined ? 'No start date recorded' : aggregate.validFrom
          }
          label="Status"
          tone={getSubjectAggregateStatusTone(aggregate.status)}
          value={formatToken(aggregate.status)}
        />
      </section>

      <div className="workspace-grid">
        <WorkspacePanel title="Aggregate metadata">
          <dl className="field-list">
            {getSubjectAggregateDetailFields(aggregate).map((field) => (
              <div key={field.label}>
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
        </WorkspacePanel>

        <WorkspacePanel title="Member subjects">
          {memberships.length === 0 ? (
            <div className="inline-empty-state">
              <h3>No linked subjects</h3>
              <p>This aggregate has no membership rows in the API response.</p>
            </div>
          ) : (
            <div className="research-card-list">
              {memberships.map((membership) => (
                <article
                  className="research-card-list__item"
                  key={`${membership.subjectId}-${membership.role}`}
                >
                  <div>
                    <h3>{membership.subjectId}</h3>
                    <p>
                      {formatToken(membership.role)}
                      {membership.count === undefined ? '' : `, count ${membership.count}`}
                    </p>
                  </div>
                  <StatusBadge tone={getSubjectAggregateKindTone(membership.aggregateKind)}>
                    {getSubjectAggregateKindLabel(membership.aggregateKind)}
                  </StatusBadge>
                  <Link className="icon-link" href={`/subjects/${membership.subjectId}`}>
                    <span>Subject</span>
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
