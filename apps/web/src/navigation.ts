export type WorkspaceNavigationItem = {
  readonly href: string;
  readonly id:
    | 'dashboard'
    | 'subjects'
    | 'facilities'
    | 'investigations'
    | 'welfare'
    | 'reports'
    | 'connectors'
    | 'qr-scan'
    | 'admin';
  readonly label: string;
};

export const workspaceNavigation = [
  {
    href: '/',
    id: 'dashboard',
    label: 'Dashboard',
  },
  {
    href: '/subjects',
    id: 'subjects',
    label: 'Subjects',
  },
  {
    href: '/facilities',
    id: 'facilities',
    label: 'Facility',
  },
  {
    href: '/investigations',
    id: 'investigations',
    label: 'Investigations',
  },
  {
    href: '/welfare',
    id: 'welfare',
    label: 'Welfare',
  },
  {
    href: '/reports',
    id: 'reports',
    label: 'Reports',
  },
  {
    href: '/connectors',
    id: 'connectors',
    label: 'Connectors',
  },
  {
    href: '/qr-scan',
    id: 'qr-scan',
    label: 'QR scan',
  },
  {
    href: '/admin',
    id: 'admin',
    label: 'Admin settings',
  },
] satisfies WorkspaceNavigationItem[];
