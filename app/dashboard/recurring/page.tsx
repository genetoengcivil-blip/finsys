"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Loader2, Trash2, CalendarClock } from 'lucide-react';

const CATEGORIAS_DESPESA = ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Assinaturas', 'Outros Gastos'];
const CATEGORIAS_RECEITA = ['Salário', 'Freelance', 'Vendas', 'Rendimentos', 'Outras Receitas'];

export default function RecurringPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [day, setDay] = useState('1');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState(CATEGORIAS_DESPESA[0]);

  const fetchItems = async () => {
    const { data } = await supabase.from('recurring_transactions').select('*').order('day_of_month', { ascending: true });
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const numericAmount = parseFloat(amount.replace(',', '.'));
    
    // PEGANDO O MÊS E ANO ATUAL PARA TRAVAR A REPETIÇÃO IMEDIATA
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const { error } = await supabase.from('recurring_transactions').insert({
      user_id: user.id,
      description: title,
      amount: numericAmount,
      type,
      category,
      day_of_month: parseInt(day),
      // TRAVA: Marcamos que este mês já está "pago" para esta nova regra
      last_processed_month: currentMonth,
      last_processed_year: currentYear
    });

    if (!error) {
      setTitle(''); 
      setAmount('');
      fetchItems();
    } else {
      alert("Erro ao salvar recorrência. Verifique se as colunas last_processed existem no banco.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remover esta recorrência? O Finsys parará de lançar este item automaticamente.")) {
      await supabase.from('recurring_transactions').delete().eq('id', id);
      fetchItems();
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Transações Recorrentes</h2>
        <p className="text-slate-500 font-medium mt-1">Configure seus compromissos fixos e deixe o Finsys lançar para você.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Novo Cadastro</h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-black text-slate-700 uppercase mb-2">Descrição</label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Aluguel" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-black font-bold focus:ring-2 focus:ring-blue-600 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase mb-2">Valor (R$)</label>
            <input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} placeholder="0,00" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-black font-bold focus:ring-2 focus:ring-blue-600 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase mb-2">Dia do Vencimento</label>
            <input type="number" min="1" max="31" required value={day} onChange={e => setDay(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-black font-bold focus:ring-2 focus:ring-blue-600 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase mb-2">Tipo</label>
            <select value={type} onChange={e => { setType(e.target.value as any); setCategory(e.target.value === 'expense' ? CATEGORIAS_DESPESA[0] : CATEGORIAS_RECEITA[0]); }} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-black font-bold outline-none cursor-pointer">
              <option value="expense">Despesa Fixa</option>
              <option value="income">Receita Fixa</option>
            </select>
          </div>
          <button type="submit" className="bg-slate-900 text-white font-black py-3.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95">Cadastrar</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-blue-300 transition-all">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${item.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                <CalendarClock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-lg">{item.description}</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Todo dia {item.day_of_month}</p>
                <p className={`text-xl font-black ${item.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>R$ {Number(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-5 h-5"/></button>
          </div>
        ))}
      </div>
    </div>
  );
}