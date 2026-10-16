'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { ContentWrapper } from './ContentWrapper';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/entrar') {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <ContentWrapper>
        <TopNav />
        <main className="w-full flex-1 pt-20 px-4 md:px-8 pb-20 lg:pb-8">
          {children}
        </main>
      </ContentWrapper>
    </>
  );
}
