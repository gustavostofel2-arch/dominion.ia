'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Play } from 'lucide-react';
import clsx from 'clsx';

export function NativeVideoAutoplay({ src, title, interactive = true }: { src: string; title: string; interactive?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const autoPlayedRef = useRef(false);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    const video = videoRef.current;
    if (!el || !video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Autoplay once, the first time the card scrolls into view.
          if (!autoPlayedRef.current) {
            autoPlayedRef.current = true;
            video.muted = true;
            video.play().catch(() => {});
          }
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      if (video.ended) video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted(m => !m);
  };

  return (
    <div
      ref={containerRef}
      onClick={interactive ? togglePlay : undefined}
      className={clsx("relative w-full h-full bg-black", interactive && "cursor-pointer")}
    >
      {/* preload="metadata" + #t shows the first frame without downloading the whole file until it plays */}
      <video
        ref={videoRef}
        src={`${src}#t=0.1`}
        title={title}
        muted
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="w-full h-full object-cover"
      />

      {interactive && !playing && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
          <span className="w-14 h-14 rounded-full bg-[#0b1222]/85 backdrop-blur-md flex items-center justify-center text-primary shadow-lg">
            <Play size={24} className="ml-0.5" fill="currentColor" />
          </span>
        </span>
      )}

      {interactive && (
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? 'Ativar som' : 'Silenciar'}
          className="absolute bottom-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-[#0b1222]/85 backdrop-blur-md text-on-surface hover:bg-surface-container-high transition-colors"
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      )}
    </div>
  );
}
