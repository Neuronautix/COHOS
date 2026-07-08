import { WorkspacePage } from '../../components/workspace-page';
import { workspacePages } from '../../data/workspace';

export default function QRScanPage() {
  return <WorkspacePage config={workspacePages['qr-scan']} />;
}
