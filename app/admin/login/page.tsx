'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Terminal, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // For demo purposes, we can bypass strict auth if Supabase isn't configured, 
    // but here is the real implementation:
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
       // Mock fallback for prototype testing if Supabase is not fully set up
       if (email === 'admin@dominion.com' && password === 'admin') {
          router.push('/admin');
       } else {
          setError('Credenciais inválidas ou Supabase não configurado. (Dica: admin@dominion.com / admin)');
          setLoading(false);
       }
    } else {
      router.push('/admin');
    }
  };

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
          <p className="text-sm text-on-surface-variant mt-2">Acesso Administrativo Restrito</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {error && (
            <div className="p-3 rounded bg-error-container/20 border border-error/20 text-error text-sm text-center">
              {error}
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
                className="w-full bg-transparent py-2.5 pl-10 pr-3 text-sm text-on-surface placeholder:text-outline focus:outline-none"
                placeholder="operador@dominion.internal"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono text-outline uppercase tracking-wider">Senha de Acesso</label>
            </div>
            <div className="relative flex items-center bg-surface-container rounded-lg focus-within:ring-1 focus-within:ring-primary transition-all">
              <Lock size={16} className="absolute left-3 text-outline pointer-events-none" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent py-2.5 pl-10 pr-10 text-sm text-on-surface placeholder:text-outline focus:outline-none font-mono"
                placeholder="••••••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-outline hover:text-on-surface transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="mt-4 w-full py-3 rounded-lg bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Validando...' : 'Entrar no Painel'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-surface-container flex items-center justify-center gap-2 text-outline">
          <Lock size={14} />
          <span className="text-[10px] font-mono">TLS 1.3 • Encrypted Vault</span>
        </div>
      </div>
    </div>
  );
}
