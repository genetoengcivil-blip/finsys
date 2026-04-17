"use client";

import { useEffect, useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  ReceiptText, 
  Loader2, 
  TrendingUp, 
  Landmark,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { createClient } from '@/lib/supabase';

// Configurações Visuais Exatas do seu original
const EXPENSE_COLORS = ['#f43f5e', '#f97316', '#eab308', '#ec4899', '#64748b']; 
const INCOME_COLORS = ['#10b981', '#3b82f6', '#06b6d4', '#84cc16', '#14b8a6'];  
const INVEST_COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#3b82f6', '#0ea5e9'];
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const INVESTMENT_CATEGORIES = [
  'Renda Fixa', 'Ações', 'Fundos Imobiliários', 'Criptomoedas', 
  'Tesouro Direto', 'Previdência', 'Outros Investimentos', 'Investimentos'
];

export default function DashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [radar, setRadar] = useState<any[]>([]);
  
  const [stats, setStats] = useState({ 
    incomeMonth: 0, 
    expenseMonth: 0, 
    investMonth: 0, 
    balanceAccount: 0, 
    totalInvested: 0, 
    netWorth: 0,
    totalVaults: 0
  });
  
  const [flowData, setFlowData] = useState<any[]>([]);
  const [pieExpense, setPieExpense] = useState<any[]>([]);
  const [pieIncome, setPieIncome] = useState<any[]>([]);
  const [pieInvest, setPieInvest] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: txs } = await supabase.from('transactions').select('*').order('date', { ascending: false });
      const { data: vts } = await supabase.from('vaults').select('current_amount');

      if (!txs) { setLoading(false); return; }

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      let tIncomeMonth = 0, tExpenseMonth = 0, tInvestMonth = 0;
      let tTotalIncome = 0, tTotalExpense = 0, tTotalInvested = 0;
      const totalVaults = vts?.reduce((acc, v) => acc + Number(v.current_amount), 0) || 0;

      const flowMap: Record<string, any> = {};
      const expMap: Record<string, number> = {};
      const incMap: Record<string, number> = {};
      const invMap: Record<string, number> = {};

      for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1);
        flowMap[`${d.getFullYear()}-${d.getMonth()}`] = { name: MONTHS[d.getMonth()], receitas: 0, despesas: 0, investimentos: 0 };
      }

      txs.forEach(tx => {
        const amount = Number(tx.amount);
        
        // CORREÇÃO DOS DADOS ZERADOS: Ignora fuso horário dividindo a string da data
        const [y, m] = tx.date.split('-').map(Number);
        const txMonth = m - 1;
        const txYear = y;

        const isInvestment = INVESTMENT_CATEGORIES.includes(tx.category || '');
        const isCurrentMonth = txMonth === currentMonth && txYear === currentYear;

        if (tx.type === 'income') {
          tTotalIncome += amount;
          if (isCurrentMonth) tIncomeMonth += amount;
          incMap[tx.category || 'Outros'] = (incMap[tx.category || 'Outros'] || 0) + amount;
        } 
        else if (tx.type === 'expense') {
          if (isInvestment) {
            tTotalInvested += amount;
            if (isCurrentMonth) tInvestMonth += amount;
            invMap[tx.category || 'Outros'] = (invMap[tx.category || 'Outros'] || 0) + amount;
          } else {
            tTotalExpense += amount;
            if (isCurrentMonth) tExpenseMonth += amount;
            expMap[tx.category || 'Outros'] = (expMap[tx.category || 'Outros'] || 0) + amount;
          }
        }

        const flowKey = `${txYear}-${txMonth}`;
        if (flowMap[flowKey]) {
          if (isInvestment) flowMap[flowKey].investimentos += amount;
          else if (tx.type === 'income') flowMap[flowKey].receitas += amount;
          else if (tx.type === 'expense') flowMap[flowKey].despesas += amount;
        }
      });

      const saldoLivre = tTotalIncome - tTotalExpense - totalVaults;
      const patrimonioTotal = (tTotalIncome - tTotalExpense) + tTotalInvested;

      setStats({ 
        incomeMonth: tIncomeMonth, 
        expenseMonth: tExpenseMonth, 
        investMonth: tInvestMonth, 
        balanceAccount: saldoLivre,
        totalInvested: tTotalInvested,
        netWorth: patrimonioTotal,
        totalVaults: totalVaults
      });

      setRecentTransactions(txs.slice(0, 5));
      setFlowData(Object.values(flowMap));

      const buildPie = (map: Record<string, number>, colors: string[], emptyLabel: string) => {
        const data = Object.keys(map).map((key, i) => ({ name: key, value: map[key], color: colors[i % colors.length] }));
        return data.length > 0 ? data : [{ name: emptyLabel, value: 0, color: '#e2e8f0' }];
      };

      setPieExpense(buildPie(expMap, EXPENSE_COLORS, 'Sem despesas'));
      setPieIncome(buildPie(incMap, INCOME_COLORS, 'Sem receitas'));
      setPieInvest(buildPie(invMap, INVEST_COLORS, 'Sem investimentos'));

      setLoading(false);
    }
    loadDashboardData();
  }, []);

  if (loading) return <div className="h-[70vh] flex flex-col items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-8">
      
      {/* 1. Cards de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
          <div className="bg-emerald-100 p-2 rounded-xl w-fit mb-3"><ArrowUpRight className="text-emerald-600 w-5 h-5" /></div>
          <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Receitas (Mês)</p>
          <h3 className="text-2xl font-black text-slate-900">R$ {stats.incomeMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
          <div className="bg-rose-100 p-2 rounded-xl w-fit mb-3"><ArrowDownRight className="text-rose-600 w-5 h-5" /></div>
          <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Despesas (Mês)</p>
          <h3 className="text-2xl font-black text-slate-900">R$ {stats.expenseMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
          <div className="bg-indigo-100 p-2 rounded-xl w-fit mb-3"><TrendingUp className="text-indigo-600 w-5 h-5" /></div>
          <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Investido (Mês)</p>
          <h3 className="text-2xl font-black text-slate-900">R$ {stats.investMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg text-white hover:scale-[1.02] transition-transform relative overflow-hidden">
          <Landmark className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5" />
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Patrimônio Total</p>
            <h3 className="text-2xl font-black text-white mb-3">R$ {stats.netWorth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            <div className="flex justify-between border-t border-slate-700 pt-3">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Saldo Livre</p>
                <p className="text-sm font-bold text-emerald-400">R$ {stats.balanceAccount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Investimentos</p>
                <p className="text-sm font-bold text-indigo-400">R$ {stats.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Gráfico de Fluxo de Caixa */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Evolução do Fluxo Financeiro (6 Meses)</h3>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={flowData}>
              <defs>
                <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
                <linearGradient id="colorInvest" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} />
              <RechartsTooltip formatter={(v: any) => `R$ ${v.toLocaleString('pt-BR')}`} />
              <Area type="monotone" dataKey="receitas" name="Receitas" stroke="#10b981" strokeWidth={3} fill="url(#colorReceitas)" />
              <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#f43f5e" strokeWidth={3} fill="url(#colorDespesas)" />
              <Area type="monotone" dataKey="investimentos" name="Investimentos" stroke="#6366f1" strokeWidth={3} fill="url(#colorInvest)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Gráficos de Distribuição */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PieCard title="Gastos" data={pieExpense} />
        <PieCard title="Receitas" data={pieIncome} />
        <PieCard title="Investimentos" data={pieInvest} />
      </div>

      {/* 4. Tabela de Recentes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Últimos Lançamentos</h3>
          <a href="/dashboard/transactions" className="text-sm font-extrabold text-blue-600 hover:text-blue-700">Histórico completo</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-900">{tx.description}</td>
                  <td className="px-6 py-4"><span className="px-3 py-1 text-xs font-bold bg-slate-100 text-slate-700 rounded-md">{tx.category || 'Diversos'}</span></td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-500">{new Date(tx.date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className={`px-6 py-4 text-right font-black ${tx.type === 'income' ? 'text-emerald-600' : INVESTMENT_CATEGORIES.includes(tx.category || '') ? 'text-indigo-600' : 'text-slate-900'}`}>
                    {tx.type === 'income' ? '+' : '-'} R$ {Number(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PieCard({ title, data }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
      <h3 className="text-lg font-bold text-slate-900 mb-4">{title}</h3>
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart><Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">{data.map((e: any, i: any) => <Cell key={i} fill={e.color} />)}</Pie><RechartsTooltip/></PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2 mt-4">
        {data.slice(0, 3).map((item: any, i: any) => (
          <div key={i} className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="font-bold text-slate-700">{item.name}</span>
            </div>
            <span className="font-black text-slate-900">R$ {item.value.toLocaleString('pt-BR')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}