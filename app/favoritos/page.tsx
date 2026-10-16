'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { PromptCard, type PromptItem } from '@/components/PromptCard';
import { useFavorites } from '@/hooks/use-favorites';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export default function FavoritosPage() {
  const { ids, ready } = useFavorites();
  const [items, setItems] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const idsKey = ids.join(',');

  useEffect(() => {
    void (async () => {
      if (!ready) return;
      const list = idsKey ? idsKey.split(',') : [];
      if (list.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }
      try {
        const { data } = await supabase
          .from('items')
          .select('id, type, title, prompt_text, media_url, tool:tools(name), engine:engines(name), niche:niches(id, name)')
          .in('id', list)
          .order('created_at', { ascending: false });
        if (data) {
          setItems((data as any[]).map(item => ({
            id: item.id,
            type: item.type,
            title: item.title,
            prompt_text: item.prompt_text,
            media_url: item.media_url,
            tool: { name: item.tool?.name || '' },
            engine: item.engine?.name ? { name: item.engine.name } : null,
            niche: { name: item.niche?.name || 'Sem categoria' },
          })));
        }
      } catch (error) {
        console.error('Falha ao carregar favoritos:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [idsKey, ready]);

  const visible = useMemo(() => items.filter(i => ids.includes(i.id)), [items, ids]);

  const groups = useMemo(() => {
    const map = new Map<string, PromptItem[]>();
    for (const item of visible) {
      const key = item.niche.name;
      map.set(key, [...(map.get(key) || []), item]);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [visible]);

  const shownGroups = activeCategory === 'all' ? groups : groups.filter(([name]) => name === activeCategory);

  return (
    <div className="flex flex-col w-full gap-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2 max-w-2xl">
        <div className="flex items-center gap-2">
          <Heart size={14} className="text-primary" fill="currentColor" />
          <span className="text-[10px] font-mono text-primary uppercase tracking-widest font-semibold">Favoritos</span>
        </div>
        <h1 className="text-3xl font-semibold text-on-surface tracking-tight">Seus favoritos</h1>
        <p className="text-on-surface-variant">Os prompts que você salvou, organizados por categoria. Só você vê esta lista.</p>
      </div>

      {groups.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {['all', ...groups.map(([name]) => name)].map(name => (
            <button
              key={name}
              onClick={() => setActiveCategory(name)}
              className={`shrink-0 px-4 py-1.5 rounded-full font-mono text-xs transition-all ${
                activeCategory === name
                  ? 'bg-primary-container text-on-primary-container font-semibold'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface border border-surface-container-highest/50'
              }`}
            >
              {name === 'all' ? 'Todas' : name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-on-surface-variant">Carregando favoritos...</div>
      ) : visible.length === 0 ? (
        <div className="py-16 text-center text-on-surface-variant bg-surface-container-low rounded-xl border border-surface-container-high border-dashed flex flex-col items-center gap-3">
          <Heart size={28} className="text-outline" />
          <p>Você ainda não favoritou nenhum prompt.</p>
          <p className="text-xs">Toque no coração de um prompt de <Link href="/prompts/imagem" className="text-primary underline">imagem</Link> ou <Link href="/prompts/video" className="text-primary underline">vídeo</Link> para salvá-lo aqui.</p>
        </div>
      ) : (
        shownGroups.map(([name, groupItems]) => (
          <section key={name} className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-on-surface">{name}</h2>
              <span className="text-xs font-mono text-outline">{groupItems.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {groupItems.map(item => (
                <PromptCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
