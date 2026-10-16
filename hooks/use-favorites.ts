'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useMember } from './use-member';

const supabase = createClient();

type Snapshot = { ids: string[]; ready: boolean };

const EMPTY: string[] = [];
const SERVER_SNAPSHOT: Snapshot = { ids: EMPTY, ready: false };
const listeners = new Set<() => void>();

// One shared store for every heart button on the page (one fetch, not one per card).
let snapshot: Snapshot = SERVER_SNAPSHOT;
let loadedFor: string | null = null;

function emit(next: Snapshot) {
  snapshot = next;
  listeners.forEach(l => l());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

async function load(email: string) {
  if (loadedFor === email) return;
  loadedFor = email;
  emit({ ids: EMPTY, ready: false });
  try {
    const { data, error } = await supabase.rpc('get_favorites', { p_email: email });
    if (error) throw error;
    emit({ ids: (data as { item_id: string }[] | null)?.map(r => r.item_id) ?? EMPTY, ready: true });
  } catch (error) {
    console.error('Falha ao carregar favoritos:', error);
    emit({ ids: EMPTY, ready: true });
  }
}

export function useFavorites() {
  const member = useMember();
  const email = member?.email ?? '';
  const { ids, ready } = useSyncExternalStore(subscribe, () => snapshot, () => SERVER_SNAPSHOT);

  useEffect(() => {
    if (!email) return;
    void (async () => {
      await load(email);
    })();
  }, [email]);

  const toggle = useCallback(async (id: string) => {
    if (!email) return;
    const has = snapshot.ids.includes(id);
    emit({ ids: has ? snapshot.ids.filter(x => x !== id) : [...snapshot.ids, id], ready: true });
    try {
      const { error } = await supabase.rpc('toggle_favorite', { p_email: email, p_item: id });
      if (error) throw error;
    } catch (error) {
      console.error('Falha ao salvar favorito:', error);
      loadedFor = null;
      await load(email);
    }
  }, [email]);

  return { ids, ready, toggle, isFavorite: (id: string) => ids.includes(id) };
}
