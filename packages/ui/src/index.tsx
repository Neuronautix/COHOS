import type { ReactNode } from 'react';

export type ShellSectionProps = {
  readonly children: ReactNode;
  readonly title: string;
};

export function ShellSection({ children, title }: ShellSectionProps) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
