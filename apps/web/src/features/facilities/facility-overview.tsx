'use client';

import Link from 'next/link';

import { MetricTile, PageHeader, StatusBadge, WorkspacePanel } from '@cohos/ui';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';

import { fetchFacilities } from './facility-api';
import {
  formatFacilityToken,
  getEnvironmentTone,
  getHousingUnitTypeLabel,
  getOccupancyTone,
  summarizeFacilities,
} from './facility-formatters';
import { FacilityLoadingState, FacilityState } from './facility-states';

export function FacilityOverview() {
  const facilitiesQuery = useQuery({
    queryFn: fetchFacilities,
    queryKey: ['facilities'],
  });

  const facilities = facilitiesQuery.data ?? [];
  const summary = summarizeFacilities(facilities);

  if (facilitiesQuery.isLoading) {
    return <FacilityLoadingState />;
  }

  if (facilitiesQuery.isError) {
    return (
      <FacilityState
        detail={
          facilitiesQuery.error instanceof Error ? facilitiesQuery.error.message : 'Request failed.'
        }
        title="Facility API unavailable"
      />
    );
  }

  if (facilities.length === 0) {
    return (
      <FacilityState
        detail="No facility hierarchy was returned by the configured API."
        title="No facilities found"
      />
    );
  }

  return (
    <div className="facility-page">
      <PageHeader
        eyebrow="Housing"
        summary="API-backed facility hierarchy with housing units, current occupants, and environment links."
        title="Facility"
      />

      <section aria-label="Facility metrics" className="metric-grid">
        <MetricTile
          detail="Configured facility records"
          label="Facilities"
          tone="info"
          value={summary.facilityCount.toString()}
        />
        <MetricTile
          detail="Rooms with housing units"
          label="Rooms"
          tone="neutral"
          value={summary.roomCount.toString()}
        />
        <MetricTile
          detail="Cages, tanks, and other units"
          label="Housing units"
          tone="success"
          value={summary.housingUnitCount.toString()}
        />
        <MetricTile
          detail="Derived from current housing state"
          label="Occupants"
          tone="success"
          value={summary.occupantCount.toString()}
        />
      </section>

      <WorkspacePanel title="Facility hierarchy">
        <div className="facility-tree">
          {facilities.map((facility) => (
            <section className="facility-tree__facility" key={facility.id}>
              <div className="facility-tree__heading">
                <div>
                  <h3>{facility.name}</h3>
                  <p>
                    {facility.code} · {facility.id}
                  </p>
                </div>
                <Link className="icon-link" href={`/facilities/${facility.id}`}>
                  <span>Open</span>
                  <ArrowRight aria-hidden="true" size={16} />
                </Link>
              </div>

              {facility.rooms.map((room) => (
                <div className="facility-room" key={room.id}>
                  <div className="facility-room__header">
                    <div>
                      <h4>{room.name}</h4>
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
                          <h5>{unit.name}</h5>
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
                        <Link
                          aria-label={`Open ${unit.name}`}
                          className="icon-link"
                          href={`/facilities/housing-units/${unit.id}`}
                        >
                          <span>{formatFacilityToken(unit.type)}</span>
                          <ArrowRight aria-hidden="true" size={16} />
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
      </WorkspacePanel>
    </div>
  );
}
