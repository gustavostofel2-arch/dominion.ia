import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { MEMBER_COOKIE } from '@/lib/member';

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Admin has its own, much stricter check (real Supabase session + is_admin()).
  if (pathname.startsWith('/admin')) {
    return updateSession(request);
  }

  const hasMember = request.cookies.has(MEMBER_COOKIE);

  if (pathname === '/entrar') {
    if (hasMember) {
      const next = request.nextUrl.searchParams.get('next');
      const target = request.nextUrl.clone();
      target.pathname = next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
      target.search = '';
      return NextResponse.redirect(target);
    }
    return NextResponse.next();
  }

  if (!hasMember) {
    const target = request.nextUrl.clone();
    target.pathname = '/entrar';
    target.search = '';
    target.searchParams.set('next', pathname + search);
    return NextResponse.redirect(target);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|mp4|webm|txt|xml)$).*)'],
};
