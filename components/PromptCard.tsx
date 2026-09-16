'use client';

import { useState } from 'react';
import { Copy, Check, Terminal, Heart, Play } from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';

export type PromptItem = {
  id: string;
  type: 'image' | 'video';
  title: string;
  prompt_text: string;
  media_url: string;
  tool: { name: string };
  niche: { name: string };
};

export function PromptCard({ item }: { item: PromptItem }) {
  const [copied, setCopied] = useState(false);
  const [playing, setPlaying] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.prompt_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isVideo = item.type === 'video';

  // Helper to extract YouTube ID if it's a video
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
  };

  const ytId = isVideo ? getYouTubeId(item.media_url) : null;

  return (
    <div className="group flex flex-col bg-surface-container-low rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-surface-container-highest/50 hover:border-primary/20">
      
      {/* Media Frame */}
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-container-lowest select-none">
        {isVideo && ytId ? (
          playing ? (
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&autoplay=1`}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full object-cover"
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="relative w-full h-full block"
              aria-label={`Reproduzir ${item.title}`}
            >
              <Image
                src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                alt={item.title}
                fill
                unoptimized
                loading="lazy"
                className="object-cover"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                <span className="w-14 h-14 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center text-on-surface shadow-lg">
                  <Play size={24} className="ml-1" fill="currentColor" />
                </span>
              </span>
            </button>
          )
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
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
          <span className={clsx(
            "px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold backdrop-blur-md",
            isVideo ? "bg-secondary/15 text-secondary" : "bg-primary-container/20 text-primary"
          )}>
            {item.tool?.name || 'Ferramenta'}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-surface-container-highest/80 text-on-surface backdrop-blur-md">
            {item.niche?.name || 'Nicho'}
          </span>
        </div>

        <div className="absolute top-2 right-2 z-10">
          <button type="button" className="w-7 h-7 flex items-center justify-center rounded bg-surface-container-lowest/70 backdrop-blur-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
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
