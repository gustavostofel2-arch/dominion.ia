'use client';

import { useState } from 'react';
import { Copy, Check, Terminal, Heart, Film } from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';
import { YouTubeAutoplayEmbed } from './YouTubeAutoplayEmbed';
import { NativeVideoAutoplay } from './NativeVideoAutoplay';
import { useFavorites } from '@/hooks/use-favorites';

export type PromptItem = {
  id: string;
  type: 'image' | 'video';
  title: string;
  prompt_text: string;
  media_url: string;
  tool: { name: string };
  engine?: { name: string } | null;
  niche: { name: string };
};

export function PromptCard({ item }: { item: PromptItem }) {
  const [copied, setCopied] = useState(false);
  const { toggle, isFavorite } = useFavorites();
  const favorite = isFavorite(item.id);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.prompt_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isVideo = item.type === 'video';

  // Helper to extract YouTube ID from any common URL shape (watch, shorts, embed, youtu.be, live)
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

  const ytId = isVideo ? getYouTubeId(item.media_url) : null;

  return (
    <div className="group flex flex-col bg-surface-container-low rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-surface-container-highest/50 hover:border-primary/20">
      
      {/* Media Frame */}
      <div className="relative overflow-hidden bg-surface-container-lowest select-none aspect-[9/16]">
        {isVideo && !item.media_url ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-on-surface-variant p-4 text-center">
            <Film size={24} className="text-secondary" />
            <span className="text-xs">Nenhum vídeo cadastrado</span>
          </div>
        ) : isVideo && ytId ? (
          <YouTubeAutoplayEmbed videoId={ytId} title={item.title} />
        ) : isVideo ? (
          <NativeVideoAutoplay src={item.media_url} title={item.title} />
        ) : (
          <Image
            src={item.media_url || 'https://picsum.photos/seed/placeholder/800/500'}
            alt={item.title}
            fill
            unoptimized
            loading="lazy"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        )}
        
        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-11 flex flex-wrap items-center gap-1.5 z-10 pointer-events-none">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-surface-container-highest/80 text-on-surface backdrop-blur-md">
            {item.niche?.name || 'Nicho'}
          </span>
        </div>

        <div className="absolute top-2 right-2 z-10">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggle(item.id); }}
            aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            aria-pressed={favorite}
            className={clsx(
              "w-8 h-8 flex items-center justify-center rounded-full bg-[#0b1222]/85 backdrop-blur-md shadow-sm transition-colors",
              favorite ? "text-primary" : "text-on-surface-variant hover:text-primary"
            )}
          >
            <Heart size={16} fill={favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex flex-col p-4 flex-1 justify-between gap-3 bg-surface-container-low">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-on-surface break-words">
            {item.title}
          </h3>
          {(item.tool?.name || item.engine?.name) && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {item.tool?.name && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-primary/10 text-primary">
                  {item.tool.name}
                </span>
              )}
              {item.engine?.name && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-secondary/15 text-secondary">
                  {item.engine.name}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Prompt Syntax Box */}
        <div className="relative bg-surface-container-lowest rounded-lg p-3 flex flex-col gap-2 shadow-inner border border-surface-container-high/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-outline flex items-center gap-1">
              <Terminal size={12} className={isVideo ? "text-secondary" : "text-primary"} />
              Prompt Sintético
            </span>
          </div>
          <div className="h-20 overflow-y-auto pr-1 scrollbar-thin">
            <code className="font-mono text-xs text-on-surface-variant block leading-relaxed select-all">
              {item.prompt_text}
            </code>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-1 flex items-center gap-2">
          <button 
            type="button"
            onClick={handleCopy}
            className={clsx(
              "w-full py-2 px-3 rounded-lg font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-sm active:scale-[0.98]",
              copied 
                ? "bg-secondary-container text-on-secondary-container shadow-[0_0_16px_rgba(37,244,238,0.4)]" 
                : "bg-surface-container hover:bg-primary-container hover:text-on-primary-container text-on-surface-variant"
            )}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copiado!' : 'Copiar Prompt'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
