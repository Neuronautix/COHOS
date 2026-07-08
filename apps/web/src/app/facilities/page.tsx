import { WorkspacePage } from '../../components/workspace-page';
import { workspacePages } from '../../data/workspace';

export default function FacilityPage() {
  return <WorkspacePage config={workspacePages.facilities} />;
}
