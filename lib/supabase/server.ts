// app/auth/actions.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signInAction(data: { email: string; password: string }) {
  // ❌ Antes (errado):
  // const supabase = createClient()
  
  // ✅ Depois (correto):
  const supabase = await createClient() // ← Adicione o await aqui!
  
  const { error } = await supabase.auth.signInWithPassword(data)
  
  if (error) {
    return redirect('/login?error=Could not authenticate user')
  }
  
  redirect('/dashboard')
}