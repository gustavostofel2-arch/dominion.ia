'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Image as ImageIcon, Film, Layers } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { YouTubeAutoplayEmbed } from '@/components/YouTubeAutoplayEmbed';
import { NativeVideoAutoplay } from '@/components/NativeVideoAutoplay';

const supabase = createClient();

type FeedItem = {
  id: string;
  type: 'image' | 'video';
  title: string;
  prompt_text: string;
  media_url: string;
};

type FeedFilter = 'all' | 'image' | 'video';

const getYouTubeId = (url: string) => {
  if (!url) return null;
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/live\/([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{6,})/,
    /[?&]v=([a-zA-Z0-9_-]{6,})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

function FeedTile({ item }: { item: FeedItem }) {
  const isVideo = item.type === 'video';
  const ytId = isVideo ? getYouTubeId(item.media_url) : null;

  return (
    <Link
      href={isVideo ? '/prompts/video' : '/prompts/imagem'}
      className="group block w-full break-inside-avoid mb-4 rounded-xl overflow-hidden bg-surface-container-low border border-surface-container-highest/30 shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      <div className="relative w-full aspect-[9/16]">
        {isVideo && ytId ? (
          <YouTubeAutoplayEmbed videoId={ytId} title={item.title} interactive={false} />
        ) : isVideo ? (
          <NativeVideoAutoplay src={item.media_url} title={item.title} interactive={false} />
        ) : (
          <Image
            src={item.media_url || 'https://picsum.photos/seed/placeholder/600/750'}
            alt={item.title}
            fill
            unoptimized
            loading="lazy"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        )}
      </div>
      <div className="p-3 flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-on-surface truncate">{item.title}</span>
        <span className="text-xs text-on-surface-variant line-clamp-2">{item.prompt_text}</span>
      </div>
    </Link>
  );
}

export default function Home() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('all');
  const [stats, setStats] = useState({ total: 0, images: 0, videos: 0 });

  const loadFeed = useCallback(async (filter: FeedFilter) => {
    try {
      let query = supabase
        .from('items')
        .select('id, type, title, prompt_text, media_url')
        .order('created_at', { ascending: false })
        .limit(12);
      if (filter !== 'all') query = query.eq('type', filter);
      const { data } = await query;
      if (data) setFeed(data as unknown as FeedItem[]);
    } catch (error) {
      console.error('Falha ao carregar destaques:', error);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const [totalRes, imgRes, vidRes] = await Promise.all([
        supabase.from('items').select('id', { count: 'exact', head: true }),
        supabase.from('items').select('id', { count: 'exact', head: true }).eq('type', 'image'),
        supabase.from('items').select('id', { count: 'exact', head: true }).eq('type', 'video'),
      ]);
      setStats({ total: totalRes.count || 0, images: imgRes.count || 0, videos: vidRes.count || 0 });
    } catch (error) {
      console.error('Falha ao carregar estatísticas:', error);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await loadFeed(feedFilter);
    })();
  }, [feedFilter, loadFeed]);

  useEffect(() => {
    void (async () => {
      await loadStats();
    })();
  }, [loadStats]);

  // Realtime: qualquer insert/update/delete em items atualiza a Home sozinha.
  useEffect(() => {
    const channel = supabase
      .channel('home-items-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
        void loadFeed(feedFilter);
        void loadStats();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [feedFilter, loadFeed, loadStats]);

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      {/* Hero Section */}
      <section className="relative w-full rounded-2xl bg-surface-container-low p-8 md:p-12 overflow-hidden shadow-xl border border-surface-container-highest/30">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-4 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-outline flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              Sincronizado
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-on-surface">
            Biblioteca Master de Prompts
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
            Engenharia reversa e receitas de prompts testadas, prontas pra rodar no TikTok. Copie com um clique e produza visuais de nível internacional.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-on-surface-variant">
            <span className="flex items-center gap-1.5"><Layers size={14} className="text-primary" /> {stats.total} prompts</span>
            <span className="flex items-center gap-1.5"><ImageIcon size={14} className="text-primary" /> {stats.images} imagens</span>
            <span className="flex items-center gap-1.5"><Film size={14} className="text-secondary" /> {stats.videos} vídeos</span>
          </div>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/prompts/imagem"
          className="group relative flex flex-col justify-between p-8 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all duration-300 shadow-lg border border-surface-container-highest/50 overflow-hidden"
        >
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none transition-all duration-500 group-hover:bg-primary/20"></div>
          <div className="flex flex-col gap-4 z-10">
            <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <ImageIcon size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-on-surface group-hover:text-primary transition-colors flex items-center gap-2 mb-2">
                Prompts de Imagem
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                Fórmulas calibradas para gerar imagens no formato 9:16, de retratos editoriais hiper-realistas a produtos de luxo.
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/prompts/video"
          className="group relative flex flex-col justify-between p-8 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all duration-300 shadow-lg border border-surface-container-highest/50 overflow-hidden"
        >
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none transition-all duration-500 group-hover:bg-secondary/20"></div>
          <div className="flex flex-col gap-4 z-10">
            <div className="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
              <Film size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-on-surface group-hover:text-secondary transition-colors flex items-center gap-2 mb-2">
                Prompts de Vídeo
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                Parâmetros de movimento, prompts cinemáticos e frame guidance verticais, prontos pra rodar como conteúdo real.
              </p>
            </div>
          </div>
        </Link>
      </section>

      {/* Mixed feed of recent images/videos */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(254,44,85,0.9)]"></span>
            <h2 className="text-lg font-semibold text-on-surface">Recém-adicionados</h2>
          </div>
          <div className="flex items-center gap-2">
            {([
              { key: 'all', label: 'Todos' },
              { key: 'image', label: 'Imagem' },
              { key: 'video', label: 'Vídeo' },
            ] as const).map(opt => (
              <button
                key={opt.key}
                onClick={() => setFeedFilter(opt.key)}
                className={`px-3 py-1 rounded-full font-mono text-xs transition-all ${
                  feedFilter === opt.key
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {feed.length === 0 ? (
          <div className="py-12 text-center text-on-surface-variant bg-surface-container-low rounded-xl border border-surface-container-high border-dashed">
            Nenhum item encontrado.
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {feed.map(item => (
              <FeedTile key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
