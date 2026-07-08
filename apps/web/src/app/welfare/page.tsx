import { WorkspacePage } from '../../components/workspace-page';
import { workspacePages } from '../../data/workspace';

export default function WelfarePage() {
  return <WorkspacePage config={workspacePages.welfare} />;
}
