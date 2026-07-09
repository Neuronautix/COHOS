'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { MetricTile, PageHeader, StatusBadge, WorkspacePanel } from '@cohos/ui';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';

import { fetchSubjectAggregates } from './subject-api';
import {
  formatToken,
  getSubjectAggregateKindLabel,
  getSubjectAggregateKindTone,
  getSubjectAggregateStatusTone,
  matchesSubjectAggregateSearch,
  summarizeSubjectAggregates,
} from './subject-formatters';
import { SubjectLoadingState, SubjectState } from './subject-states';

export function SubjectAggregateList() {
  const [searchTerm, setSearchTerm] = useState('');
  const aggregatesQuery = useQuery({
    queryFn: fetchSubjectAggregates,
    queryKey: ['subject-aggregates'],
  });

  const aggregates = aggregatesQuery.data ?? [];
  const filteredAggregates = useMemo(
    () => aggregates.filter((aggregate) => matchesSubjectAggregateSearch(aggregate, searchTerm)),
    [aggregates, searchTerm],
  );
  const summary = useMemo(() => summarizeSubjectAggregates(aggregates), [aggregates]);

  if (aggregatesQuery.isLoading) {
    return <SubjectLoadingState />;
  }

  if (aggregatesQuery.isError) {
    return (
      <SubjectState
        action={
          <Link className="action-link" href="/subjects">
            Subjects
          </Link>
        }
        detail={
          aggregatesQuery.error instanceof Error ? aggregatesQuery.error.message : 'Request failed.'
        }
        title="Subject aggregates unavailable"
      />
    );
  }

  if (aggregates.length === 0) {
    return (
      <SubjectState
        action={
          <Link className="action-link" href="/subjects">
            Subjects
          </Link>
        }
        detail="No batch, group, or cohort aggregates were returned by the configured API."
        title="No subject aggregates found"
      />
    );
  }

  return (
    <div className="subject-page">
      <PageHeader
        actions={
          <Link className="action-link" href="/subjects">
            Subjects
          </Link>
        }
        eyebrow="Batch / Group / Cohort"
        summary="Aggregate registry for biological batches, operational groups, and study cohorts."
        title="Subject aggregates"
      />

      <section aria-label="Subject aggregate metrics" className="metric-grid">
        <MetricTile
          detail={`${summary.activeAggregates} active`}
          label="Total aggregates"
          tone="info"
          value={summary.totalAggregates.toString()}
        />
        <MetricTile
          detail="Shared-origin biological sets"
          label="Batches"
          tone="info"
          value={summary.batches.toString()}
        />
        <MetricTile
          detail="Housing, treatment, and management sets"
          label="Groups"
          tone="success"
          value={summary.groups.toString()}
        />
        <MetricTile
          detail="Study arms and analysis populations"
          label="Cohorts"
          tone="warning"
          value={summary.cohorts.toString()}
        />
      </section>

      <WorkspacePanel
        actions={
          <label className="search-field">
            <span>Search</span>
            <input
              onChange={(event) => {
                setSearchTerm(event.target.value);
              }}
              placeholder="Code, kind, subject"
              type="search"
              value={searchTerm}
            />
          </label>
        }
        title="Aggregate registry"
      >
        {filteredAggregates.length === 0 ? (
          <div className="inline-empty-state">
            <h3>No matching aggregates</h3>
            <p>No rows match the current search.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Aggregate</th>
                  <th scope="col">Kind</th>
                  <th scope="col">Scope</th>
                  <th scope="col">Members</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="visually-hidden">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAggregates.map((aggregate) => (
                  <tr key={aggregate.id}>
                    <td>
                      <strong>{aggregate.code}</strong>
                      <span>{aggregate.name}</span>
                    </td>
                    <td>
                      <StatusBadge tone={getSubjectAggregateKindTone(aggregate.kind)}>
                        {getSubjectAggregateKindLabel(aggregate.kind)}
                      </StatusBadge>
                    </td>
                    <td>
                      <strong>{aggregate.speciesId ?? 'All species'}</strong>
                      <span>
                        {aggregate.profileTypes.length === 0
                          ? 'All subject models'
                          : aggregate.profileTypes.map(formatToken).join(', ')}
                      </span>
                    </td>
                    <td>{aggregate.subjectIds.length}</td>
                    <td>
                      <StatusBadge tone={getSubjectAggregateStatusTone(aggregate.status)}>
                        {formatToken(aggregate.status)}
                      </StatusBadge>
                    </td>
                    <td>
                      <Link
                        aria-label={`Open ${aggregate.code}`}
                        className="icon-link"
                        href={`/subjects/aggregates/${aggregate.id}`}
                      >
                        <span>Open</span>
                        <ArrowRight aria-hidden="true" size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </WorkspacePanel>
    </div>
  );
}
