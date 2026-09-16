'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Play } from 'lucide-react';
import Image from 'next/image';
import clsx from 'clsx';

export function YouTubeAutoplayEmbed({ videoId, title, interactive = true }: { videoId: string; title: string; interactive?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [inView, setInView] = useState(false);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const postCommand = (func: string) => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*');
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    postCommand(muted ? 'unMute' : 'mute');
    setMuted(m => !m);
  };

  const togglePlay = () => {
    postCommand(paused ? 'playVideo' : 'pauseVideo');
    setPaused(p => !p);
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&iv_load_policy=3&fs=0&disablekb=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(origin)}`;

  return (
    <div
      ref={containerRef}
      onClick={interactive ? togglePlay : undefined}
      className={clsx("relative w-full h-full", interactive && "cursor-pointer")}
    >
      {inView ? (
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          className="w-full h-full"
        />
      ) : (
        <Image
          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
          alt={title}
          fill
          unoptimized
          loading="lazy"
          className="object-cover"
        />
      )}

      {interactive && paused && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <span className="w-12 h-12 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center text-on-surface shadow-lg">
            <Play size={20} className="ml-0.5" fill="currentColor" />
          </span>
        </span>
      )}

      {interactive && (
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? 'Ativar som' : 'Silenciar'}
          className="absolute bottom-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-lowest/70 backdrop-blur-md text-on-surface hover:bg-surface-container-high transition-colors"
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      )}
    </div>
  );
}
