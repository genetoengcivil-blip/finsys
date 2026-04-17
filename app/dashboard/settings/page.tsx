"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Settings, Globe, Eye, EyeOff, Save, Loader2, CheckCircle2, Moon, Sun, Monitor } from 'lucide-react';

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [configs, setConfigs] = useState({ currency: 'BRL', hide_balance: false, theme: 'light' });

  useEffect(() => {
    async function loadSettings() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase.from('settings').select('*').eq('id', user.id).single();
      if (data) {
        setConfigs({ 
          currency: data.currency || 'BRL', 
          hide_balance: data.hide_balance || false, 
          theme: data.theme || 'light' 
        });
      }
      setLoading(false);
    }
    loadSettings();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('settings').upsert({
      id: user?.id,
      currency: configs.currency,
      hide_balance: configs.hide_balance,
      theme: configs.theme,
      updated_at: new Date()
    });

    if (!error) {
      // Aplica o tema imediatamente
      if (configs.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      setMessage('Preferências salvas com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center p-20 dark:bg-slate-950"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-3">
        <Settings className="text-slate-900 dark:text-white" size={32} />
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Configurações</h2>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {message && (
          <div className="m-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-2 font-bold text-sm border border-emerald-100 dark:border-emerald-800">
            <CheckCircle2 size={18} /> {message}
          </div>
        )}

        <div className="p-8 space-y-10">
          {/* APARÊNCIA */}
          <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-2xl text-indigo-600 dark:text-indigo-400">
                {configs.theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
              </div>
              <div>
                <p className="font-black text-slate-900 dark:text-white">Aparência</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Escolha o tema do seu Finsys</p>
              </div>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
              <button 
                onClick={() => setConfigs({...configs, theme: 'light'})}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${configs.theme === 'light' ? 'bg-white dark:bg-slate-700 shadow-md text-blue-600' : 'text-slate-500'}`}
              >
                <Sun size={14} /> CLARO
              </button>
              <button 
                onClick={() => setConfigs({...configs, theme: 'dark'})}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${configs.theme === 'dark' ? 'bg-white dark:bg-slate-700 shadow-md text-blue-600' : 'text-slate-500'}`}
              >
                <Moon size={14} /> ESCURO
              </button>
            </div>
          </section>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* MOEDA */}
          <section className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl text-blue-600 dark:text-blue-400">
                <Globe size={24} />
              </div>
              <div>
                <p className="font-black text-slate-900 dark:text-white">Moeda</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Formatação de valores</p>
              </div>
            </div>
            <select 
              value={configs.currency} 
              onChange={e => setConfigs({...configs, currency: e.target.value})}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="BRL">Real (R$)</option>
              <option value="USD">Dólar (US$)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </section>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* PRIVACIDADE */}
          <section className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-rose-100 dark:bg-rose-900/30 p-3 rounded-2xl text-rose-600 dark:text-rose-400">
                {configs.hide_balance ? <EyeOff size={24} /> : <Eye size={24} />}
              </div>
              <div>
                <p className="font-black text-slate-900 dark:text-white">Modo Privacidade</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Esconder saldos no Dashboard</p>
              </div>
            </div>
            <button 
              onClick={() => setConfigs({...configs, hide_balance: !configs.hide_balance})}
              className={`w-14 h-8 rounded-full transition-all relative ${configs.hide_balance ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${configs.hide_balance ? 'left-7' : 'left-1'}`} />
            </button>
          </section>
        </div>

        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-3 bg-slate-900 dark:bg-blue-600 text-white font-black px-10 py-4 rounded-2xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-slate-200 dark:shadow-none"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Salvar Preferências
          </button>
        </div>
      </div>
    </div>
  );
}