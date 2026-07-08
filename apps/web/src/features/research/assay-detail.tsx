'use client';

import { MetricTile, PageHeader, StatusBadge, WorkspacePanel } from '@cohos/ui';
import { useQuery } from '@tanstack/react-query';

import { fetchAssay } from './research-api';
import { ConnectedResourceList, DatasetList, SampleList } from './research-lists';
import { formatResearchToken, getAssayFields, getCountTone } from './research-formatters';
import { ResearchBackLink, ResearchLoadingState, ResearchState } from './research-states';

export type AssayDetailProps = {
  readonly assayId: string;
};

export function AssayDetail({ assayId }: AssayDetailProps) {
  const assayQuery = useQuery({
    queryFn: () => fetchAssay(assayId),
    queryKey: ['assay', assayId],
  });

  if (assayQuery.isLoading) {
    return <ResearchLoadingState />;
  }

  if (assayQuery.isError) {
    return (
      <ResearchState
        action={<ResearchBackLink />}
        detail={assayQuery.error instanceof Error ? assayQuery.error.message : 'Request failed.'}
        title="Assay unavailable"
      />
    );
  }

  const assay = assayQuery.data;

  if (assay === undefined) {
    return (
      <ResearchState
        action={<ResearchBackLink />}
        detail="The configured API returned no assay for this route."
        title="Assay unavailable"
      />
    );
  }

  return (
    <div className="research-page">
      <PageHeader
        actions={<ResearchBackLink href={`/studies/${assay.studyId}`} label="Back to study" />}
        eyebrow="Assay"
        summary={`${formatResearchToken(assay.measurementType ?? 'measurement')} assay with procedures, samples, datasets, and provenance links.`}
        title={assay.title}
      />

      <section aria-label={`${assay.title} metrics`} className="metric-grid">
        <MetricTile
          detail="Operational procedure records"
          label="Procedures"
          tone="info"
          value={assay.procedures.length.toString()}
        />
        <MetricTile
          detail="Subject-derived outputs"
          label="Samples"
          tone="success"
          value={assay.samples.length.toString()}
        />
        <MetricTile
          detail="Linked data outputs"
          label="Datasets"
          tone="success"
          value={assay.datasets.length.toString()}
        />
        <MetricTile
          detail="External provenance links"
          label="Connected"
          tone="neutral"
          value={assay.connectedResources.length.toString()}
        />
      </section>

      <div className="workspace-grid">
        <WorkspacePanel title="Assay fields">
          <dl className="field-list">
            {getAssayFields(assay).map((field) => (
              <div key={field.label}>
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
        </WorkspacePanel>

        <WorkspacePanel title="Procedures">
          {assay.procedures.length === 0 ? (
            <div className="inline-empty-state">
              <h3>No procedures</h3>
              <p>No procedure records were returned for this assay.</p>
            </div>
          ) : (
            <div className="research-card-list">
              {assay.procedures.map((procedure) => (
                <article className="research-card-list__item" key={procedure.id}>
                  <div>
                    <h3>{procedure.name}</h3>
                    <p>{procedure.description ?? procedure.id}</p>
                  </div>
                  <StatusBadge tone={getCountTone(1)}>Procedure</StatusBadge>
                </article>
              ))}
            </div>
          )}
        </WorkspacePanel>
      </div>

      <div className="workspace-grid">
        <WorkspacePanel title="Samples">
          <SampleList samples={assay.samples} />
        </WorkspacePanel>

        <WorkspacePanel title="Datasets">
          <DatasetList datasets={assay.datasets} />
        </WorkspacePanel>
      </div>

      <WorkspacePanel title="Connected resources">
        <ConnectedResourceList links={assay.connectedResources} />
      </WorkspacePanel>
    </div>
  );
}
