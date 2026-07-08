import { SubjectDetail } from '../../../features/subjects/subject-detail';

export type SubjectDetailPageProps = {
  readonly params: Promise<{
    readonly subjectId: string;
  }>;
};

export default async function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const { subjectId } = await params;

  return <SubjectDetail subjectId={subjectId} />;
}
