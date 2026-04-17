'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function login(formData: FormData) {
  try {
    const supabase = await createClient()

    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
      console.error('Login error:', error.message)
      return { error: 'Credenciais inválidas. Verifique seu e-mail e senha.' }
    }

    revalidatePath('/', 'layout')
  } catch (err) {
    console.error('Unexpected error:', err)
    return { error: 'Ocorreu um erro inesperado. Tente novamente.' }
  }
  
  redirect('/dashboard')
}