"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  HeartPulse, PiggyBank, ShieldCheck, AlertCircle, 
  TrendingUp, Plus, Trash2, Loader2, Info, CheckCircle2,
  ArrowRightCircle, X
} from 'lucide-react';

export default function HealthPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [vaults, setVaults] = useState<any[]>([]);
  const [stats, setStats] = useState({
    savingsRate: 0,
    emergencyFundMonths: 0,
    fixedCostRatio: 0,
    totalInVaults: 0
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: txs } = await supabase.from('transactions').select('*');
    const { data: recurring } = await supabase.from('recurring_transactions').select('*');
    const { data: vts } = await supabase.from('vaults').select('*');

    if (!txs || !recurring || !vts) { setLoading(false); return; }

    const now = new Date();
    const currentMonth = now.getMonth();
    
    let monthIncome = 0;
    let monthExpense = 0;
    txs.forEach(tx => {
      const d = new Date(tx.date);
      if (d.getUTCMonth() === currentMonth) {
        if (tx.type === 'income') monthIncome += Number(tx.amount);
        else monthExpense += Number(tx.amount);
      }
    });

    const savings = monthIncome - monthExpense;
    const savingsRate = monthIncome > 0 ? (savings / monthIncome) * 100 : 0;
    const totalBalance = txs.reduce((acc, tx) => acc + (tx.type === 'income' ? Number(tx.amount) : -Number(tx.amount)), 0);
    const avgExpense = monthExpense || 1;
    const monthsCovered = totalBalance / avgExpense;
    const fixedCosts = recurring.reduce((acc, curr) => curr.type === 'expense' ? acc + Number(curr.amount) : acc, 0);
    const fixedRatio = monthIncome > 0 ? (fixedCosts / monthIncome) * 100 : 0;

    setStats({
      savingsRate: Math.max(0, savingsRate),
      emergencyFundMonths: Math.max(0, monthsCovered),
      fixedCostRatio: fixedRatio,
      totalInVaults: vts.reduce((acc, v) => acc + Number(v.current_amount), 0)
    });
    setVaults(vts);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleUpdateVault = async (id: string, current: number, add: string) => {
    const val = parseFloat(add);
    if (isNaN(val)) return;
    await supabase.from('vaults').update({ current_amount: current + val }).eq('id', id);
    loadData();
  };

  const handleAddVault = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('vaults').insert({
      user_id: user?.id, name, target_amount: parseFloat(target), current_amount: 0
    });
    setName(''); setTarget(''); setIsModalOpen(false);
    loadData();
  };

  const getStatus = (val: number, type: 'savings' | 'emergency' | 'fixed') => {
    if (type === 'savings') return val >= 20 ? { l: 'Excelente', c: 'text-emerald-600' } : val >= 10 ? { l: 'Pode melhorar', c: 'text-blue-600' } : { l: 'Atenção', c: 'text-rose-600' };
    if (type === 'emergency') return val >= 6 ? { l: 'Muito Seguro', c: 'text-emerald-600' } : val >= 3 ? { l: 'No caminho', c: 'text-blue-600' } : { l: 'Perigo', c: 'text-rose-600' };
    return val <= 35 ? { l: 'Vida Leve', c: 'text-emerald-600' } : val <= 50 ? { l: 'Equilibrado', c: 'text-amber-600' } : { l: 'Sobrecarga', c: 'text-rose-600' };
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <HeartPulse className="text-rose-600" /> Saúde Financeira
          </h2>
          <p className="text-slate-500 font-bold mt-1">Entenda o que seus números dizem sobre o seu futuro.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white font-black px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
          <Plus size={20} /> Criar Novo Cofre
        </button>
      </div>

      {/* RAIO-X INDICADORES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HealthCard 
          icon={<TrendingUp className="text-emerald-600" />}
          title="O quanto sobra?"
          value={`${stats.savingsRate.toFixed(1)}%`}
          status={getStatus(stats.savingsRate, 'savings')}
          desc="Do total que você ganha, esse é o percentual que você consegue guardar para investir."
        />
        <HealthCard 
          icon={<ShieldCheck className="text-blue-600" />}
          title="Fôlego (Sobrevivência)"
          value={`${stats.emergencyFundMonths.toFixed(1)} meses`}
          status={getStatus(stats.emergencyFundMonths, 'emergency')}
          desc="Tempo que você vive pagando todas as contas se ficar sem renda hoje."
        />
        <HealthCard 
          icon={<AlertCircle className="text-indigo-600" />}
          title="Peso das Contas Fixas"
          value={`${stats.fixedCostRatio.toFixed(1)}%`}
          status={getStatus(stats.fixedCostRatio, 'fixed')}
          desc="Percentual da sua renda que já vai direto para aluguel, internet e contas recorrentes."
        />
      </div>

      {/* COFRES ESTRATÉGICOS */}
      <div className="space-y-6">
        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <PiggyBank className="text-indigo-600" /> Meus Cofres (Reservas)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vaults.map(v => {
            const progress = Math.min(100, (v.current_amount / v.target_amount) * 100);
            return (
              <div key={v.id} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-black text-slate-900 text-xl">{v.name}</h4>
                    <p className="text-sm font-bold text-slate-400">Objetivo: R$ {Number(v.target_amount).toLocaleString('pt-BR')}</p>
                  </div>
                  <button onClick={async () => { if(confirm("Apagar cofre?")) { await supabase.from('vaults').delete().eq('id', v.id); loadData(); } }} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
                </div>

                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden mb-6 border border-slate-200">
                  <div className="h-full bg-blue-600 transition-all duration-700" style={{ width: `${progress}%` }}></div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl mb-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Já guardado neste cofre:</p>
                  <p className="text-3xl font-black text-slate-900">R$ {Number(v.current_amount).toLocaleString('pt-BR')}</p>
                  <p className="text-xs font-bold text-blue-600 mt-1">{progress.toFixed(0)}% concluído</p>
                </div>

                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder="Quanto guardar?" 
                    id={`input-${v.id}`}
                    className="flex-1 bg-white border-2 border-slate-100 rounded-xl px-4 py-2 font-bold text-black outline-none focus:border-blue-600 transition-all" 
                  />
                  <button 
                    onClick={() => {
                      const input = document.getElementById(`input-${v.id}`) as HTMLInputElement;
                      handleUpdateVault(v.id, Number(v.current_amount), input.value);
                      input.value = '';
                    }}
                    className="bg-slate-900 text-white px-4 rounded-xl hover:bg-blue-600 transition-all font-black text-xs"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900">Novo Cofre</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-xl"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddVault} className="space-y-4">
              <input type="text" placeholder="Ex: Viagem de Férias" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-black font-bold outline-none focus:border-blue-600" />
              <input type="number" placeholder="Valor da Meta R$" required value={target} onChange={e => setTarget(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-black font-bold outline-none focus:border-blue-600" />
              <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all">Ativar Cofre</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function HealthCard({ icon, title, value, status, desc }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
        <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider">{title}</h4>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <h5 className="text-3xl font-black text-slate-900">{value}</h5>
        <span className={`text-xs font-black uppercase ${status.c}`}>{status.l}</span>
      </div>
      <p className="text-xs font-bold text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}