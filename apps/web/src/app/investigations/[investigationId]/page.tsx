import { InvestigationDetail } from '../../../features/research/investigation-detail';

export type InvestigationDetailPageProps = {
  readonly params: Promise<{
    readonly investigationId: string;
  }>;
};

export default async function InvestigationDetailPage({ params }: InvestigationDetailPageProps) {
  const { investigationId } = await params;

  return <InvestigationDetail investigationId={investigationId} />;
}
