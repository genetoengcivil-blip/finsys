"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Target, Loader2, Plus, TrendingUp, X, Trash2, Edit2 } from 'lucide-react';

export default function GoalsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [goals, setGoals] = useState<any[]>([]);

  // Estados Nova Meta
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  // Estados Depósito
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);

  // Estados Edição
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editTargetAmount, setEditTargetAmount] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const fetchGoals = async () => {
    const { data } = await supabase.from('goals').select('*').order('created_at', { ascending: false });
    if (data) setGoals(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchGoals();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Criar Meta
  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const numericAmount = parseFloat(targetAmount.replace(',', '.'));
    
    const { error } = await supabase.from('goals').insert({
      user_id: user.id, 
      title, 
      target_amount: numericAmount, 
      deadline: deadline || null, 
      current_amount: 0
    });
    
    if (!error) {
      setTitle(''); setTargetAmount(''); setDeadline('');
      fetchGoals();
    } else {
      alert("Erro ao criar meta.");
    }
    setIsSubmitting(false);
  };

  // Depositar
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDepositing(true);
    const numericDeposit = parseFloat(depositAmount.replace(',', '.'));
    const newTotal = Number(selectedGoal.current_amount) + numericDeposit;
    
    const { error } = await supabase.from('goals').update({ current_amount: newTotal }).eq('id', selectedGoal.id);
    
    if (!error) {
      setDepositAmount('');
      setDepositModalOpen(false);
      setSelectedGoal(null);
      fetchGoals();
    } else {
      alert("Erro ao depositar.");
    }
    setIsDepositing(false);
  };

  // Excluir Meta
  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja apagar esta meta permanentemente?")) {
      await supabase.from('goals').delete().eq('id', id);
      fetchGoals();
    }
  };

  // Abrir modal de edição
  const openEditModal = (goal: any) => {
    setSelectedGoal(goal);
    setEditTitle(goal.title);
    setEditTargetAmount(goal.target_amount.toString());
    setEditDeadline(goal.deadline ? goal.deadline.split('T')[0] : '');
    setEditModalOpen(true);
  };

  // Salvar Edição
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEdit(true);
    const numericAmount = parseFloat(editTargetAmount.replace(',', '.'));
    
    const { error } = await supabase.from('goals').update({ 
      title: editTitle,
      target_amount: numericAmount,
      deadline: editDeadline || null
    }).eq('id', selectedGoal.id);

    if (!error) {
      setEditModalOpen(false);
      setSelectedGoal(null);
      fetchGoals();
    } else {
      alert("Erro ao editar meta.");
    }
    setIsSavingEdit(false);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-8 relative">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Metas Financeiras</h2>
        <p className="text-slate-500">Planeje seu futuro e acompanhe seu progresso.</p>
      </div>

      {/* Formulário Nova Meta */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-600" /> Criar Nova Meta
        </h3>
        <form onSubmit={handleCreateGoal} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Objetivo</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Reserva de Emergência..." 
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-black font-bold focus:ring-2 focus:ring-blue-600/30 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Valor Alvo (R$)</label>
            <input type="number" step="0.01" min="0" required value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="0,00" 
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-black font-bold focus:ring-2 focus:ring-blue-600/30 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Prazo (Opcional)</label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} 
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-black font-bold focus:ring-2 focus:ring-blue-600/30 outline-none transition-all" />
          </div>
          <div className="md:col-span-1">
            <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center h-[46px]">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Adicionar Meta'}
            </button>
          </div>
        </form>
      </div>

      {/* Grid de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const current = Number(goal.current_amount);
          const target = Number(goal.target_amount);
          const percent = Math.min((current / target) * 100, 100).toFixed(1);

          return (
            <div key={goal.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative group">
              
              {/* Botões de Ação (Aparecem no hover) */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditModal(goal)} className="p-1.5 bg-slate-100 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"><Edit2 className="w-4 h-4"/></button>
                <button onClick={() => handleDelete(goal.id)} className="p-1.5 bg-slate-100 text-rose-500 hover:bg-rose-100 rounded-md transition-colors"><Trash2 className="w-4 h-4"/></button>
              </div>

              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-50 p-3 rounded-xl"><Target className="text-indigo-600 w-6 h-6" /></div>
                {goal.deadline && (
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full mt-1 mr-16">
                    Até {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1 pr-14">{goal.title}</h3>
              <div className="flex items-end justify-between mt-4 mb-2">
                <p className="text-2xl font-extrabold text-slate-900">R$ {current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p className="text-sm font-semibold text-slate-500 mb-1">de R$ {target.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 mb-3 overflow-hidden">
                <div className="bg-indigo-600 h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${percent}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-indigo-600">{percent}% alcançado</span>
                <button 
                  onClick={() => { setSelectedGoal(goal); setDepositModalOpen(true); }}
                  className="text-slate-500 bg-slate-50 hover:bg-indigo-50 px-3 py-1.5 rounded-lg hover:text-indigo-600 flex items-center transition-colors border border-slate-200"
                >
                  <TrendingUp className="w-4 h-4 mr-1" /> Depositar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Depósito */}
      {depositModalOpen && selectedGoal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Depositar na Meta</h3>
              <button onClick={() => setDepositModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-md"><X className="w-5 h-5"/></button>
            </div>
            <p className="text-sm text-slate-500 mb-4 font-medium">Meta: <strong className="text-slate-900">{selectedGoal.title}</strong></p>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Valor (R$)</label>
                <input 
                  type="number" step="0.01" min="0.01" required value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="0,00"
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-black font-bold focus:ring-2 focus:ring-indigo-600/30 outline-none"
                />
              </div>
              <button type="submit" disabled={isDepositing} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg flex justify-center">
                {isDepositing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Depósito'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {editModalOpen && selectedGoal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Editar Meta</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-md"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nome do Objetivo</label>
                <input 
                  type="text" required value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-black font-bold focus:ring-2 focus:ring-blue-600/30 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Novo Valor Alvo (R$)</label>
                <input 
                  type="number" step="0.01" min="0" required value={editTargetAmount} onChange={(e) => setEditTargetAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-black font-bold focus:ring-2 focus:ring-blue-600/30 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Novo Prazo (Opcional)</label>
                <input 
                  type="date" value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-black font-bold focus:ring-2 focus:ring-blue-600/30 outline-none"
                />
              </div>
              <button type="submit" disabled={isSavingEdit} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 mt-2 rounded-lg flex justify-center">
                {isSavingEdit ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Alterações'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}