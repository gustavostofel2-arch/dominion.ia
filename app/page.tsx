import Link from 'next/link';
import { Sparkles, Image as ImageIcon, Film } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      {/* Hero Section */}
      <section className="relative w-full rounded-2xl bg-surface-container-low p-8 md:p-12 overflow-hidden shadow-xl border border-surface-container-highest/30">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-4 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-1 rounded bg-primary-container/20 text-primary uppercase tracking-wider border border-primary/20">
              Dominion Vault
            </span>
            <span className="text-xs font-mono text-outline flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              Sincronizado
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-on-surface">
            Biblioteca Master de Prompts
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
            Engenharia reversa e receitas de prompts testadas para Magnific AI, VO3, Midjourney e Runway. Copie com um clique e produza visuais de nível internacional.
          </p>
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
                Prompts calibrados para Midjourney v6, Magnific AI e DALL·E 3. De retratos editoriais hiper-realistas a produtos de luxo.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-surface-container text-on-surface">Midjourney v6</span>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-surface-container text-on-surface">Magnific AI</span>
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
                Parâmetros de movimento, prompts cinemáticos e frame guidance para VO3, Sora e Runway Gen-3 com controle de câmera.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-surface-container text-on-surface">VO3 Video</span>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-surface-container text-on-surface">Runway Gen-3</span>
            </div>
          </div>
        </Link>
      </section>

      {/* Mini Tip section */}
      <section className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-xl bg-surface-container-low gap-4 border border-surface-container-highest/30">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary shrink-0">
            <Sparkles size={20} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-secondary uppercase font-semibold">Dica da Mentoria Semanal</span>
            </div>
            <p className="text-sm text-on-surface-variant mt-1">
              Sempre estruture: <code className="text-primary font-mono bg-surface-container px-1 rounded">[Sujeito]</code> + <code className="text-secondary font-mono bg-surface-container px-1 rounded">[Iluminação]</code> + <code className="text-tertiary font-mono bg-surface-container px-1 rounded">[Câmera]</code> + <code className="text-on-surface font-mono bg-surface-container px-1 rounded">[Motor]</code>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
