"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart3, ArrowLeft, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para o início
        </Link>
        
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex flex-col items-center mb-8">
            <BarChart3 className="text-blue-600 w-10 h-10 mb-3" />
            <h2 className="text-2xl font-bold text-slate-900">Crie sua conta</h2>
            <p className="text-slate-500 text-sm mt-1">Comece seu teste gratuito de 14 dias</p>
          </div>

          {error && (
            <div className="mb-4 p-4 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome completo</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João Silva" 
                required
                className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 font-medium placeholder:text-slate-400 rounded-lg focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none transition-all"
              />
            </div>
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
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Senha</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres" 
                required
                minLength={6}
                className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 font-medium placeholder:text-slate-400 rounded-lg focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none transition-all"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex justify-center items-center bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white font-bold py-3.5 rounded-lg transition-colors mt-6 shadow-md"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar Minha Conta'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-slate-600">
            Já tem uma conta? <Link href="/login" className="text-blue-600 font-bold hover:underline">Faça login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}