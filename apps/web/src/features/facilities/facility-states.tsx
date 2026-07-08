import Link from 'next/link';
import type { ReactNode } from 'react';

export type FacilityStateProps = {
  readonly action?: ReactNode;
  readonly detail: string;
  readonly title: string;
};

export function FacilityState({ action, detail, title }: FacilityStateProps) {
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

export function FacilityBackLink() {
  return (
    <Link className="action-link" href="/facilities">
      Back to facility
    </Link>
  );
}

export function FacilityLoadingState() {
  return (
    <div className="subject-loading" aria-label="Loading facility">
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
