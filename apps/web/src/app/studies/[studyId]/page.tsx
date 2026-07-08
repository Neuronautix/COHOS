import { StudyDetail } from '../../../features/research/study-detail';

export type StudyDetailPageProps = {
  readonly params: Promise<{
    readonly studyId: string;
  }>;
};

export default async function StudyDetailPage({ params }: StudyDetailPageProps) {
  const { studyId } = await params;

  return <StudyDetail studyId={studyId} />;
}
