import { MetricTile, PageHeader, StatusBadge, WorkspacePanel } from '@cohos/ui';

import type { WorkspacePageConfig } from '../data/workspace';

export type WorkspacePageProps = {
  readonly config: WorkspacePageConfig;
};

export function WorkspacePage({ config }: WorkspacePageProps) {
  return (
    <div className="workspace-page">
      <PageHeader eyebrow={config.eyebrow} summary={config.summary} title={config.title} />

      <section aria-label={`${config.title} metrics`} className="metric-grid">
        {config.metrics.map((metric) => (
          <MetricTile
            detail={metric.detail}
            key={`${metric.label}-${metric.value}`}
            label={metric.label}
            tone={metric.tone}
            value={metric.value}
          />
        ))}
      </section>

      <div className="workspace-grid">
        {config.panels.map((panel) => (
          <WorkspacePanel eyebrow={panel.eyebrow} key={panel.title} title={panel.title}>
            <div className="work-list">
              {panel.items.map((item) => (
                <article className="work-list__item" key={item.title}>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                  </div>
                  <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
                </article>
              ))}
            </div>
          </WorkspacePanel>
        ))}
      </div>
    </div>
  );
}
