import { FacilityDetail } from '../../../features/facilities/facility-detail';

export type FacilityDetailPageProps = {
  readonly params: Promise<{
    readonly facilityId: string;
  }>;
};

export default async function FacilityDetailPage({ params }: FacilityDetailPageProps) {
  const { facilityId } = await params;

  return <FacilityDetail facilityId={facilityId} />;
}
