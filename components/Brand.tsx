import type { ReactNode } from 'react';

export const LOGO_URL = 'https://yhmteuxogzxdjevxlucv.supabase.co/storage/v1/object/public/flow/icon.png';

/** Dominion logo (replaces the old "D" letter). */
export function BrandMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <span
      className={`brand-mark relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_URL} alt="" width={size} height={size} className="h-full w-full object-cover" />
    </span>
  );
}

export function Brand({ subtitle = 'Banco de prompts' }: { subtitle?: string }) {
  return (
    <span className="flex items-center gap-3">
      <BrandMark />
      <span className="flex flex-col leading-tight">
        <span className="text-[17px] font-semibold tracking-tight text-on-surface">Dominion</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-outline">{subtitle}</span>
      </span>
    </span>
  );
}

/** App-window bar for cards: three dots + a mono address. */
export function WindowBar({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="winbar flex items-center justify-between gap-3 px-5 py-3">
      <span className="flex items-center gap-1.5" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
        <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
      </span>
      <span className="truncate font-mono text-[11px] text-outline">{title}</span>
      <span className="min-w-[30px] text-right">{right}</span>
    </div>
  );
}

export function AuthFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#070b16]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="font-semibold tracking-tight text-on-surface">Dominion Prompt</span>
        <span className="text-outline">Prompts validados para criar mais, em menos etapas.</span>
      </div>
    </footer>
  );
}
