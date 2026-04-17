"use client";

import { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

const CATEGORIAS_DESPESA = ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Assinaturas', 'Outros Gastos'];
const CATEGORIAS_RECEITA = ['Salário', 'Freelance', 'Vendas', 'Rendimentos', 'Outras Receitas'];
const CATEGORIAS_INVESTIMENTO = ['Renda Fixa', 'Ações', 'Fundos Imobiliários', 'Criptomoedas', 'Tesouro Direto', 'Previdência', 'Outros Investimentos'];

export default function AddTransactionModal() {
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // O tipo visual do formulário (Despesa, Receita ou Investimento)
  const [formType, setFormType] = useState<'expense' | 'income' | 'investment'>('expense');
  const [category, setCategory] = useState(CATEGORIAS_DESPESA[0]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const numericAmount = parseFloat(amount.replace(',', '.'));
      
      // Se for investimento, salvamos como 'expense' (pois o dinheiro sai da conta corrente), 
      // mas a categoria dirá ao Dashboard que é um investimento.
      const dbType = formType === 'income' ? 'income' : 'expense';

      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        description,
        category, 
        amount: numericAmount,
        type: dbType,
        date,
      });

      if (error) throw error;

      setIsOpen(false);
      window.location.reload(); 
      
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeChange = (newType: 'expense' | 'income' | 'investment') => {
    setFormType(newType);
    if (newType === 'expense') setCategory(CATEGORIAS_DESPESA[0]);
    else if (newType === 'income') setCategory(CATEGORIAS_RECEITA[0]);
    else setCategory(CATEGORIAS_INVESTIMENTO[0]);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-lg flex items-center shadow-md transition-transform hover:scale-105">
        <Plus className="w-5 h-5 mr-1" /> Nova Transação
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Novo Registro</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* Abas de Seleção (3 Opções agora) */}
              <div className="flex bg-slate-100 p-1.5 rounded-xl gap-1">
                <button type="button" onClick={() => handleTypeChange('expense')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formType === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Despesa</button>
                <button type="button" onClick={() => handleTypeChange('income')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Receita</button>
                <button type="button" onClick={() => handleTypeChange('investment')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formType === 'investment' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Investir</button>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Categoria</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-black font-bold focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all">
                  {formType === 'expense' && CATEGORIAS_DESPESA.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  {formType === 'income' && CATEGORIAS_RECEITA.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  {formType === 'investment' && CATEGORIAS_INVESTIMENTO.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Valor (R$)</label>
                  <input type="number" step="0.01" min="0" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-black font-bold focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Data</label>
                  <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-black font-bold focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Descrição</label>
                <input type="text" required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Conta de luz, Compra de Ações..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-black font-bold focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
              </div>

              <button type="submit" disabled={isLoading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl flex justify-center mt-6 transition-colors">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Lançamento'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}