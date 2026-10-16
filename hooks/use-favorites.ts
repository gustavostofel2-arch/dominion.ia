'use client';

import { useCallback, useSyncExternalStore } from 'react';

const KEY = 'dominion:favorites';
const EMPTY: string[] = [];
const listeners = new Set<() => void>();

let raw: string | null = null;
let parsed: string[] = EMPTY;

function getSnapshot(): string[] {
  let current: string | null = null;
  try {
    current = localStorage.getItem(KEY);
  } catch {
    return parsed;
  }
  if (current !== raw) {
    raw = current;
    try {
      const value = current ? JSON.parse(current) : [];
      parsed = Array.isArray(value) ? value : EMPTY;
    } catch {
      parsed = EMPTY;
    }
  }
  return parsed;
}

function getServerSnapshot(): string[] {
  return EMPTY;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener('storage', callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', callback);
  };
}

function write(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    return;
  }
  listeners.forEach(l => l());
}

export function useFavorites() {
  const ids = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((id: string) => {
    const current = getSnapshot();
    write(current.includes(id) ? current.filter(x => x !== id) : [...current, id]);
  }, []);

  return { ids, toggle, isFavorite: (id: string) => ids.includes(id) };
}
