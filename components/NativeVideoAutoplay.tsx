'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Play } from 'lucide-react';
import clsx from 'clsx';

export function NativeVideoAutoplay({ src, title, interactive = true }: { src: string; title: string; interactive?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (inView && !paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [inView, paused]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted(m => !m);
  };

  const togglePlay = () => {
    if (!interactive) return;
    setPaused(p => !p);
  };

  return (
    <div ref={containerRef} onClick={togglePlay} className={clsx("relative w-full h-full bg-black", interactive && "cursor-pointer")}>
      {inView && (
        <video
          ref={videoRef}
          src={src}
          title={title}
          muted={muted}
          loop
          playsInline
          autoPlay
          preload="metadata"
          className="w-full h-full object-cover"
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
