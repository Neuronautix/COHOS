import { WorkspacePage } from '../components/workspace-page';
import { dashboardConfig } from '../data/workspace';

export default function HomePage() {
  return <WorkspacePage config={dashboardConfig} />;
}
