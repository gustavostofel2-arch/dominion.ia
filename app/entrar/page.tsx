'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Film, Image as ImageIcon, Lock, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { setMemberSession } from '@/lib/member';
import { getYouTubeId } from '@/lib/media';
import { AuthFooter, Brand, WindowBar } from '@/components/Brand';

const supabase = createClient();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LoginRow = { member_name: string | null; member_role: string };

const TOOLS = ['Veo 3', 'Magnific', 'Kling 2.5', 'Google Flow', 'Omni Flash'];

type Preview = {
  id: string;
  type: 'image' | 'video';
  title: string;
  prompt_text: string;
  media_url: string;
  niche: { name: string } | null;
};

// Small frame of the media: image as-is, YouTube thumbnail, or the first frame
// of an uploaded video (metadata only, so it stays light).
function PreviewFrame({ item }: { item: Preview }) {
  const ytId = item.type === 'video' ? getYouTubeId(item.media_url) : null;
  return (
    <span className="relative block aspect-[9/16] w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black sm:w-24">
      {item.type === 'image' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.media_url} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : ytId ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <video src={`${item.media_url}#t=0.1`} muted playsInline preload="metadata" className="h-full w-full object-cover" />
      )}
      <span className="absolute bottom-1 left-1 rounded bg-[#0b1222]/85 p-1 text-on-surface">
        {item.type === 'video' ? <Film size={10} /> : <ImageIcon size={10} />}
      </span>
    </span>
  );
}

function PreviewCard({ item, late }: { item: Preview; late: boolean }) {
  return (
    <div className={`glass-strong overflow-hidden !rounded-[22px] ${late ? 'dk-float-late ml-8' : 'dk-float'}`}>
      <WindowBar
        title={`prompt · ${item.niche?.name?.toLowerCase() ?? 'validado'}`}
        right={<span className="dk-badge-ok rounded-full px-2 py-0.5 font-mono text-[10px]">validado</span>}
      />
      <div className="flex gap-4 p-4">
        <PreviewFrame item={item} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-on-surface">{item.title}</span>
          <span className="mt-2 line-clamp-4 font-mono text-[11px] leading-relaxed text-on-surface-variant">
            {item.prompt_text}
          </span>
        </span>
      </div>
    </div>
  );
}

