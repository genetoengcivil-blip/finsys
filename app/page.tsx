import Link from 'next/link';
import { ArrowRight, BarChart3, CheckCircle2, PieChart, Wallet } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-100 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BarChart3 className="text-blue-600 w-6 h-6" />
          <span className="font-bold text-xl tracking-tight">Finsys</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="text-slate-600 hover:text-slate-900 font-medium px-4 py-2">
            Entrar
          </Link>
          <Link href="/register" className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2 rounded-lg transition-colors">
            Criar Conta
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-5xl mx-auto">
        <div className="inline-block bg-blue-50 text-blue-700 font-semibold px-4 py-1.5 rounded-full text-sm mb-6">
          ✨ O novo padrão em finanças pessoais
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
          Assuma o controle do seu <span className="text-blue-600">futuro financeiro.</span>
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
          Esqueça as planilhas complexas. O Finsys organiza seu dinheiro com gráficos modernos, metas inteligentes e total clareza.
        </p>
        <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-full flex items-center text-lg transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 transform hover:-translate-y-0.5">
          Começar Teste Grátis <ArrowRight className="ml-2 w-5 h-5" />
        </Link>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
            <PieChart className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Gráficos Intuitivos</h3>
            <p className="text-slate-600">Visualize para onde seu dinheiro está indo com dashboards interativos e fáceis de ler.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
            <Wallet className="w-10 h-10 text-emerald-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Controle de Despesas</h3>
            <p className="text-slate-600">Categorização automática e alertas de orçamento para você nunca gastar mais do que deve.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
            <CheckCircle2 className="w-10 h-10 text-indigo-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Metas Claras</h3>
            <p className="text-slate-600">Defina objetivos para viagens, reservas de emergência ou investimentos e acompanhe o progresso.</p>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-slate-400 border-t border-slate-100">
        <p>© 2026 Finsys. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}