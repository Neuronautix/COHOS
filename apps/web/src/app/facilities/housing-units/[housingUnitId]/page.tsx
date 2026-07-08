import { HousingUnitDetailView } from '../../../../features/facilities/housing-unit-detail';

export type HousingUnitDetailPageProps = {
  readonly params: Promise<{
    readonly housingUnitId: string;
  }>;
};

export default async function HousingUnitDetailPage({ params }: HousingUnitDetailPageProps) {
  const { housingUnitId } = await params;

  return <HousingUnitDetailView housingUnitId={housingUnitId} />;
}
