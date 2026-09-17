'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, Bookmark, Image as ImageIcon, Film, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useSidebar } from './SidebarProvider';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

type SearchResult = { id: string; type: 'image' | 'video'; title: string };

export function TopNav() {
  const { collapsed } = useSidebar();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    const timeout = setTimeout(async () => {
      if (q.length < 2) {
        setResults([]);
        setSearching(false);
        return;
      }
      setSearching(true);
      try {
        const { data } = await supabase
          .from('items')
          .select('id, type, title')
          .or(`title.ilike.%${q}%,prompt_text.ilike.%${q}%`)
          .limit(8);
        setResults(data || []);
      } catch (error) {
        console.error('Falha na busca:', error);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goToResult = (result: SearchResult) => {
    setOpen(false);
    setQuery('');
    router.push(result.type === 'video' ? '/prompts/video' : '/prompts/imagem');
  };

  return (
    <header className={clsx(
      "fixed top-0 left-0 right-0 h-16 bg-surface-container-lowest/80 backdrop-blur-xl z-40 px-4 md:px-8 flex items-center gap-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-all duration-300",
      collapsed ? "lg:left-20" : "lg:left-64"
    )}>
      <span className="font-semibold text-on-surface tracking-tight whitespace-nowrap hidden sm:block">Domínio Prompt</span>

      <div ref={containerRef} className="relative flex-1 max-w-lg">
        <div className="relative w-full flex items-center">
          <Search size={18} className="absolute left-3 text-on-surface-variant pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Buscar prompts por título ou texto..."
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low/90 text-on-surface text-sm rounded-lg placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
          />
          {searching && (
            <Loader2 size={14} className="absolute right-3 text-on-surface-variant animate-spin" />
          )}
        </div>

        {open && query.trim().length >= 2 && (
          <div className="absolute top-full mt-2 w-full bg-surface-container-low border border-surface-container-highest/50 rounded-lg shadow-2xl overflow-hidden z-50">
            {results.length === 0 && !searching ? (
              <p className="p-3 text-xs text-on-surface-variant">Nenhum resultado para &quot;{query}&quot;.</p>
            ) : (
              results.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => goToResult(r)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm text-on-surface hover:bg-surface-container transition-colors border-b border-surface-container-high/50 last:border-0"
                >
                  {r.type === 'video' ? <Film size={14} className="text-secondary shrink-0" /> : <ImageIcon size={14} className="text-primary shrink-0" />}
                  <span className="truncate">{r.title}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        <button type="button" className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container p-2 rounded-lg transition-colors relative" title="Notificações">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-container shadow-[0_0_6px_rgba(255,95,216,0.7)]"></span>
        </button>
        <button type="button" className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container p-2 rounded-lg transition-colors" title="Coleções salvas">
          <Bookmark size={20} />
        </button>

        <div className="h-6 w-[1px] bg-surface-container-high mx-2"></div>

        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-surface-container-high border border-primary/40 flex items-center justify-center shrink-0 overflow-hidden">
             <span className="text-xs font-bold text-on-surface">M</span>
          </div>
          <div className="flex flex-col text-left hidden sm:flex">
            <span className="text-xs font-medium text-on-surface leading-tight">Mastermind AI</span>
            <span className="text-[10px] font-mono text-secondary leading-tight uppercase tracking-wider">Criador Elite</span>
          </div>
        </div>
      </div>
    </header>
  );
}
