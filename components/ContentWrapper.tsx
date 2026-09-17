'use client';

import clsx from 'clsx';
import { useSidebar } from './SidebarProvider';

export function ContentWrapper({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <div className={clsx(
      "flex-1 flex flex-col min-h-screen transition-all",
      collapsed ? "lg:pl-20" : "lg:pl-64"
    )}>
      {children}
    </div>
  );
}
