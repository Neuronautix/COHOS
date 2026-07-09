import { SubjectAggregateDetail } from '../../../../features/subjects/subject-aggregate-detail';

export type SubjectAggregateDetailPageProps = {
  readonly params: Promise<{
    readonly aggregateId: string;
  }>;
};

export default async function SubjectAggregateDetailPage({
  params,
}: SubjectAggregateDetailPageProps) {
  const { aggregateId } = await params;

  return <SubjectAggregateDetail aggregateId={aggregateId} />;
}
