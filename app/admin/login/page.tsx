'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AuthFooter, Brand, WindowBar } from '@/components/Brand';

const supabase = createClient();

function PasswordField({
  label, value, onChange, show, onToggle, autoComplete,
}: {
  label: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void; autoComplete: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-outline">{label}</span>
      <div className="relative mt-2">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          autoComplete={autoComplete}
          className="field pr-14 font-mono"
          placeholder="••••••••••••"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </label>
  );
}

function AdminLoginForm() {
  const [mode, setMode] = useState<'login' | 'first'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPanel = () => {
    const requested = searchParams.get('next') || '/admin';
    router.push(requested.startsWith('/admin') ? requested : '/admin');
    router.refresh();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Credenciais inválidas.');
      setLoading(false);
      return;
    }

    goToPanel();
  };

  const handleFirstAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    const mail = email.trim().toLowerCase();
    const inviteCode = code.trim();

    if (password.length < 8) {
      setError('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não conferem.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data: valid } = await supabase.rpc('admin_code_valid', { p_email: mail, p_code: inviteCode });
      if (valid !== true) {
        setError('E-mail ou código de convite inválido. Peça um novo código a quem administra o sistema.');
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({ email: mail, password });
      if (signUpError) {
        setError(
          signUpError.message.toLowerCase().includes('already')
            ? 'Este e-mail já tem uma conta. Volte e entre com a senha.'
            : 'Não foi possível criar a conta: ' + signUpError.message
        );
        return;
      }
      if (!data.session) {
        setError('A conta foi criada, mas o Supabase exige confirmação de e-mail. Desative "Confirm email" em Authentication > Providers > Email.');
        return;
      }

      const { error: claimError } = await supabase.rpc('claim_admin', { p_code: inviteCode });
      if (claimError) {
        setError('Não foi possível validar o código de convite.');
        await supabase.auth.signOut();
        return;
      }

      goToPanel();
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: 'login' | 'first') => {
    setMode(next);
    setError(null);
    setPassword('');
    setConfirm('');
    setCode('');
  };

  const shownError = error || (mode === 'login' && searchParams.get('denied') ? 'Esta conta não tem permissão de administrador.' : null);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b border-white/10 bg-[#070b16]/55 backdrop-blur-md">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-5">
          <Brand subtitle="Área administrativa" />
          <span className="dk-pill hidden items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[11px] sm:inline-flex">
            <span className="dk-pulse" aria-hidden="true" />
            acesso restrito · senha obrigatória
          </span>
        </header>
      </div>

      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-10 sm:px-5">
        <section className="glass-strong w-full max-w-md overflow-hidden">
          <WindowBar title={mode === 'login' ? 'dominion · admin' : 'dominion · primeiro acesso admin'} />

          <div className="p-7 sm:p-9">
            <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.03em] text-on-surface">
              {mode === 'login' ? 'Painel administrativo' : 'Crie sua senha'}
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-on-surface-variant">
              {mode === 'login'
                ? 'Entre com seu e-mail de administrador e a senha.'
                : 'Use o código de convite que o administrador te passou.'}
            </p>

            <form onSubmit={mode === 'login' ? handleLogin : handleFirstAccess} className="mt-7 space-y-5">
              {shownError && (
                <p className="dk-alert-error rounded-xl px-4 py-3 text-sm">{shownError}</p>
              )}

              <label className="block">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-outline">E-mail administrativo</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="field mt-2"
                  placeholder="voce@email.com"
                />
              </label>

              {mode === 'first' && (
                <label className="block">
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-outline">Código de convite</span>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    autoComplete="off"
                    className="field mt-2 font-mono uppercase"
                    placeholder="XXXX-XXXX"
                  />
                </label>
              )}

              <PasswordField
                label={mode === 'login' ? 'Senha' : 'Crie uma senha'}
                value={password}
                onChange={setPassword}
                show={showPassword}
                onToggle={() => setShowPassword(s => !s)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />

              {mode === 'first' && (
                <PasswordField
                  label="Repita a senha"
                  value={confirm}
                  onChange={setConfirm}
                  show={showConfirm}
                  onToggle={() => setShowConfirm(s => !s)}
                  autoComplete="new-password"
                />
              )}

              <button type="submit" disabled={loading} className="btn-primary">
                <span>{loading ? 'Validando...' : mode === 'login' ? 'Entrar no painel' : 'Criar senha e entrar'}</span>
                <ArrowRight size={20} />
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'first' : 'login')}
                className="text-sm font-medium text-primary hover:underline"
              >
                {mode === 'login' ? 'Primeiro acesso de administrador? Criar minha senha' : 'Já tenho senha — voltar ao login'}
              </button>
            </div>

            <p className="dk-info mt-7 flex gap-3 rounded-2xl px-4 py-3.5 text-[13px] leading-relaxed">
              <Lock size={16} className="mt-0.5 shrink-0 text-tertiary" />
              Só contas autorizadas como administrador abrem este painel.
            </p>
          </div>
        </section>
      </main>

      <AuthFooter />
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