function EntrarForm() {
  const searchParams = useSearchParams();
  const [previews, setPreviews] = useState<Preview[]>([]);

  // Latest prompts (public read) so the login screen shows what is inside.
  useEffect(() => {
    void (async () => {
      try {
        const { data } = await supabase
          .from('items')
          .select('id, type, title, prompt_text, media_url, niche:niches(name)')
          .order('created_at', { ascending: false })
          .limit(2);
        setPreviews((data as unknown as Preview[] | null) ?? []);
      } catch (error) {
        console.error('Falha ao carregar prévias:', error);
      }
    })();
  }, []);

  const [step, setStep] = useState<'email' | 'name'>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finish = (session: { email: string; name: string; role: 'user' | 'admin' }) => {
    setMemberSession(session);
    const requested = searchParams.get('next') || '/';
    window.location.assign(requested.startsWith('/') && !requested.startsWith('//') ? requested : '/');
  };

  const login = async (value: string): Promise<LoginRow | null> => {
    const { data, error: rpcError } = await supabase.rpc('member_login', { p_email: value });
    if (rpcError) {
      if (rpcError.message.includes('not registered')) {
        setError('Este e-mail não tem acesso. Peça ao administrador para cadastrá-lo.');
      } else {
        console.error('Falha no login:', rpcError.message);
        setError('Não foi possível verificar o e-mail agora. Tente novamente em instantes.');
      }
      return null;
    }
    return (data as LoginRow[] | null)?.[0] ?? null;
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(value)) {
      setError('Digite um e-mail válido.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const row = await login(value);
      if (!row) return;
      const memberRole = row.member_role === 'admin' ? 'admin' : 'user';
      if (!row.member_name) {
        setEmail(value);
        setRole(memberRole);
        setStep('name');
        return;
      }
      finish({ email: value, name: row.member_name, role: memberRole });
    } finally {
      setLoading(false);
    }
  };

  const handleName = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = name.trim().replace(/\s+/g, ' ');
    if (value.length < 3 || !value.includes(' ')) {
      setError('Digite seu nome e sobrenome.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: rpcError } = await supabase.rpc('member_set_name', { p_email: email, p_name: value });
      if (rpcError) {
        console.error('Falha ao salvar nome:', rpcError.message);
        setError('Não foi possível salvar seu nome. Tente novamente.');
        return;
      }
      finish({ email, name: value, role });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b border-white/10 bg-[#070b16]/55 backdrop-blur-md">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-5">
          <Brand />
          <span className="dk-pill hidden items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[11px] sm:inline-flex">
            <span className="dk-pulse" aria-hidden="true" />
            acesso por e-mail
          </span>
        </header>
      </div>

      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-[minmax(0,1fr)] items-center gap-10 px-4 py-10 sm:px-5 min-[960px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] min-[960px]:gap-16 min-[960px]:py-14">
        {/* Apresentação + prévia real dos prompts (no celular fica depois do formulário) */}
        <section className="order-2 min-[960px]:order-1">
          <p className="eyebrow">Arsenal de prompts</p>
          <h1 className="mt-5 text-[52px] font-semibold leading-[0.92] tracking-[-0.05em] text-on-surface sm:text-[76px]">
            <span className="block">Banco de</span>
            <span className="block">prompts</span>
            <span className="dk-crie block w-fit" data-text="validados.">validados.</span>
          </h1>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-on-surface-variant">
            Prompts testados e aprovados para gerar vídeos e imagens verticais. Veja a prévia, copie e use no Veo 3, Magnific, Kling e Google Flow.
          </p>

          <div className="mt-6 flex max-w-md flex-wrap gap-2">
            {TOOLS.map(tool => (
              <span key={tool} className="dk-pill rounded-full px-3 py-1 font-mono text-[11px]">{tool}</span>
            ))}
          </div>

          {previews.length > 0 && (
            <div className="mt-10 max-w-md space-y-3" aria-hidden="true">
              <p className="eyebrow">Prévia do que tem lá dentro</p>
              {previews.map((item, i) => (
                <PreviewCard key={item.id} item={item} late={i % 2 === 1} />
              ))}
            </div>
          )}
        </section>

        {/* Formulário */}
        <section className="glass-strong order-1 mx-auto w-full max-w-md overflow-hidden min-[960px]:order-2 min-[960px]:ml-auto min-[960px]:mr-0">
          <WindowBar title={step === 'email' ? 'dominion · entrar' : 'dominion · primeiro acesso'} />

          <div className="p-7 sm:p-9">
            <h2 className="text-[30px] font-semibold leading-tight tracking-[-0.03em] text-on-surface">
              {step === 'email' ? 'Acesse o arsenal' : 'Como você se chama?'}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-on-surface-variant">
              {step === 'email'
                ? 'Entre com o e-mail que o administrador cadastrou para você.'
                : 'É o seu primeiro acesso. Informe nome e sobrenome.'}
            </p>

            {error && (
              <p className="dk-alert-error mt-6 rounded-xl px-4 py-3 text-sm">{error}</p>
            )}

            {step === 'email' ? (
              <form onSubmit={handleEmail} className="mt-7 space-y-5" noValidate>
                <label className="block">
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-outline">Seu e-mail</span>
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="field mt-2"
                    placeholder="voce@email.com"
                  />
                </label>
                <button type="submit" disabled={loading} className="btn-primary">
                  <span>{loading ? 'Aguarde...' : 'Entrar'}</span>
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
                </button>
              </form>
            ) : (
              <form onSubmit={handleName} className="mt-7 space-y-5" noValidate>
                <label className="block">
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-outline">Nome e sobrenome</span>
                  <input
                    type="text"
                    autoComplete="name"
                    autoFocus
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="field mt-2"
                    placeholder="Maria Silva"
                  />
                  <span className="mt-2 block text-xs text-outline">{email}</span>
                </label>
                <button type="submit" disabled={loading} className="btn-primary">
                  <span>{loading ? 'Aguarde...' : 'Continuar'}</span>
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
                </button>
              </form>
            )}

            <p className="dk-info mt-7 flex gap-3 rounded-2xl px-4 py-3.5 text-[13px] leading-relaxed">
              <Lock size={16} className="mt-0.5 shrink-0 text-tertiary" />
              O acesso é liberado pelo administrador. Se o seu e-mail não funcionar, peça para cadastrá-lo.
            </p>
          </div>
        </section>
      </main>

      <AuthFooter />
    </div>
  );
}

export default function EntrarPage() {
  return (
    <Suspense fallback={null}>
      <EntrarForm />
    </Suspense>
  );
}
