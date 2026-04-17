"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { PiggyBank, Loader2, Plus, Trash2 } from 'lucide-react';

const CATEGORIAS = ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Assinaturas', 'Outros'];

export default function BudgetsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [spentData, setSpentData] = useState<Record<string, number>>({});
  
  const [newCategory, setNewCategory] = useState(CATEGORIAS[0]);
  const [newLimit, setNewLimit] = useState('');

  const loadData = async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Busca Orçamentos
    const { data: bData } = await supabase.from('budgets').select('*');
    
    // Busca Gastos do Mês
    const { data: tData } = await supabase.from('transactions')
      .select('category, amount')
      .eq('type', 'expense')
      .gte('date', startOfMonth);

    const spent: Record<string, number> = {};
    tData?.forEach(t => {
      spent[t.category] = (spent[t.category] || 0) + Number(t.amount);
    });

    setBudgets(bData || []);
    setSpentData(spent);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('budgets').upsert({
      user_id: user.id,
      category: newCategory,
      limit_amount: Number(newLimit)
    });
    
    setNewLimit('');
    loadData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('budgets').delete().eq('id', id);
    loadData();
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Controle de Orçamentos</h2>
        <p className="text-slate-500">Defina limites mensais para cada categoria.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleAddBudget} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-bold text-slate-700 mb-1">Categoria</label>
            <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-black font-bold outline-none">
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-bold text-slate-700 mb-1">Limite Mensal (R$)</label>
            <input type="number" required value={newLimit} onChange={e => setNewLimit(e.target.value)} placeholder="0,00" className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-black font-bold outline-none" />
          </div>
          <button type="submit" className="bg-slate-900 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors h-[46px]">
            Definir Orçamento
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((b) => {
          const spent = spentData[b.category] || 0;
          const limit = Number(b.limit_amount);
          const percent = Math.min((spent / limit) * 100, 100);
          const isOver = spent > limit;

          return (
            <div key={b.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">{b.category}</h3>
                <button onClick={() => handleDelete(b.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
              </div>
              
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className={isOver ? 'text-rose-600' : 'text-slate-500'}>Gasto: R$ {spent.toLocaleString('pt-BR')}</span>
                <span className="text-slate-900">Limite: R$ {limit.toLocaleString('pt-BR')}</span>
              </div>

              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full transition-all duration-500 ${isOver ? 'bg-rose-500' : percent > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
              <p className="text-xs font-bold text-slate-400">{percent.toFixed(1)}% do limite utilizado</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}