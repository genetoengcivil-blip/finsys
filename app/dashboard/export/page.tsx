"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { FileText, Download, Loader2 } from 'lucide-react';

export default function ExportPage() {
  const [isExporting, setIsExporting] = useState(false);
  const supabase = createClient();

  const handleExportCSV = async () => {
    setIsExporting(true);
    const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    
    if (error || !data) {
      alert("Erro ao exportar dados.");
      setIsExporting(false); return;
    }

    // \uFEFF força o Excel a ler em UTF-8 (corrige acentos). Ponto-e-vírgula separa colunas no Brasil.
    let csvContent = "\uFEFFData;Descrição;Categoria;Tipo;Valor\n";

    data.forEach(row => {
      const valorBR = Number(row.amount).toFixed(2).replace('.', ','); // Troca ponto por vírgula no valor
      const tipo = row.type === 'income' ? 'Receita' : 'Despesa';
      const rowData = [
        new Date(row.date).toLocaleDateString('pt-BR'),
        `"${row.description}"`,
        `"${row.category || 'Diversos'}"`,
        tipo,
        valorBR
      ].join(";"); // Usa ponto-e-vírgula
      csvContent += rowData + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `finsys_extrato_${new Date().getTime()}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);

    setIsExporting(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-slate-900">Exportar Dados</h2>
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
        <FileText className="text-blue-600 w-16 h-16 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">Exportação Organizada (Excel)</h3>
        <button onClick={handleExportCSV} disabled={isExporting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-8 rounded-lg flex mx-auto mt-6">
          {isExporting ? <Loader2 className="animate-spin mr-2" /> : <Download className="mr-2" />} Baixar Extrato
        </button>
      </div>
    </div>
  );
}