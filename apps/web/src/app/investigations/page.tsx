import { WorkspacePage } from '../../components/workspace-page';
import { workspacePages } from '../../data/workspace';

export default function InvestigationsPage() {
  return <WorkspacePage config={workspacePages.investigations} />;
}
