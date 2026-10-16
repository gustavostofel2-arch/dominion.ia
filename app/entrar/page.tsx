'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { setMemberCookie } from '@/lib/member';

const supabase = createClient();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function EntrarForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(value)) {
      setError('Digite um e-mail válido.');
      return;
    }

    setLoading(true);
    setError(null);

    // Registering the e-mail is best-effort: a failure here must not lock
    // members out of the library.
    try {
      const { error: rpcError } = await supabase.rpc('register_member', { member_email: value });
      if (rpcError) console.error('Falha ao registrar membro:', rpcError.message);
    } catch (err) {
      console.error('Falha ao registrar membro:', err);
    }

    setMemberCookie(value);
    const requested = searchParams.get('next') || '/';
    const next = requested.startsWith('/') && !requested.startsWith('//') ? requested : '/';
    window.location.assign(next);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 blur-[100px] pointer-events-none -z-10 rounded-full"></div>

      <div className="w-full max-w-md bg-surface-container-low rounded-2xl shadow-2xl p-8 border border-surface-container-highest/50">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center text-primary mb-4 shadow-sm font-bold text-2xl">
            D
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">Dominion Prompt</h1>
          <p className="text-sm text-on-surface-variant mt-2">Digite seu e-mail para acessar a biblioteca de prompts.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          {error && (
            <div className="p-3 rounded bg-error-container/40 border border-error/20 text-error text-sm text-center">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[10px] font-mono text-outline uppercase tracking-wider">Seu e-mail</label>
            <div className="relative flex items-center bg-surface-container rounded-lg focus-within:ring-1 focus-within:ring-primary transition-all">
              <Mail size={16} className="absolute left-3 text-outline pointer-events-none" />
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent py-3 pl-10 pr-3 text-sm text-on-surface placeholder:text-outline focus:outline-none"
                placeholder="voce@email.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary-container hover:opacity-90 text-on-primary-container font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <>Entrar <ArrowRight size={16} /></>}
          </button>
        </form>
      </div>
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
