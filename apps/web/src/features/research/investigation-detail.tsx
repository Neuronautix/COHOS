'use client';

import Link from 'next/link';

import { MetricTile, PageHeader, StatusBadge, WorkspacePanel } from '@cohos/ui';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';

import { fetchInvestigation } from './research-api';
import { ConnectedResourceList } from './research-lists';
import {
  formatResearchDateRange,
  getCountTone,
  getInvestigationFields,
  summarizeInvestigations,
} from './research-formatters';
import { ResearchBackLink, ResearchLoadingState, ResearchState } from './research-states';

export type InvestigationDetailProps = {
  readonly investigationId: string;
};

export function InvestigationDetail({ investigationId }: InvestigationDetailProps) {
  const investigationQuery = useQuery({
    queryFn: () => fetchInvestigation(investigationId),
    queryKey: ['investigation', investigationId],
  });

  if (investigationQuery.isLoading) {
    return <ResearchLoadingState />;
  }

  if (investigationQuery.isError) {
    return (
      <ResearchState
        action={<ResearchBackLink />}
        detail={
          investigationQuery.error instanceof Error
            ? investigationQuery.error.message
            : 'Request failed.'
        }
        title="Investigation unavailable"
      />
    );
  }

  const investigation = investigationQuery.data;

  if (investigation === undefined) {
    return (
      <ResearchState
        action={<ResearchBackLink />}
        detail="The configured API returned no investigation for this route."
        title="Investigation unavailable"
      />
    );
  }

  const summary = summarizeInvestigations([investigation]);

  return (
    <div className="research-page">
      <PageHeader
        actions={<ResearchBackLink />}
        eyebrow="Investigation"
        summary={`${formatResearchDateRange(investigation)} with studies, assays, linked participants, and connected resources.`}
        title={investigation.title}
      />

      <section aria-label={`${investigation.title} metrics`} className="metric-grid">
        <MetricTile
          detail="Nested research work"
          label="Studies"
          tone="info"
          value={summary.studyCount.toString()}
        />
        <MetricTile
          detail="Measurement and observation plans"
          label="Assays"
          tone="success"
          value={summary.assayCount.toString()}
        />
        <MetricTile
          detail="Subject associations across studies"
          label="Subjects"
          tone="success"
          value={summary.subjectLinkCount.toString()}
        />
        <MetricTile
          detail="Investigation, study, and assay links"
          label="Connected"
          tone="neutral"
          value={summary.connectedResourceCount.toString()}
        />
      </section>

      <div className="workspace-grid">
        <WorkspacePanel title="Investigation fields">
          <dl className="field-list">
            {getInvestigationFields(investigation).map((field) => (
              <div key={field.label}>
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
        </WorkspacePanel>

        <WorkspacePanel title="Connected resources">
          <ConnectedResourceList links={investigation.connectedResources} />
        </WorkspacePanel>
      </div>

      <WorkspacePanel title="Studies">
        <div className="research-card-list">
          {investigation.studies.map((study) => (
            <article className="research-card-list__item" key={study.id}>
              <div>
                <h3>{study.title}</h3>
                <p>{study.id}</p>
              </div>
              <StatusBadge tone={getCountTone(study.subjectIds.length)}>
                {study.subjectIds.length} subject
                {study.subjectIds.length === 1 ? '' : 's'}
              </StatusBadge>
              <StatusBadge tone={getCountTone(study.assays.length)}>
                {study.assays.length} assay
                {study.assays.length === 1 ? '' : 's'}
              </StatusBadge>
              <Link className="icon-link" href={`/studies/${study.id}`}>
                <span>Open</span>
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </article>
          ))}
        </div>
      </WorkspacePanel>
    </div>
  );
}
