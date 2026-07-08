import { AssayDetail } from '../../../features/research/assay-detail';

export type AssayDetailPageProps = {
  readonly params: Promise<{
    readonly assayId: string;
  }>;
};

export default async function AssayDetailPage({ params }: AssayDetailPageProps) {
  const { assayId } = await params;

  return <AssayDetail assayId={assayId} />;
}
