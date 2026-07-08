import Link from 'next/link';
import type { ReactNode } from 'react';

export type ResearchStateProps = {
  readonly action?: ReactNode;
  readonly detail: string;
  readonly title: string;
};

export type ResearchBackLinkProps = {
  readonly href?: string;
  readonly label?: string;
};

export function ResearchState({ action, detail, title }: ResearchStateProps) {
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

export function ResearchBackLink({
  href = '/investigations',
  label = 'Back to investigations',
}: ResearchBackLinkProps) {
  return (
    <Link className="action-link" href={href}>
      {label}
    </Link>
  );
}

export function ResearchLoadingState() {
  return (
    <div aria-label="Loading research workspace" className="subject-loading">
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
