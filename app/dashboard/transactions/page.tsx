"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Loader2, ArrowUpCircle, ArrowDownCircle, Trash2, Edit2, X, Check } from 'lucide-react';

const CATEGORIAS = ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Assinaturas', 'Salário', 'Investimentos', 'Outros'];

export default function TransactionsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  // Estado para Edição
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const fetchTransactions = async () => {
    const { data } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    if (data) setTransactions(data);
    setLoading(false);
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Deseja apagar permanentemente esta transação?")) {
      await supabase.from('transactions').delete().eq('id', id);
      fetchTransactions();
    }
  };

  const startEdit = (tx: any) => {
    setEditingId(tx.id);
    setEditForm({ ...tx });
  };

  const handleSaveEdit = async () => {
    const { error } = await supabase.from('transactions').update({
      description: editForm.description,
      amount: Number(editForm.amount),
      category: editForm.category,
      date: editForm.date,
      type: editForm.type
    }).eq('id', editingId);

    if (!error) {
      setEditingId(null);
      fetchTransactions();
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Minhas Transações</h2>
      
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo/Data</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Categoria</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Valor</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                {editingId === tx.id ? (
                  // MODO EDIÇÃO
                  <>
                    <td className="px-6 py-4">
                      <input type="date" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} className="border border-slate-300 rounded px-2 py-1 text-black font-semibold text-sm w-full" />
                    </td>
                    <td className="px-6 py-4">
                      <input type="text" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="border border-slate-300 rounded px-2 py-1 text-black font-semibold text-sm w-full" />
                    </td>
                    <td className="px-6 py-4">
                      <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="border border-slate-300 rounded px-2 py-1 text-black font-semibold text-sm w-full">
                        {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <input type="number" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} className="border border-slate-300 rounded px-2 py-1 text-black font-semibold text-sm w-full text-right" />
                    </td>
                    <td className="px-6 py-4 flex justify-center gap-2">
                      <button onClick={handleSaveEdit} className="bg-emerald-500 text-white p-1.5 rounded-md hover:bg-emerald-600"><Check className="w-4 h-4"/></button>
                      <button onClick={() => setEditingId(null)} className="bg-slate-200 text-slate-600 p-1.5 rounded-md hover:bg-slate-300"><X className="w-4 h-4"/></button>
                    </td>
                  </>
                ) : (
                  // MODO VISUALIZAÇÃO
                  <>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {tx.type === 'income' ? <ArrowUpCircle className="text-emerald-500 w-5 h-5" /> : <ArrowDownCircle className="text-rose-500 w-5 h-5" />}
                        <span className="text-sm font-semibold text-slate-500">{new Date(tx.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-black">{tx.description}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{tx.category || 'Diversos'}</td>
                    <td className={`px-6 py-4 text-right font-extrabold ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-950'}`}>
                      R$ {Number(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 flex justify-center gap-4">
                      <button onClick={() => startEdit(tx)} className="text-slate-400 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4"/></button>
                      <button onClick={() => handleDelete(tx.id)} className="text-slate-400 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4"/></button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}