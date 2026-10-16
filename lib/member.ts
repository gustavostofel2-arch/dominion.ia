export const MEMBER_COOKIE = 'dominion_member';

export type MemberSession = { email: string; name: string; role: 'user' | 'admin' };

const listeners = new Set<() => void>();

export function subscribeMember(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notify() {
  listeners.forEach(l => l());
}

// Raw (still URL-encoded) cookie value; a stable string so it works as a
// useSyncExternalStore snapshot.
export function getMemberRaw(): string {
  const match = document.cookie.match(new RegExp(`(?:^|; )${MEMBER_COOKIE}=([^;]*)`));
  return match ? match[1] : '';
}

export function parseMember(raw: string): MemberSession | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(decodeURIComponent(raw));
    if (value && typeof value.e === 'string' && value.e) {
      return { email: value.e, name: typeof value.n === 'string' ? value.n : '', role: value.r === 'admin' ? 'admin' : 'user' };
    }
  } catch {
    // older cookies stored only the e-mail
  }
  try {
    const email = decodeURIComponent(raw);
    return email ? { email, name: '', role: 'user' } : null;
  } catch {
    return null;
  }
}

export function setMemberSession(session: MemberSession) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  const value = encodeURIComponent(JSON.stringify({ e: session.email, n: session.name, r: session.role }));
  document.cookie = `${MEMBER_COOKIE}=${value}; path=/; max-age=31536000; SameSite=Lax${secure}`;
  notify();
}

export function clearMemberSession() {
  document.cookie = `${MEMBER_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  notify();
}
