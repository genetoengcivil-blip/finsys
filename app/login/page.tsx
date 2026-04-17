import { login } from '@/app/auth/actions'
import Link from 'next/link'
import { BarChart3, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para o início
        </Link>
        
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-600 p-3 rounded-xl mb-4">
              <BarChart3 className="text-white w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Bem-vindo de volta</h2>
            <p className="text-slate-500 text-sm mt-1">Acesse sua conta Finsys</p>
          </div>

          <form action={login} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                E-mail
              </label>
              <input 
                id="email"
                name="email"
                type="email" 
                placeholder="seu@email.com" 
                required
                className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Senha
                </label>
                <Link href="#" className="text-sm text-blue-600 font-medium hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <input 
                id="password"
                name="password"
                type="password" 
                placeholder="••••••••" 
                required
                className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none"
              />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg transition-colors mt-6 shadow-md shadow-blue-600/20"
            >
              Entrar na Plataforma
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-slate-600">
            Ainda não tem uma conta?{' '}
            <Link href="/register" className="text-blue-600 font-bold hover:underline">
              Crie uma agora
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}