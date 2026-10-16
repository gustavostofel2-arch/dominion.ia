export const MEMBER_COOKIE = 'dominion_member';

export function setMemberCookie(email: string) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${MEMBER_COOKIE}=${encodeURIComponent(email)}; path=/; max-age=31536000; SameSite=Lax${secure}`;
}

export function clearMemberCookie() {
  document.cookie = `${MEMBER_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function readMemberEmail(): string {
  const match = document.cookie.match(new RegExp(`(?:^|; )${MEMBER_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}
