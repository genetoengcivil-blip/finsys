// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Cria uma resposta base que o Supabase poderá modificar para atualizar os cookies
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Inicializa o cliente do Supabase específico para o servidor/middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Recupera o usuário atual validando o token (mais seguro que getSession)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define as rotas que queremos controlar
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isAuthRoute = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register'

  // Regra 1: Se tentar acessar o dashboard sem estar logado, joga para o login
  if (isDashboardRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Regra 2: Se já estiver logado e tentar acessar a página de login/registro, joga para o dashboard
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Retorna a resposta com os cookies atualizados
  return supabaseResponse
}

// Configura em quais rotas o middleware deve rodar
export const config = {
  matcher: [
    /*
     * Ignora rotas internas do Next.js e arquivos estáticos para economizar processamento:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico (ícone do navegador)
     * - imagens com extensões conhecidas
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}