"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart3, ArrowLeft, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Credenciais inválidas. Verifique seu e-mail e senha.");
      setIsLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para o início
        </Link>
        
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-600 p-3 rounded-xl mb-4">
              <BarChart3 className="text-white w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Bem-vindo de volta</h2>
            <p className="text-slate-500 text-sm mt-1">Acesse sua conta Finsys</p>
          </div>

          {error && (
            <div className="mb-4 p-4 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">E-mail</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com" 
                required
                className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 font-medium placeholder:text-slate-400 rounded-lg focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none transition-all"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">Senha</label>
                <Link href="#" className="text-sm text-blue-600 font-medium hover:underline">Esqueceu a senha?</Link>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                required
                className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 font-medium placeholder:text-slate-400 rounded-lg focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none transition-all"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-lg transition-colors mt-6 shadow-md shadow-blue-600/20"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar na Plataforma'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-slate-600">
            Ainda não tem uma conta? <Link href="/register" className="text-blue-600 font-bold hover:underline">Crie uma agora</Link>
          </p>
        </div>
      </div>
    </div>
  );
}