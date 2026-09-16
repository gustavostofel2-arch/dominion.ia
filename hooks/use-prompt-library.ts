'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { PromptItem } from '@/components/PromptCard';

const supabase = createClient();
const PAGE_SIZE = 12;

type Niche = { id: string; name: string };

export function usePromptLibrary(type: 'image' | 'video') {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeNiche = searchParams.get('niche') || 'all';

  const [items, setItems] = useState<PromptItem[]>([]);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);

  const fetchItems = useCallback(async (pageIndex: number, niche: string) => {
    setLoading(true);
    const from = pageIndex * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from('items')
      .select(`
        id, type, title, prompt_text, media_url,
        tool:tools(name),
        niche:niches(id, name)
      `)
      .eq('type', type)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (niche !== 'all') {
      query = query.eq('niche_id', niche);
    }

    try {
      const { data } = await query;

      if (data) {
        const formatted = (data as any[]).map(item => ({
          id: item.id,
          type: item.type,
          title: item.title,
          prompt_text: item.prompt_text,
          media_url: item.media_url,
          tool: { name: item.tool?.name || 'Unknown' },
          niche: { name: item.niche?.name || 'Unknown' },
        }));
        setItems(prev => (pageIndex === 0 ? formatted : [...prev, ...formatted]));
        setHasMore(formatted.length === PAGE_SIZE);
      }
    } catch (error) {
      console.error('Falha ao carregar itens:', error);
      if (pageIndex === 0) setItems([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    async function loadNiches() {
      try {
        const { data } = await supabase.from('niches').select('*').order('name');
        if (data) setNiches(data);
      } catch (error) {
        console.error('Falha ao carregar nichos:', error);
      }
    }
    void loadNiches();
  }, []);

  useEffect(() => {
    pageRef.current = 0;
    void (async () => {
      await fetchItems(0, activeNiche);
    })();
  }, [activeNiche, fetchItems]);

  const setActiveNiche = useCallback((niche: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (niche === 'all') {
      params.delete('niche');
    } else {
      params.set('niche', niche);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [router, pathname, searchParams]);

  const loadMore = useCallback(() => {
    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;
    void fetchItems(nextPage, activeNiche);
  }, [activeNiche, fetchItems]);

  return { items, niches, activeNiche, setActiveNiche, loading, hasMore, loadMore };
}
