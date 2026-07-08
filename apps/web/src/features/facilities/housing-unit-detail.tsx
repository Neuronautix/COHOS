'use client';

import { MetricTile, PageHeader, StatusBadge, WorkspacePanel } from '@cohos/ui';
import { useQuery } from '@tanstack/react-query';

import { fetchHousingUnit } from './facility-api';
import {
  formatFacilityToken,
  getEnvironmentTone,
  getHousingSpecificFields,
  getHousingUnitOccupantCount,
  getHousingUnitTypeLabel,
  getOccupancyTone,
} from './facility-formatters';
import { FacilityBackLink, FacilityLoadingState, FacilityState } from './facility-states';

export type HousingUnitDetailProps = {
  readonly housingUnitId: string;
};

export function HousingUnitDetailView({ housingUnitId }: HousingUnitDetailProps) {
  const housingUnitQuery = useQuery({
    queryFn: () => fetchHousingUnit(housingUnitId),
    queryKey: ['housing-unit', housingUnitId],
  });

  if (housingUnitQuery.isLoading) {
    return <FacilityLoadingState />;
  }

  if (housingUnitQuery.isError) {
    return (
      <FacilityState
        action={<FacilityBackLink />}
        detail={
          housingUnitQuery.error instanceof Error
            ? housingUnitQuery.error.message
            : 'Request failed.'
        }
        title="Housing unit unavailable"
      />
    );
  }

  const unit = housingUnitQuery.data;

  if (unit === undefined) {
    return (
      <FacilityState
        action={<FacilityBackLink />}
        detail="The configured API returned no housing unit for this route."
        title="Housing unit unavailable"
      />
    );
  }

  const occupantCount = getHousingUnitOccupantCount(unit);

  return (
    <div className="facility-page">
      <PageHeader
        actions={<FacilityBackLink />}
        eyebrow={getHousingUnitTypeLabel(unit)}
        summary={`${unit.code} housing detail with occupants, environmental observations, and workflow targets.`}
        title={unit.name}
      />

      <section aria-label={`${unit.name} metrics`} className="metric-grid">
        <MetricTile detail={unit.id} label="Housing unit" tone="info" value={unit.code} />
        <MetricTile
          detail={getHousingUnitTypeLabel(unit)}
          label="Type"
          tone="neutral"
          value={formatFacilityToken(unit.type)}
        />
        <MetricTile
          detail="Current derived count"
          label="Occupants"
          tone={getOccupancyTone(occupantCount)}
          value={occupantCount.toString()}
        />
        <MetricTile
          detail="Recent records"
          label="Environment"
          tone={getEnvironmentTone(unit)}
          value={unit.recentEnvironmentalObservations.length.toString()}
        />
      </section>

      <div className="workspace-grid">
        <WorkspacePanel title="Housing fields">
          <dl className="field-list">
            {getHousingSpecificFields(unit).map((field) => (
              <div key={field.label}>
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
        </WorkspacePanel>

        <WorkspacePanel title="Workflow targets">
          <div className="subject-context">
            <article>
              <h3>Transfer</h3>
              <p>{formatFacilityToken(unit.transferTarget.supportedEventType)}</p>
            </article>
            <article>
              <h3>Environment</h3>
              <p>{formatFacilityToken(unit.environmentalObservationTarget.supportedEventType)}</p>
            </article>
          </div>
        </WorkspacePanel>

        <WorkspacePanel title="Current occupants">
          {unit.occupants.length === 0 ? (
            <div className="inline-empty-state">
              <h3>No current occupants</h3>
              <p>This housing unit has no current occupant summary.</p>
            </div>
          ) : (
            <div className="occupant-list">
              {unit.occupants.map((occupant) => (
                <article className="occupant-list__item" key={occupant.subjectId}>
                  <div>
                    <h3>{occupant.subjectCode}</h3>
                    <p>
                      {formatFacilityToken(occupant.profileType)} · {occupant.subjectId}
                    </p>
                  </div>
                  <StatusBadge tone="success">
                    {occupant.count === undefined ? '1' : occupant.count.toString()}
                  </StatusBadge>
                </article>
              ))}
            </div>
          )}
        </WorkspacePanel>

        <WorkspacePanel title="Environmental observations">
          {unit.recentEnvironmentalObservations.length === 0 ? (
            <div className="inline-empty-state">
              <h3>No recent observations</h3>
              <p>No recent environmental observation summaries were returned.</p>
            </div>
          ) : (
            <div className="occupant-list">
              {unit.recentEnvironmentalObservations.map((observation) => (
                <article className="occupant-list__item" key={observation.id}>
                  <div>
                    <h3>{formatFacilityToken(observation.metric)}</h3>
                    <p>{observation.occurredAt}</p>
                  </div>
                  <StatusBadge tone="info">
                    {observation.value} {observation.unit}
                  </StatusBadge>
                </article>
              ))}
            </div>
          )}
        </WorkspacePanel>
      </div>
    </div>
  );
}
