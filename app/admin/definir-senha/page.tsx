'use client';

import { useEffect, useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export default function DefinirSenhaPage() {
  const [status, setStatus] = useState<'checking' | 'ready' | 'invalid'>('checking');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The e-mailed link signs the person in (proving they own the inbox); wait
  // for the client to finish exchanging the code in the URL before checking.
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      for (let i = 0; i < 8; i++) {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          if (!cancelled) {
            setEmail(data.user.email ?? '');
            setStatus('ready');
          }
          return;
        }
        await new Promise(r => setTimeout(r, 400));
      }
      if (!cancelled) setStatus('invalid');
    };
    void check();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError('Não foi possível salvar a senha: ' + updateError.message);
        return;
      }
      const { error: claimError } = await supabase.rpc('claim_admin');
      if (claimError) {
        setError('Senha criada, mas este e-mail não está marcado como administrador. Peça a quem administra o sistema.');
        return;
      }
      window.location.assign('/admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center -mt-10">
      <div className="w-full max-w-md bg-surface-container-low rounded-2xl shadow-2xl p-8 border border-surface-container-highest/50">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center text-primary mb-4 font-bold text-2xl">D</div>
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">Criar senha de administrador</h1>
          {status === 'ready' && <p className="text-sm text-on-surface-variant mt-2">{email}</p>}
        </div>

        {status === 'checking' && (
          <div className="flex justify-center py-6 text-on-surface-variant"><Loader2 className="animate-spin" /></div>
        )}

        {status === 'invalid' && (
          <div className="text-center text-sm text-on-surface-variant flex flex-col gap-3">
            <p>Link inválido ou expirado.</p>
            <a href="/admin/login" className="text-primary hover:underline">Voltar ao login e pedir um novo link</a>
          </div>
        )}

        {status === 'ready' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="p-3 rounded bg-error-container/40 border border-error/20 text-error text-sm text-center">{error}</div>
            )}
            {[
              { label: 'Nova senha', value: password, set: setPassword },
              { label: 'Repita a senha', value: confirm, set: setConfirm },
            ].map(field => (
              <div key={field.label} className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-outline uppercase tracking-wider">{field.label}</label>
                <div className="relative flex items-center bg-surface-container rounded-lg focus-within:ring-1 focus-within:ring-primary transition-all">
                  <Lock size={16} className="absolute left-3 text-outline pointer-events-none" />
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={field.value}
                    onChange={(e) => field.set(e.target.value)}
                    className="w-full bg-transparent py-2.5 pl-10 pr-3 text-sm text-on-surface focus:outline-none"
                  />
                </div>
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 rounded-lg bg-primary-container hover:opacity-90 text-on-primary-container font-semibold transition-all disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar senha e entrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
