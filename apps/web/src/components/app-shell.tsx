'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import {
  Bell,
  Building2,
  ClipboardList,
  FileBarChart2,
  FlaskConical,
  LayoutDashboard,
  QrCode,
  Settings,
  Share2,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';

import { workspaceNavigation } from '../navigation';

const navigationIcons = {
  admin: Settings,
  connectors: Share2,
  dashboard: LayoutDashboard,
  facilities: Building2,
  investigations: FlaskConical,
  reports: FileBarChart2,
  'qr-scan': QrCode,
  subjects: UsersRound,
  welfare: Bell,
} satisfies Record<(typeof workspaceNavigation)[number]['id'], LucideIcon>;

export type AppShellProps = {
  readonly apiBaseUrl: string;
  readonly children: ReactNode;
};

function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ apiBaseUrl, children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link className="brand" href="/">
          <span className="brand__mark">C</span>
          <span>
            <strong>COHOS</strong>
            <small>Subject operations</small>
          </span>
        </Link>

        <nav aria-label="Workspace" className="app-nav">
          {workspaceNavigation.map((item) => {
            const Icon = navigationIcons[item.id];
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                aria-current={active ? 'page' : undefined}
                className="app-nav__link"
                data-active={active}
                href={item.href}
                key={item.href}
              >
                <Icon aria-hidden="true" size={18} strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="app-sidebar__status">
          <ClipboardList aria-hidden="true" size={18} />
          <div>
            <span>API base</span>
            <strong>{apiBaseUrl}</strong>
          </div>
        </div>
      </aside>

      <div className="app-frame">
        <header className="app-topbar">
          <div>
            <span>COHOS workspace</span>
            <strong>Backend source of truth</strong>
          </div>
          <div className="app-topbar__status" aria-label="System status">
            <span />
            Ready
          </div>
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
