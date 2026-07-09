'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { MetricTile, PageHeader, StatusBadge, WorkspacePanel } from '@cohos/ui';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';

import { fetchSubjects } from './subject-api';
import {
  formatToken,
  getSubjectDisplayCode,
  getSubjectLocationLabel,
  getSubjectProfileLabel,
  getSubjectSpeciesLabel,
  getSubjectStatusTone,
  getSubjectWelfareLabel,
  getSubjectWelfareTone,
  matchesSubjectSearch,
  summarizeSubjects,
} from './subject-formatters';
import { SubjectLoadingState, SubjectState } from './subject-states';

export function SubjectList() {
  const [searchTerm, setSearchTerm] = useState('');
  const subjectsQuery = useQuery({
    queryFn: fetchSubjects,
    queryKey: ['subjects'],
  });

  const subjects = subjectsQuery.data ?? [];
  const filteredSubjects = useMemo(
    () => subjects.filter((subject) => matchesSubjectSearch(subject, searchTerm)),
    [searchTerm, subjects],
  );
  const summary = useMemo(() => summarizeSubjects(subjects), [subjects]);

  if (subjectsQuery.isLoading) {
    return <SubjectLoadingState />;
  }

  if (subjectsQuery.isError) {
    return (
      <SubjectState
        detail={
          subjectsQuery.error instanceof Error ? subjectsQuery.error.message : 'Request failed.'
        }
        title="Subject API unavailable"
      />
    );
  }

  if (subjects.length === 0) {
    return (
      <SubjectState
        detail="No subjects were returned by the configured API."
        title="No subjects found"
      />
    );
  }

  return (
    <div className="subject-page">
      <PageHeader
        actions={
          <Link className="action-link" href="/subjects/aggregates">
            Batch / Group / Cohort
          </Link>
        }
        eyebrow="Registry"
        summary="API-backed subject registry with model-specific status, housing, and welfare context."
        title="Subjects"
      />

      <section aria-label="Subject registry metrics" className="metric-grid">
        <MetricTile
          detail="Returned by the configured API"
          label="Total subjects"
          tone="info"
          value={summary.totalSubjects.toString()}
        />
        <MetricTile
          detail="Currently available in operations"
          label="Active"
          tone="success"
          value={summary.activeSubjects.toString()}
        />
        <MetricTile
          detail="Rodent, zebrafish, and farm animal records"
          label="Animal subjects"
          tone="neutral"
          value={summary.animalSubjects.toString()}
        />
        <MetricTile
          detail="Human rows expose pseudonymized codes"
          label="Protected human"
          tone="success"
          value={summary.protectedHumanSubjects.toString()}
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
              placeholder="Code, model, location"
              type="search"
              value={searchTerm}
            />
          </label>
        }
        title="Subject registry"
      >
        {filteredSubjects.length === 0 ? (
          <div className="inline-empty-state">
            <h3>No matching subjects</h3>
            <p>No rows match the current search.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Subject</th>
                  <th scope="col">Model</th>
                  <th scope="col">Species</th>
                  <th scope="col">Location</th>
                  <th scope="col">Welfare</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="visually-hidden">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map((subject) => (
                  <tr key={subject.id}>
                    <td>
                      <strong>{getSubjectDisplayCode(subject)}</strong>
                      <span>{subject.id}</span>
                    </td>
                    <td>{getSubjectProfileLabel(subject)}</td>
                    <td>{getSubjectSpeciesLabel(subject)}</td>
                    <td>{getSubjectLocationLabel(subject)}</td>
                    <td>
                      <StatusBadge tone={getSubjectWelfareTone(subject)}>
                        {getSubjectWelfareLabel(subject)}
                      </StatusBadge>
                    </td>
                    <td>
                      <StatusBadge tone={getSubjectStatusTone(subject.status)}>
                        {formatToken(subject.status)}
                      </StatusBadge>
                    </td>
                    <td>
                      <Link
                        aria-label={`Open ${getSubjectDisplayCode(subject)}`}
                        className="icon-link"
                        href={`/subjects/${subject.id}`}
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
