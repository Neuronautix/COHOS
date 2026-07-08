import type { ReactNode } from 'react';

export type OperationsStateProps = {
  readonly action?: ReactNode;
  readonly detail: string;
  readonly title: string;
};

export function OperationsState({ action, detail, title }: OperationsStateProps) {
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

export function OperationsLoadingState() {
  return (
    <div aria-label="Loading operations workspace" className="subject-loading">
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
