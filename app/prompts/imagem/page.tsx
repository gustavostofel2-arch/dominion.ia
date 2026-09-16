'use client';

import { Suspense } from 'react';
import { PromptCard } from '@/components/PromptCard';
import { usePromptLibrary } from '@/hooks/use-prompt-library';
import { Sparkles } from 'lucide-react';

function PromptsImagemContent() {
  const { items, niches, activeNiche, setActiveNiche, loading, hasMore, loadMore } = usePromptLibrary('image');

  return (
    <div className="flex flex-col w-full gap-8 max-w-7xl mx-auto">

      <div className="flex flex-col gap-2 max-w-2xl">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(255,95,216,0.9)]"></span>
          <span className="text-[10px] font-mono text-primary uppercase tracking-widest font-semibold">Repositório Neural</span>
        </div>
        <h1 className="text-3xl font-semibold text-on-surface tracking-tight">Prompts de Imagem</h1>
        <p className="text-on-surface-variant">Matriz curada de fórmulas sintéticas calibradas para Midjourney v6, Magnific AI, FLUX.1 e DALL-E 3 com consistência fotorealista.</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-surface-container-low/60 p-2 rounded-xl backdrop-blur-md border border-surface-container-highest/30">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 pr-4">
          <button
            onClick={() => setActiveNiche('all')}
            className={`shrink-0 px-4 py-1.5 rounded-full font-mono text-xs transition-all flex items-center gap-1.5 ${
              activeNiche === 'all'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(255,95,216,0.25)]'
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
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(255,95,216,0.25)]'
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
           <Sparkles className="animate-pulse mr-2" size={20} />
           Carregando prompts...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map(item => (
              <PromptCard key={item.id} item={item} />
            ))}
            {items.length === 0 && (
              <div className="col-span-full py-12 text-center text-on-surface-variant bg-surface-container-low rounded-xl border border-surface-container-high border-dashed">
                Nenhum prompt encontrado para este filtro.
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

export default function PromptsImagemPage() {
  return (
    <Suspense fallback={null}>
      <PromptsImagemContent />
    </Suspense>
  );
}
