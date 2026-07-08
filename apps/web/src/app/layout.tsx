import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';
import { AppShell } from '../components/app-shell';
import { apiBaseUrl } from '../lib/api-client';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'COHOS',
  description: 'COHOS subject management system',
};

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell apiBaseUrl={apiBaseUrl}>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
