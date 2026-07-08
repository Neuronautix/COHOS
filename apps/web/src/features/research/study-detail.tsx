'use client';

import Link from 'next/link';

import { MetricTile, PageHeader, StatusBadge, WorkspacePanel } from '@cohos/ui';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';

import { fetchStudy } from './research-api';
import { ConnectedResourceList, SubjectCohortList } from './research-lists';
import { getCountTone, getStudyFields } from './research-formatters';
import { ResearchBackLink, ResearchLoadingState, ResearchState } from './research-states';

export type StudyDetailProps = {
  readonly studyId: string;
};

export function StudyDetail({ studyId }: StudyDetailProps) {
  const studyQuery = useQuery({
    queryFn: () => fetchStudy(studyId),
    queryKey: ['study', studyId],
  });

  if (studyQuery.isLoading) {
    return <ResearchLoadingState />;
  }

  if (studyQuery.isError) {
    return (
      <ResearchState
        action={<ResearchBackLink />}
        detail={studyQuery.error instanceof Error ? studyQuery.error.message : 'Request failed.'}
        title="Study unavailable"
      />
    );
  }

  const study = studyQuery.data;

  if (study === undefined) {
    return (
      <ResearchState
        action={<ResearchBackLink />}
        detail="The configured API returned no study for this route."
        title="Study unavailable"
      />
    );
  }

  return (
    <div className="research-page">
      <PageHeader
        actions={
          <ResearchBackLink
            href={`/investigations/${study.investigationId}`}
            label="Back to investigation"
          />
        }
        eyebrow="Study"
        summary={`${study.subjectIds.length} subject link${study.subjectIds.length === 1 ? '' : 's'}, ${study.cohortIds.length} cohort link${study.cohortIds.length === 1 ? '' : 's'}, and ${study.assays.length} assay${study.assays.length === 1 ? '' : 's'}.`}
        title={study.title}
      />

      <section aria-label={`${study.title} metrics`} className="metric-grid">
        <MetricTile
          detail="Measurement and observation plans"
          label="Assays"
          tone="info"
          value={study.assays.length.toString()}
        />
        <MetricTile
          detail="Linked subject identifiers"
          label="Subjects"
          tone="success"
          value={study.subjectIds.length.toString()}
        />
        <MetricTile
          detail="Linked cohort identifiers"
          label="Cohorts"
          tone="neutral"
          value={study.cohortIds.length.toString()}
        />
        <MetricTile
          detail="External provenance links"
          label="Connected"
          tone="neutral"
          value={study.connectedResources.length.toString()}
        />
      </section>

      <div className="workspace-grid">
        <WorkspacePanel title="Study fields">
          <dl className="field-list">
            {getStudyFields(study).map((field) => (
              <div key={field.label}>
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
        </WorkspacePanel>

        <WorkspacePanel title="Linked subjects and cohorts">
          <SubjectCohortList cohortIds={study.cohortIds} subjectIds={study.subjectIds} />
        </WorkspacePanel>
      </div>

      <div className="workspace-grid">
        <WorkspacePanel title="Assays">
          <div className="research-card-list">
            {study.assays.map((assay) => (
              <article className="research-card-list__item" key={assay.id}>
                <div>
                  <h3>{assay.title}</h3>
                  <p>{assay.id}</p>
                </div>
                <StatusBadge tone={getCountTone(assay.procedures.length)}>
                  {assay.procedures.length} procedure
                  {assay.procedures.length === 1 ? '' : 's'}
                </StatusBadge>
                <StatusBadge tone={getCountTone(assay.datasets.length)}>
                  {assay.datasets.length} dataset
                  {assay.datasets.length === 1 ? '' : 's'}
                </StatusBadge>
                <Link className="icon-link" href={`/assays/${assay.id}`}>
                  <span>Open</span>
                  <ArrowRight aria-hidden="true" size={16} />
                </Link>
              </article>
            ))}
          </div>
        </WorkspacePanel>

        <WorkspacePanel title="Connected resources">
          <ConnectedResourceList links={study.connectedResources} />
        </WorkspacePanel>
      </div>
    </div>
  );
}
