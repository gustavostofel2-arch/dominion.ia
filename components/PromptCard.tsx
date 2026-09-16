'use client';

import { useState } from 'react';
import { Copy, Check, Terminal, Heart, Film } from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';
import { YouTubeAutoplayEmbed } from './YouTubeAutoplayEmbed';
import { NativeVideoAutoplay } from './NativeVideoAutoplay';

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
      <div className={clsx(
        "relative overflow-hidden bg-surface-container-lowest select-none",
        isVideo ? "aspect-[9/16]" : "aspect-[16/10]"
      )}>
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
        
        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-black/20 pointer-events-none"></div>
        
        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-11 flex flex-wrap items-center gap-1.5 z-10 pointer-events-none">
          <span className={clsx(
            "px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold backdrop-blur-md",
            isVideo ? "bg-secondary/15 text-secondary" : "bg-primary-container/20 text-primary"
          )}>
            {item.tool?.name || 'Ferramenta'}
          </span>
          {item.engine?.name && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-tertiary/15 text-tertiary backdrop-blur-md">
              {item.engine.name}
            </span>
          )}
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-surface-container-highest/80 text-on-surface backdrop-blur-md">
            {item.niche?.name || 'Nicho'}
          </span>
        </div>

        <div className="absolute top-2 right-2 z-10">
          <button type="button" onClick={(e) => e.stopPropagation()} className="w-7 h-7 flex items-center justify-center rounded bg-surface-container-lowest/70 backdrop-blur-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
            <Heart size={14} />
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex flex-col p-4 flex-1 justify-between gap-3 bg-surface-container-low">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-on-surface truncate" title={item.title}>
            {item.title}
          </h3>
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
                ? "bg-secondary-container text-on-secondary-container shadow-[0_0_16px_rgba(0,166,224,0.4)]" 
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
