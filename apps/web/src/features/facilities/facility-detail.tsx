'use client';

import Link from 'next/link';

import { MetricTile, PageHeader, StatusBadge, WorkspacePanel } from '@cohos/ui';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';

import { fetchFacility } from './facility-api';
import {
  getEnvironmentTone,
  getHousingUnitTypeLabel,
  getOccupancyTone,
  summarizeFacilities,
} from './facility-formatters';
import { FacilityBackLink, FacilityLoadingState, FacilityState } from './facility-states';

export type FacilityDetailProps = {
  readonly facilityId: string;
};

export function FacilityDetail({ facilityId }: FacilityDetailProps) {
  const facilityQuery = useQuery({
    queryFn: () => fetchFacility(facilityId),
    queryKey: ['facility', facilityId],
  });

  if (facilityQuery.isLoading) {
    return <FacilityLoadingState />;
  }

  if (facilityQuery.isError) {
    return (
      <FacilityState
        action={<FacilityBackLink />}
        detail={
          facilityQuery.error instanceof Error ? facilityQuery.error.message : 'Request failed.'
        }
        title="Facility unavailable"
      />
    );
  }

  const facility = facilityQuery.data;

  if (facility === undefined) {
    return (
      <FacilityState
        action={<FacilityBackLink />}
        detail="The configured API returned no facility for this route."
        title="Facility unavailable"
      />
    );
  }

  const summary = summarizeFacilities([facility]);

  return (
    <div className="facility-page">
      <PageHeader
        actions={<FacilityBackLink />}
        eyebrow="Facility"
        summary={`${facility.code} hierarchy with room, rack, housing, occupant, and environment context.`}
        title={facility.name}
      />

      <section aria-label={`${facility.name} metrics`} className="metric-grid">
        <MetricTile
          detail="Rooms in this facility"
          label="Rooms"
          tone="info"
          value={summary.roomCount.toString()}
        />
        <MetricTile
          detail="Housing units in this facility"
          label="Housing"
          tone="success"
          value={summary.housingUnitCount.toString()}
        />
        <MetricTile
          detail="Current occupant count"
          label="Occupants"
          tone="success"
          value={summary.occupantCount.toString()}
        />
        <MetricTile
          detail="Recent environment records"
          label="Environment"
          tone="neutral"
          value={summary.environmentalObservationCount.toString()}
        />
      </section>

      <WorkspacePanel title="Rooms and housing">
        <div className="facility-tree">
          {facility.rooms.map((room) => (
            <section className="facility-room" key={room.id}>
              <div className="facility-room__header">
                <div>
                  <h3>{room.name}</h3>
                  <p>
                    Room {room.code} · {room.racks.length} rack
                    {room.racks.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              <div className="housing-list">
                {room.housingUnits.map((unit) => (
                  <article className="housing-list__item" key={unit.id}>
                    <div>
                      <h4>{unit.name}</h4>
                      <p>
                        {getHousingUnitTypeLabel(unit)} · {unit.code}
                      </p>
                    </div>
                    <StatusBadge tone={getOccupancyTone(unit.currentOccupantCount)}>
                      {unit.currentOccupantCount} occupant
                      {unit.currentOccupantCount === 1 ? '' : 's'}
                    </StatusBadge>
                    <StatusBadge tone={getEnvironmentTone(unit)}>
                      {unit.recentEnvironmentalObservationIds.length} env
                    </StatusBadge>
                    <Link className="icon-link" href={`/facilities/housing-units/${unit.id}`}>
                      <span>Open</span>
                      <ArrowRight aria-hidden="true" size={16} />
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </WorkspacePanel>
    </div>
  );
}
