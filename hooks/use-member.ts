'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { getMemberRaw, parseMember, subscribeMember } from '@/lib/member';

export function useMember() {
  const raw = useSyncExternalStore(subscribeMember, getMemberRaw, () => '');
  return useMemo(() => parseMember(raw), [raw]);
}
