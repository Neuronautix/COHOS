import Link from 'next/link';
import type { ReactNode } from 'react';

export type SubjectStateProps = {
  readonly action?: ReactNode;
  readonly detail: string;
  readonly title: string;
};

export function SubjectState({ action, detail, title }: SubjectStateProps) {
  return (
    <section className="state-panel">
      <div>
        <h2>{title}</h2>
        <p>{detail}</p>
      </div>
      {action === undefined ? null : <div>{action}</div>}
    </section>
  );
}

export function SubjectBackLink() {
  return (
    <Link className="action-link" href="/subjects">
      Back to subjects
    </Link>
  );
}

export function SubjectLoadingState() {
  return (
    <div className="subject-loading" aria-label="Loading subjects">
      <div className="skeleton-block skeleton-block--wide" />
      <div className="skeleton-grid">
        <div className="skeleton-block" />
        <div className="skeleton-block" />
        <div className="skeleton-block" />
      </div>
      <div className="skeleton-block skeleton-block--table" />
    </div>
  );
}
