export type ConnectorStateProps = {
  readonly action?: string;
  readonly detail: string;
  readonly title: string;
};

export function ConnectorState({ action, detail, title }: ConnectorStateProps) {
  return (
    <section className="state-panel">
      <div>
        <p className="eyebrow">Connectors</p>
        <h1>{title}</h1>
        <p>{detail}</p>
      </div>
      {action === undefined ? null : <span>{action}</span>}
    </section>
  );
}

export function ConnectorLoadingState() {
  return (
    <section className="skeleton-grid" aria-label="Loading connector workspace">
      {Array.from({ length: 4 }, (_, index) => (
        <div className="skeleton-card" key={index} />
      ))}
    </section>
  );
}
