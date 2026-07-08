import { WorkspacePage } from '../../components/workspace-page';
import { workspacePages } from '../../data/workspace';

export default function SubjectsPage() {
  return <WorkspacePage config={workspacePages.subjects} />;
}
