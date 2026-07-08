import { WorkspacePage } from '../../components/workspace-page';
import { workspacePages } from '../../data/workspace';

export default function ReportsPage() {
  return <WorkspacePage config={workspacePages.reports} />;
}
