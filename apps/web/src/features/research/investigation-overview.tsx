'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { MetricTile, PageHeader, StatusBadge, WorkspacePanel } from '@cohos/ui';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';

import { fetchInvestigations, fetchResearchVocabulary } from './research-api';
import {
  formatResearchDateRange,
  getCountTone,
  getVocabularyEquivalentLabel,
  getVocabularyTitle,
  matchesInvestigationSearch,
  summarizeInvestigations,
} from './research-formatters';
import { ResearchLoadingState, ResearchState } from './research-states';

export function InvestigationOverview() {
  const [searchTerm, setSearchTerm] = useState('');
  const investigationsQuery = useQuery({
    queryFn: fetchInvestigations,
    queryKey: ['investigations'],
  });
  const vocabularyQuery = useQuery({
    queryFn: fetchResearchVocabulary,
    queryKey: ['research-vocabulary'],
  });

  const investigations = investigationsQuery.data ?? [];
  const filteredInvestigations = useMemo(
    () =>
      investigations.filter((investigation) =>
        matchesInvestigationSearch(investigation, searchTerm),
      ),
    [investigations, searchTerm],
  );
  const summary = useMemo(() => summarizeInvestigations(investigations), [investigations]);
  const vocabularyTerms = vocabularyQuery.data?.terms ?? [];

  if (investigationsQuery.isLoading || vocabularyQuery.isLoading) {
    return <ResearchLoadingState />;
  }

  if (investigationsQuery.isError) {
    return (
      <ResearchState
        detail={
          investigationsQuery.error instanceof Error
            ? investigationsQuery.error.message
            : 'Request failed.'
        }
        title="Investigation API unavailable"
      />
    );
  }

  if (investigations.length === 0) {
    return (
      <ResearchState
        detail="No investigations were returned by the configured API."
        title="No investigations found"
      />
    );
  }

  return (
    <div className="research-page">
      <PageHeader
        eyebrow="Research"
        summary="API-backed investigation, study, assay, procedure, and connected-resource workspace."
        title="Investigations"
      />

      <section aria-label="Research metrics" className="metric-grid">
        <MetricTile
          detail="Top-level research contexts"
          label="Investigations"
          tone="info"
          value={summary.investigationCount.toString()}
        />
        <MetricTile
          detail="Nested under investigations"
          label="Studies"
          tone="success"
          value={summary.studyCount.toString()}
        />
        <MetricTile
          detail="Measurement and observation plans"
          label="Assays"
          tone="success"
          value={summary.assayCount.toString()}
        />
        <MetricTile
          detail="External provenance links"
          label="Connected"
          tone="neutral"
          value={summary.connectedResourceCount.toString()}
        />
      </section>

      <WorkspacePanel title="Research vocabulary">
        {vocabularyQuery.isError ? (
          <div className="inline-empty-state">
            <h3>Vocabulary unavailable</h3>
            <p>
              {vocabularyQuery.error instanceof Error
                ? vocabularyQuery.error.message
                : 'Request failed.'}
            </p>
          </div>
        ) : (
          <div className="research-vocabulary">
            {vocabularyTerms.map((term) => (
              <article className="research-vocabulary__item" key={term.canonical}>
                <div>
                  <h3>{getVocabularyTitle(term)}</h3>
                  <p>{term.description}</p>
                </div>
                <StatusBadge tone="info">{getVocabularyEquivalentLabel(term)}</StatusBadge>
              </article>
            ))}
          </div>
        )}
      </WorkspacePanel>

      <WorkspacePanel
        actions={
          <label className="search-field">
            <span>Search</span>
            <input
              onChange={(event) => {
                setSearchTerm(event.target.value);
              }}
              placeholder="Title, study, assay, subject"
              type="search"
              value={searchTerm}
            />
          </label>
        }
        title="Investigation registry"
      >
        {filteredInvestigations.length === 0 ? (
          <div className="inline-empty-state">
            <h3>No matching investigations</h3>
            <p>No rows match the current search.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Investigation</th>
                  <th scope="col">Dates</th>
                  <th scope="col">Studies</th>
                  <th scope="col">Assays</th>
                  <th scope="col">Connected</th>
                  <th scope="col">
                    <span className="visually-hidden">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInvestigations.map((investigation) => {
                  const investigationSummary = summarizeInvestigations([investigation]);

                  return (
                    <tr key={investigation.id}>
                      <td>
                        <strong>{investigation.title}</strong>
                        <span>{investigation.id}</span>
                      </td>
                      <td>{formatResearchDateRange(investigation)}</td>
                      <td>
                        <StatusBadge tone={getCountTone(investigationSummary.studyCount)}>
                          {investigationSummary.studyCount}
                        </StatusBadge>
                      </td>
                      <td>
                        <StatusBadge tone={getCountTone(investigationSummary.assayCount)}>
                          {investigationSummary.assayCount}
                        </StatusBadge>
                      </td>
                      <td>
                        <StatusBadge
                          tone={getCountTone(investigationSummary.connectedResourceCount)}
                        >
                          {investigationSummary.connectedResourceCount}
                        </StatusBadge>
                      </td>
                      <td>
                        <Link
                          aria-label={`Open ${investigation.title}`}
                          className="icon-link"
                          href={`/investigations/${investigation.id}`}
                        >
                          <span>Open</span>
                          <ArrowRight aria-hidden="true" size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </WorkspacePanel>
    </div>
  );
}
