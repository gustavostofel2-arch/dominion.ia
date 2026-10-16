'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { ContentWrapper } from './ContentWrapper';
import { createClient } from '@/lib/supabase/client';
import { clearMemberSession, getMemberRaw, parseMember, setMemberSession } from '@/lib/member';

const supabase = createClient();

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const checkedRef = useRef(false);

  // Once per page load, re-check the member against the allowlist so removing
  // someone (or changing their role/name) in the admin takes effect on their next visit.
  useEffect(() => {
    if (pathname === '/entrar' || checkedRef.current) return;
    const member = parseMember(getMemberRaw());
    if (!member) return;
    checkedRef.current = true;

    void (async () => {
      try {
        const { data, error } = await supabase.rpc('member_login', { p_email: member.email });
        if (error) {
          if (error.message.includes('not registered')) {
            clearMemberSession();
            window.location.assign('/entrar');
          }
          return;
        }
        const row = (data as { member_name: string | null; member_role: string }[] | null)?.[0];
        if (!row?.member_name) {
          clearMemberSession();
          window.location.assign('/entrar');
          return;
        }
        const role = row.member_role === 'admin' ? 'admin' : 'user';
        if (row.member_name !== member.name || role !== member.role) {
          setMemberSession({ email: member.email, name: row.member_name, role });
        }
      } catch (error) {
        console.error('Falha ao validar membro:', error);
      }
    })();
  }, [pathname]);

  // Standalone auth screens: no sidebar / top bar.
  if (pathname === '/entrar' || pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div data-admin={pathname.startsWith('/admin') ? 'true' : undefined}>
      <Sidebar />
      <ContentWrapper>
        <TopNav />
        <main className="w-full flex-1 pt-20 px-4 md:px-8 pb-20 lg:pb-8">
          {children}
        </main>
      </ContentWrapper>
    </div>
  );
}
