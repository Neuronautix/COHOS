import { WorkspacePage } from '../../components/workspace-page';
import { workspacePages } from '../../data/workspace';

export default function AdminSettingsPage() {
  return <WorkspacePage config={workspacePages.admin} />;
}
