"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  isSameMonth, isSameDay, addDays, eachDayOfInterval, addWeeks, subWeeks, isToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, 
  CheckCircle, X, Loader2, Wallet, ArrowUpRight, ArrowDownRight, Edit2, Trash2, Check
} from 'lucide-react';

const CATEGORIAS_DESPESA = ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Assinaturas', 'Outros Gastos'];
const CATEGORIAS_RECEITA = ['Salário', 'Freelance', 'Vendas', 'Rendimentos', 'Outras Receitas'];

export default function AgendaPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Modal e Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIAS_DESPESA[0]);

  const fetchAgenda = async () => {
    // Agora busca todos os itens, incluindo os já pagos
    const { data } = await supabase.from('agenda').select('*').order('due_date', { ascending: true });
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => { fetchAgenda(); }, []);

  const next = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const prev = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  // Funções de Ação
  const handleMarkAsPaid = async (item: any) => {
    if (item.status === 'completed') return;
    if (!confirm(`Confirmar a liquidação de "${item.title}"? O valor irá para o seu Dashboard.`)) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('transactions').insert({
      user_id: user?.id, description: item.title, category: item.category,
      amount: item.amount, type: item.type, date: new Date().toISOString().split('T')[0],
    });
    
    await supabase.from('agenda').update({ status: 'completed' }).eq('id', item.id);
    fetchAgenda();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja apagar este compromisso da agenda permanentemente?")) {
      await supabase.from('agenda').delete().eq('id', id);
      fetchAgenda();
    }
  };

  const openEdit = (item: any) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setTitle(item.title);
    setAmount(item.amount.toString());
    setType(item.type);
    setCategory(item.category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentId(null);
    setTitle('');
    setAmount('');
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    const numericAmount = parseFloat(amount.replace(',', '.'));
    
    const payload = {
      user_id: user?.id, title, amount: numericAmount, type, category, 
      due_date: format(selectedDate, 'yyyy-MM-dd')
    };

    if (isEditing && currentId) {
      await supabase.from('agenda').update(payload).eq('id', currentId);
    } else {
      await supabase.from('agenda').insert({ ...payload, status: 'pending' });
    }
    
    closeModal();
    fetchAgenda();
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin w-10 h-10 text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      
      {/* Header Interativo */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        
        <div className="flex items-center gap-6">
          <div className="bg-blue-50 p-4 rounded-2xl hidden md:block">
            <CalendarIcon className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 capitalize tracking-tight">
              {format(currentDate, "MMMM yyyy", { locale: ptBR })}
            </h2>
            <p className="text-sm font-bold text-slate-500 mt-1">Organize seus pagamentos e recebimentos.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          {/* Segmented Control */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl shadow-inner">
            <button onClick={() => setView('month')} className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${view === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Mês</button>
            <button onClick={() => setView('week')} className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${view === 'week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Semana</button>
            <button onClick={() => setView('day')} className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${view === 'day' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Dia</button>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-xl shadow-inner">
            <button onClick={prev} className="p-2 hover:bg-white hover:shadow-sm text-slate-600 rounded-lg transition-all"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }} className="px-4 text-sm font-black text-slate-700 hover:text-blue-600 transition-colors">Hoje</button>
            <button onClick={next} className="p-2 hover:bg-white hover:shadow-sm text-slate-600 rounded-lg transition-all"><ChevronRight className="w-5 h-5" /></button>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl flex items-center shadow-lg shadow-slate-900/20 transition-transform hover:scale-105 ml-auto xl:ml-0">
            <Plus className="w-5 h-5 mr-2" /> Novo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Lado Esquerdo: O Calendário */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {view === 'month' && <MonthView currentDate={currentDate} selectedDate={selectedDate} onSelect={setSelectedDate} items={items} />}
          {view === 'week' && <WeekView currentDate={currentDate} selectedDate={selectedDate} onSelect={setSelectedDate} items={items} />}
          {view === 'day' && <DayView selectedDate={selectedDate} items={items} />}
        </div>

        {/* Lado Direito: Painel de Detalhes do Dia */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
            <Wallet className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5" />
            <div className="relative z-10">
              <p className="text-blue-400 font-bold uppercase tracking-widest text-[11px] mb-2">Agenda do Dia</p>
              <h3 className="text-3xl font-black mb-1 capitalize">
                {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              </h3>
              <p className="text-slate-400 font-medium capitalize">{format(selectedDate, "EEEE", { locale: ptBR })}</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {items.filter(i => isSameDay(new Date(i.due_date + 'T12:00:00'), selectedDate)).length === 0 ? (
              <div className="bg-slate-50 p-10 rounded-3xl border border-dashed border-slate-300 text-center">
                <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-bold">Dia livre!<br/>Nenhum compromisso agendado.</p>
              </div>
            ) : (
              items.filter(i => isSameDay(new Date(i.due_date + 'T12:00:00'), selectedDate)).map(item => {
                const isIncome = item.type === 'income';
                const isCompleted = item.status === 'completed';

                return (
                  <div key={item.id} className={`bg-white p-6 rounded-3xl border transition-all group ${isCompleted ? 'opacity-60 border-slate-100 bg-slate-50' : 'border-slate-200 shadow-sm hover:shadow-md'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl ${isCompleted ? 'bg-slate-200 text-slate-500' : isIncome ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                          {isCompleted ? <Check className="w-4 h-4" /> : isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-slate-500' : isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isIncome ? 'A Receber' : 'A Pagar'}
                          </p>
                          <p className="text-xs font-bold text-slate-400">{item.category}</p>
                        </div>
                      </div>

                      {/* Botões de Ação (Editar e Apagar) */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    
                    <h4 className={`text-lg font-black mb-2 truncate ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{item.title}</h4>
                    <p className={`text-3xl font-black mb-6 ${isCompleted ? 'text-slate-400' : 'text-slate-900'}`}>
                      R$ {Number(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    
                    <button 
                      disabled={isCompleted}
                      onClick={() => handleMarkAsPaid(item)} 
                      className={`w-full py-3.5 font-black rounded-xl text-sm transition-all flex justify-center items-center gap-2 border-2 
                        ${isCompleted ? 'border-emerald-500 bg-emerald-500 text-white cursor-default' 
                        : isIncome ? 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600' 
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900'}`}
                    >
                      {isCompleted ? <><Check className="w-5 h-5" /> Liquidado</> : <><CheckCircle className="w-5 h-5" /> {isIncome ? 'Confirmar Recebimento' : 'Marcar como Pago'}</>}
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal de Criação / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-8 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}</h3>
                <p className="text-sm font-bold text-slate-500">Para {format(selectedDate, "dd 'de' MMM", { locale: ptBR })}</p>
              </div>
              <button onClick={closeModal} className="p-2 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-xl transition-colors"><X className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={handleCreateOrUpdate} className="space-y-5">
              <div className="flex bg-slate-100 p-1.5 rounded-xl">
                <button type="button" onClick={() => { setType('expense'); setCategory(CATEGORIAS_DESPESA[0]); }} className={`flex-1 py-2.5 text-sm font-black rounded-lg transition-colors ${type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}>Despesa</button>
                <button type="button" onClick={() => { setType('income'); setCategory(CATEGORIAS_RECEITA[0]); }} className={`flex-1 py-2.5 text-sm font-black rounded-lg transition-colors ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>Receita</button>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-1.5">Título</label>
                <input type="text" placeholder="Ex: Conta de Luz" required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-black font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-1.5">Valor (R$)</label>
                  <input type="number" step="0.01" placeholder="0,00" required value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-black font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-1.5">Categoria</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-black font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all">
                    {(type === 'expense' ? CATEGORIAS_DESPESA : CATEGORIAS_RECEITA).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-xl mt-4 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">
                {isEditing ? 'Salvar Alterações' : 'Confirmar Agendamento'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- VISUALIZAÇÃO DE MÊS ---
function MonthView({ currentDate, selectedDate, onSelect, items }: any) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
        {weekDays.map(day => (
          <div key={day} className="py-3 text-center text-[11px] font-black text-slate-500 uppercase tracking-widest">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {calendarDays.map((day, i) => {
          const dayItems = items.filter((item: any) => isSameDay(new Date(item.due_date + 'T12:00:00'), day));
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDate = isToday(day);

          return (
            <div 
              key={i} 
              onClick={() => onSelect(day)}
              className={`min-h-[110px] p-2 border-r border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-50 group
                ${!isCurrentMonth ? 'bg-slate-50/50' : 'bg-white'}
                ${isSelected ? 'ring-2 ring-inset ring-blue-500 bg-blue-50/30' : ''}
              `}
            >
              <div className="flex justify-end mb-1">
                <span className={`w-7 h-7 flex items-center justify-center text-sm font-bold rounded-full
                  ${isTodayDate ? 'bg-blue-600 text-white shadow-md' : isCurrentMonth ? 'text-slate-700' : 'text-slate-300'}
                  ${isSelected && !isTodayDate ? 'text-blue-600' : ''}
                `}>
                  {format(day, 'd')}
                </span>
              </div>
              
              <div className="space-y-1 mt-1">
                {dayItems.slice(0, 3).map((item: any) => {
                  const isCompleted = item.status === 'completed';
                  return (
                    <div key={item.id} className={`text-[10px] truncate px-1.5 py-0.5 rounded font-bold flex items-center gap-1 ${isCompleted ? 'bg-slate-100 text-slate-400 line-through' : item.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {isCompleted && <Check className="w-3 h-3" />} {item.title}
                    </div>
                  )
                })}
                {dayItems.length > 3 && (
                  <p className="text-[10px] font-black text-slate-400 pl-1">+{dayItems.length - 3} itens</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- VISUALIZAÇÃO DE SEMANA ---
function WeekView({ currentDate, selectedDate, onSelect, items }: any) {
  const start = startOfWeek(currentDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  return (
    <div className="grid grid-cols-7 min-h-[500px] divide-x divide-slate-100">
      {days.map((day, i) => {
        const dayItems = items.filter((item: any) => isSameDay(new Date(item.due_date + 'T12:00:00'), day));
        const isSelected = isSameDay(day, selectedDate);
        const isTodayDate = isToday(day);

        return (
          <div key={i} onClick={() => onSelect(day)} className={`p-3 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/30' : 'bg-white hover:bg-slate-50'}`}>
            <div className="text-center mb-4">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{format(day, 'EEE', { locale: ptBR })}</p>
              <div className={`w-9 h-9 mx-auto flex items-center justify-center rounded-full text-lg font-black ${isTodayDate ? 'bg-blue-600 text-white shadow-md' : isSelected ? 'text-blue-600' : 'text-slate-700'}`}>
                {format(day, 'd')}
              </div>
            </div>
            
            <div className="space-y-2">
              {dayItems.map((item: any) => {
                const isCompleted = item.status === 'completed';
                return (
                  <div key={item.id} className={`p-2 rounded-lg border ${isCompleted ? 'bg-slate-50 border-slate-200 opacity-60' : item.type === 'income' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                    <p className={`text-[10px] font-black truncate mb-1 flex items-center gap-1 ${isCompleted ? 'text-slate-400 line-through' : item.type === 'income' ? 'text-emerald-800' : 'text-rose-800'}`}>
                      {isCompleted && <Check className="w-3 h-3" />} {item.title}
                    </p>
                    <p className={`text-xs font-black ${isCompleted ? 'text-slate-400' : item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>R$ {Number(item.amount).toFixed(0)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- VISUALIZAÇÃO DE DIA ---
function DayView({ selectedDate, items }: any) {
  const dayItems = items.filter((item: any) => isSameDay(new Date(item.due_date + 'T12:00:00'), selectedDate));
  
  return (
    <div className="p-8 min-h-[500px] bg-slate-50/50">
      <div className="max-w-2xl mx-auto space-y-4">
        {dayItems.length === 0 ? (
          <div className="text-center py-32">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
              <CalendarIcon className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold text-lg">Sua agenda está livre hoje.</p>
            <p className="text-slate-400 font-medium text-sm mt-1">Aproveite para focar em outras tarefas.</p>
          </div>
        ) : (
          dayItems.map((item: any) => {
            const isCompleted = item.status === 'completed';
            return (
              <div key={item.id} className={`flex items-center gap-5 bg-white p-5 rounded-2xl border shadow-sm transition-all ${isCompleted ? 'opacity-60 border-slate-100' : 'border-slate-200 hover:shadow-md'}`}>
                <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${isCompleted ? 'bg-slate-100 text-slate-400' : item.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  {isCompleted ? <Check className="w-6 h-6" /> : item.type === 'income' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <p className={`text-lg font-black ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{item.title}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-black ${isCompleted ? 'text-slate-400' : item.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {item.type === 'income' ? '+' : '-'} R$ {Number(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
}