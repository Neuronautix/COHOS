import type { ReactNode } from 'react';

export type ShellSectionProps = {
  readonly children: ReactNode;
  readonly title: string;
};

export function ShellSection({ children, title }: ShellSectionProps) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export type StatusBadgeProps = {
  readonly children: ReactNode;
  readonly tone?: StatusTone;
};

export function StatusBadge({ children, tone = 'neutral' }: StatusBadgeProps) {
  return <span className={`status-badge status-badge--${tone}`}>{children}</span>;
}

export type PageHeaderProps = {
  readonly actions?: ReactNode;
  readonly eyebrow?: string;
  readonly summary: string;
  readonly title: string;
};

export function PageHeader({ actions, eyebrow, summary, title }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        {eyebrow === undefined ? null : <p className="page-header__eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p>{summary}</p>
      </div>
      {actions === undefined ? null : <div className="page-header__actions">{actions}</div>}
    </header>
  );
}

export type MetricTileProps = {
  readonly detail: string;
  readonly label: string;
  readonly tone?: StatusTone;
  readonly value: string;
};

export function MetricTile({ detail, label, tone = 'neutral', value }: MetricTileProps) {
  return (
    <article className={`metric-tile metric-tile--${tone}`}>
      <p className="metric-tile__label">{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}

export type WorkspacePanelProps = {
  readonly actions?: ReactNode;
  readonly children: ReactNode;
  readonly eyebrow?: string;
  readonly title: string;
};

export function WorkspacePanel({ actions, children, eyebrow, title }: WorkspacePanelProps) {
  return (
    <section className="workspace-panel">
      <div className="workspace-panel__header">
        <div>
          {eyebrow === undefined ? null : <p>{eyebrow}</p>}
          <h2>{title}</h2>
        </div>
        {actions === undefined ? null : <div>{actions}</div>}
      </div>
      {children}
    </section>
  );
}
