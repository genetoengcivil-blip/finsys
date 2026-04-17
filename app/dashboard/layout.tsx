"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  ListOrdered, 
  PiggyBank, 
  LogOut, 
  BarChart3, 
  Target, 
  FileText, 
  PieChart, 
  CalendarDays, 
  Repeat,
  HeartPulse,
  User
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import AddTransactionModal from '@/components/AddTransactionModal';
import NotificationBell from '@/components/NotificationBell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const supabase = createClient();
  
  const [userData, setUserData] = useState({ 
    name: 'Usuário', 
    avatar: '',
    initials: 'US'
  });

  // Função para buscar dados do perfil
  const loadUserContent = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      const name = profile?.full_name || user.email?.split('@')[0] || 'Usuário';
      
      setUserData({
        name: name,
        // Adicionamos um timestamp (?t=) para forçar o navegador a ignorar o cache da imagem antiga
        avatar: profile?.avatar_url ? `${profile.avatar_url}?t=${new Date().getTime()}` : '',
        initials: name.substring(0, 2).toUpperCase()
      });
    }
  }, [supabase]);

  useEffect(() => {
    loadUserContent();

    // SISTEMA REALTIME: Escuta mudanças na tabela 'profiles' e atualiza o layout na hora
    const channel = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        () => {
          loadUserContent();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadUserContent, supabase]);

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col print:hidden">
        <div className="p-6 flex items-center gap-2 border-b border-slate-100">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <BarChart3 className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight font-black">Finsys</span>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
          <nav className="space-y-1">
            <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Dashboard</p>
            <Link 
              href="/dashboard" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-colors ${
                isActive('/dashboard') ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Home className="w-5 h-5" /> Visão Geral
            </Link>
            <Link 
              href="/dashboard/health" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                isActive('/dashboard/health') ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <HeartPulse className="w-5 h-5 text-rose-500" /> Saúde Financeira
            </Link>
          </nav>

          <nav className="space-y-1">
            <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Gestão Financeira</p>
            <Link href="/dashboard/transactions" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${isActive('/dashboard/transactions') ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}>
              <ListOrdered className="w-5 h-5" /> Transações
            </Link>
            <Link href="/dashboard/agenda" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${isActive('/dashboard/agenda') ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}>
              <CalendarDays className="w-5 h-5" /> Agenda
            </Link>
            <Link href="/dashboard/recurring" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${isActive('/dashboard/recurring') ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Repeat className="w-5 h-5" /> Recorrências
            </Link>
            <Link href="/dashboard/budgets" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${isActive('/dashboard/budgets') ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}>
              <PiggyBank className="w-5 h-5" /> Orçamentos
            </Link>
            <Link href="/dashboard/goals" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${isActive('/dashboard/goals') ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Target className="w-5 h-5" /> Metas
            </Link>
          </nav>

          <nav className="space-y-1">
            <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ajustes e Análises</p>
            <Link href="/dashboard/reports" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${isActive('/dashboard/reports') ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}>
              <PieChart className="w-5 h-5" /> Relatórios
            </Link>
            <Link href="/dashboard/profile" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${isActive('/dashboard/profile') ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}>
              <User className="w-5 h-5" /> Meu Perfil
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 w-full text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg font-bold transition-colors">
            <LogOut className="w-5 h-5" /> Sair
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10 print:hidden">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Workspace</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gestão Financeira Inteligente</p>
          </div>
          
          <div className="flex items-center gap-5">
            <AddTransactionModal /> 
            
            <div className="flex items-center gap-3 border-l border-slate-200 pl-5">
              <NotificationBell />
              
              <Link href="/dashboard/profile" className="flex items-center gap-3 hover:bg-slate-50 p-1 rounded-xl transition-all">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-slate-900 leading-none">{userData.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Ver Perfil</p>
                </div>
                
                {userData.avatar ? (
                  <img 
                    src={userData.avatar} 
                    alt="Perfil" 
                    key={userData.avatar} // Força o React a re-renderizar a imagem se a URL mudar
                    className="w-10 h-10 rounded-full border-2 border-slate-100 object-cover shadow-sm" 
                  />
                ) : (
                  <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-black">
                    {userData.initials}
                  </div>
                )}
              </Link>
            </div>
          </div>
        </header>
        
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}