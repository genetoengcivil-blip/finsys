"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { FileText, Printer, Loader2, BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  const supabase = createClient();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: txs } = await supabase.from('transactions').select('*').order('date', { ascending: false });
      if (txs) setData(txs);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

  const totalReceitas = data.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalDespesas = data.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  const saldo = totalReceitas - totalDespesas;

  return (
    <div className="bg-white min-h-screen p-0 md:p-8">
      {/* Botão flutuante para imprimir - Some no PDF */}
      <div className="fixed bottom-8 right-8 print:hidden">
        <button onClick={() => window.print()} className="bg-slate-900 text-white font-bold py-4 px-8 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform">
          <Printer className="w-5 h-5" /> Imprimir Relatório PDF
        </button>
      </div>

      <div className="max-w-4xl mx-auto border border-slate-200 p-10 rounded-3xl shadow-sm print:border-none print:shadow-none print:p-0">
        
        {/* Header do PDF */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-600 p-1 rounded-md"><BarChart3 className="text-white w-6 h-6" /></div>
              <h1 className="text-2xl font-black tracking-tighter text-slate-900">FINSYS</h1>
            </div>
            <p className="text-slate-500 font-bold uppercase text-xs">Relatório Consolidado de Finanças</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900">Data de Emissão</p>
            <p className="text-sm text-slate-500 font-medium">{new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {/* Sumário */}
        <div className="grid grid-cols-3 gap-8 mb-10">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entradas</p>
            <p className="text-xl font-bold text-emerald-600">R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Saídas</p>
            <p className="text-xl font-bold text-rose-600">R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl text-white">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Saldo Final</p>
            <p className="text-xl font-bold">R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* Tabela de Itens */}
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-300">
              <th className="py-3 text-[11px] font-black text-slate-900 uppercase">Data</th>
              <th className="py-3 text-[11px] font-black text-slate-900 uppercase">Descrição / Categoria</th>
              <th className="py-3 text-[11px] font-black text-slate-900 uppercase text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map(tx => (
              <tr key={tx.id} className="break-inside-avoid">
                <td className="py-4 text-sm font-bold text-slate-500">{new Date(tx.date).toLocaleDateString('pt-BR')}</td>
                <td className="py-4">
                  <p className="text-sm font-black text-slate-900">{tx.description}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{tx.category || 'Geral'}</p>
                </td>
                <td className={`py-4 text-right font-black text-sm ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {tx.type === 'income' ? '+' : '-'} R$ {Number(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-20 border-t border-slate-200 pt-8 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Documento gerado automaticamente pelo Finsys • 2026</p>
        </div>
      </div>
    </div>
  );
}