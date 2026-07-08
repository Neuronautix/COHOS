import Link from 'next/link';

import type { ConnectedResourceLink, Dataset, Sample } from '@cohos/domain';
import { StatusBadge } from '@cohos/ui';
import { ExternalLink } from 'lucide-react';

import {
  formatOptionalResearchValue,
  formatResearchToken,
  getConnectedResourceSource,
} from './research-formatters';

export type ConnectedResourceListProps = {
  readonly links: readonly ConnectedResourceLink[];
};

export type SubjectCohortListProps = {
  readonly cohortIds: readonly string[];
  readonly subjectIds: readonly string[];
};

export type SampleListProps = {
  readonly samples: readonly Sample[];
};

export type DatasetListProps = {
  readonly datasets: readonly Dataset[];
};

export function ConnectedResourceList({ links }: ConnectedResourceListProps) {
  if (links.length === 0) {
    return (
      <div className="inline-empty-state">
        <h3>No connected resources</h3>
        <p>No external provenance links were returned for this record.</p>
      </div>
    );
  }

  return (
    <div className="research-card-list">
      {links.map((link) => (
        <article className="research-card-list__item" key={link.id}>
          <div>
            <h3>{link.label}</h3>
            <p>{link.url}</p>
          </div>
          <StatusBadge tone="info">{getConnectedResourceSource(link)}</StatusBadge>
          <a className="icon-link" href={link.url} rel="noreferrer" target="_blank">
            <span>Open</span>
            <ExternalLink aria-hidden="true" size={16} />
          </a>
        </article>
      ))}
    </div>
  );
}

export function SubjectCohortList({ cohortIds, subjectIds }: SubjectCohortListProps) {
  if (subjectIds.length === 0 && cohortIds.length === 0) {
    return (
      <div className="inline-empty-state">
        <h3>No subject or cohort links</h3>
        <p>This study has no subject or cohort associations in the API response.</p>
      </div>
    );
  }

  return (
    <div className="research-card-list">
      {subjectIds.map((subjectId) => (
        <article className="research-card-list__item" key={subjectId}>
          <div>
            <h3>{subjectId}</h3>
            <p>Linked subject</p>
          </div>
          <StatusBadge tone="success">Subject</StatusBadge>
          <Link className="icon-link" href={`/subjects/${subjectId}`}>
            Open
          </Link>
        </article>
      ))}
      {cohortIds.map((cohortId) => (
        <article className="research-card-list__item" key={cohortId}>
          <div>
            <h3>{cohortId}</h3>
            <p>Linked cohort</p>
          </div>
          <StatusBadge tone="neutral">Cohort</StatusBadge>
        </article>
      ))}
    </div>
  );
}

export function SampleList({ samples }: SampleListProps) {
  if (samples.length === 0) {
    return (
      <div className="inline-empty-state">
        <h3>No samples</h3>
        <p>No sample outputs were returned for this assay.</p>
      </div>
    );
  }

  return (
    <div className="research-card-list">
      {samples.map((sample) => (
        <article className="research-card-list__item" key={sample.id}>
          <div>
            <h3>{sample.sampleCode}</h3>
            <p>
              {formatResearchToken(sample.sampleType)} - {sample.id}
            </p>
          </div>
          <StatusBadge tone="success">
            {formatOptionalResearchValue(sample.collectedOn)}
          </StatusBadge>
          <Link className="icon-link" href={`/subjects/${sample.subjectId}`}>
            Subject
          </Link>
        </article>
      ))}
    </div>
  );
}

export function DatasetList({ datasets }: DatasetListProps) {
  if (datasets.length === 0) {
    return (
      <div className="inline-empty-state">
        <h3>No datasets</h3>
        <p>No datasets were returned for this assay.</p>
      </div>
    );
  }

  return (
    <div className="research-card-list">
      {datasets.map((dataset) => (
        <article className="research-card-list__item" key={dataset.id}>
          <div>
            <h3>{dataset.title}</h3>
            <p>
              {formatResearchToken(dataset.format)} - {dataset.id}
            </p>
          </div>
          <StatusBadge tone="info">{formatOptionalResearchValue(dataset.sampleId)}</StatusBadge>
          {dataset.uri === undefined ? null : (
            <a className="icon-link" href={dataset.uri} rel="noreferrer" target="_blank">
              URI
            </a>
          )}
        </article>
      ))}
    </div>
  );
}
