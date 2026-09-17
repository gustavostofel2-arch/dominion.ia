'use client';

import { Suspense } from 'react';
import { PromptCard } from '@/components/PromptCard';
import { usePromptLibrary } from '@/hooks/use-prompt-library';
import { Film } from 'lucide-react';

function PromptsVideoContent() {
  const { items, niches, activeNiche, setActiveNiche, loading, hasMore, loadMore } = usePromptLibrary('video');

  return (
    <div className="flex flex-col w-full gap-8 max-w-7xl mx-auto">

      <div className="flex flex-col gap-2 max-w-2xl">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-secondary shadow-[0_0_10px_rgba(123,208,255,0.9)]"></span>
          <span className="text-[10px] font-mono text-secondary uppercase tracking-widest font-semibold">Motion Synthesis</span>
        </div>
        <h1 className="text-3xl font-semibold text-on-surface tracking-tight">Prompts de Vídeo</h1>
        <p className="text-on-surface-variant">Diretrizes cinemáticas para geração generativa. Controle dinâmico de trajetória de câmera e frame guidance.</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-surface-container-low/60 p-2 rounded-xl backdrop-blur-md border border-surface-container-highest/30">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 pr-4">
          <button
            onClick={() => setActiveNiche('all')}
            className={`shrink-0 px-4 py-1.5 rounded-full font-mono text-xs transition-all flex items-center gap-1.5 ${
              activeNiche === 'all'
                ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-[0_0_16px_rgba(0,166,224,0.25)]'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Todos
          </button>

          {niches.map(niche => (
            <button
              key={niche.id}
              onClick={() => setActiveNiche(niche.id)}
              className={`shrink-0 px-4 py-1.5 rounded-full font-mono text-xs transition-all flex items-center gap-1.5 ${
                activeNiche === niche.id
                  ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-[0_0_16px_rgba(0,166,224,0.25)]'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {niche.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading && items.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-on-surface-variant">
           <Film className="animate-pulse mr-2" size={20} />
           Carregando takes...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map(item => (
              <PromptCard key={item.id} item={item} />
            ))}
            {items.length === 0 && (
              <div className="col-span-full py-12 text-center text-on-surface-variant bg-surface-container-low rounded-xl border border-surface-container-high border-dashed">
                Nenhum vídeo encontrado para este filtro.
              </div>
            )}
          </div>
          {hasMore && items.length > 0 && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-surface-container-low border border-surface-container-highest/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-sm font-mono transition-colors disabled:opacity-50"
              >
                {loading ? 'Carregando...' : 'Carregar mais'}
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
}

export default function PromptsVideoPage() {
  return (
    <Suspense fallback={null}>
      <PromptsVideoContent />
    </Suspense>
  );
}
