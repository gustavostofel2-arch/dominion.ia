'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, User, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { setMemberSession } from '@/lib/member';

const supabase = createClient();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LoginRow = { member_name: string | null; member_role: string };

function EntrarForm() {
  const searchParams = useSearchParams();
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
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 blur-[100px] pointer-events-none -z-10 rounded-full"></div>

      <div className="w-full max-w-md bg-surface-container-low rounded-2xl shadow-2xl p-8 border border-surface-container-highest/50">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center text-primary mb-4 shadow-sm font-bold text-2xl">
            D
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">Dominion Prompt</h1>
          <p className="text-sm text-on-surface-variant mt-2">
            {step === 'email'
              ? 'Digite seu e-mail para acessar a biblioteca de prompts.'
              : 'Primeiro acesso! Como você se chama?'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded bg-error-container/40 border border-error/20 text-error text-sm text-center">
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleEmail} className="flex flex-col gap-5" noValidate>
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
        ) : (
          <form onSubmit={handleName} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-[10px] font-mono text-outline uppercase tracking-wider">Nome e sobrenome</label>
              <div className="relative flex items-center bg-surface-container rounded-lg focus-within:ring-1 focus-within:ring-primary transition-all">
                <User size={16} className="absolute left-3 text-outline pointer-events-none" />
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  autoFocus
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent py-3 pl-10 pr-3 text-sm text-on-surface placeholder:text-outline focus:outline-none"
                  placeholder="Maria Silva"
                />
              </div>
              <p className="text-[11px] text-on-surface-variant">{email}</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-primary-container hover:opacity-90 text-on-primary-container font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <>Continuar <ArrowRight size={16} /></>}
            </button>
          </form>
        )}
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
