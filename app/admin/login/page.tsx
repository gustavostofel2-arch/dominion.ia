'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Terminal, Lock, Mail, Eye, EyeOff, KeyRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

function PasswordField({
  label, value, onChange, show, onToggle, autoComplete,
}: {
  label: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void; autoComplete: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-mono text-outline uppercase tracking-wider">{label}</label>
      <div className="relative flex items-center bg-surface-container rounded-lg focus-within:ring-1 focus-within:ring-primary transition-all">
        <Lock size={16} className="absolute left-3 text-outline pointer-events-none" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          autoComplete={autoComplete}
          className="w-full bg-transparent py-2.5 pl-10 pr-10 text-sm text-on-surface placeholder:text-outline focus:outline-none font-mono"
          placeholder="••••••••••••"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
          className="absolute right-3 text-outline hover:text-on-surface transition-colors"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
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
    <div className="min-h-[80vh] flex items-center justify-center -mt-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-container/10 blur-[100px] pointer-events-none -z-10 rounded-full"></div>

      <div className="w-full max-w-md bg-surface-container-low rounded-2xl shadow-2xl p-8 border border-surface-container-highest/50">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-4 shadow-sm border border-surface-container-high">
            <Terminal size={24} />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-on-surface">Dominion</h1>
            <span className="text-[10px] font-mono bg-surface-container px-2 py-0.5 rounded text-primary uppercase tracking-wider">Prompt</span>
          </div>
          <p className="text-sm text-on-surface-variant mt-2">
            {mode === 'login' ? 'Acesso Administrativo Restrito' : 'Primeiro acesso: crie sua senha de administrador'}
          </p>
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : handleFirstAccess} className="flex flex-col gap-5">
          {shownError && (
            <div className="p-3 rounded bg-error-container/40 border border-error/20 text-error text-sm text-center">
              {shownError}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-outline uppercase tracking-wider">E-mail Administrativo</label>
            <div className="relative flex items-center bg-surface-container rounded-lg focus-within:ring-1 focus-within:ring-primary transition-all">
              <Mail size={16} className="absolute left-3 text-outline pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-transparent py-2.5 pl-10 pr-3 text-sm text-on-surface placeholder:text-outline focus:outline-none"
                placeholder="voce@email.com"
              />
            </div>
          </div>

          {mode === 'first' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-outline uppercase tracking-wider">Código de convite</label>
              <div className="relative flex items-center bg-surface-container rounded-lg focus-within:ring-1 focus-within:ring-primary transition-all">
                <KeyRound size={16} className="absolute left-3 text-outline pointer-events-none" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  autoComplete="off"
                  className="w-full bg-transparent py-2.5 pl-10 pr-3 text-sm text-on-surface placeholder:text-outline focus:outline-none font-mono uppercase"
                  placeholder="XXXX-XXXX"
                />
              </div>
            </div>
          )}

          <PasswordField
            label={mode === 'login' ? 'Senha de Acesso' : 'Crie uma senha'}
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

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3 rounded-lg bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Validando...' : mode === 'login' ? 'Entrar no Painel' : 'Criar senha e entrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => switchMode(mode === 'login' ? 'first' : 'login')}
            className="text-xs text-primary hover:underline"
          >
            {mode === 'login' ? 'Primeiro acesso de administrador? Criar minha senha' : 'Já tenho senha — voltar ao login'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-surface-container flex items-center justify-center gap-2 text-outline">
          <Lock size={14} />
          <span className="text-[10px] font-mono">TLS 1.3 • Encrypted Vault</span>
        </div>
      </div>
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
