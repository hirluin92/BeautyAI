// app/api/auth/login/route.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { extractOrganization } from '@/lib/supabase/requireAuth'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🚀 Login API - Starting...')
    
    // Validazione input
    const { email, password } = loginSchema.parse(body)

    const cookieStore = await cookies()

    // 🔑 IMPORTANTE: Supabase client con cookie management identico al middleware
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Tentativo di login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError || !authData.user) {
      console.error('❌ Login error:', authError)
      return NextResponse.json(
        { error: 'Email o password non corretti' },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', authData.user.id)

    // Verifica dati profilo utente (SENZA email - ora è solo in auth.users)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        organization_id,
        role,
        is_active,
        organization:organizations(
          id,
          name,
          slug,
          plan_type
        )
      `)
      .eq('id', authData.user.id)
      .single()

    if (userError || !userData) {
      console.error('❌ User profile error:', userError)
      return NextResponse.json(
        { error: 'Profilo utente non trovato' },
        { status: 404 }
      )
    }

    // Verifica se l'utente è attivo
    if (!userData.is_active) {
      console.log('❌ User not active')
      return NextResponse.json(
        { error: 'Account in attesa di approvazione o conferma email' },
        { status: 403 }
      )
    }

    // Verifica organizzazione
    if (!userData.organization_id || !userData.organization) {
      console.log('❌ No organization found')
      return NextResponse.json(
        { error: 'Organizzazione non trovata. Contatta il supporto.' },
        { status: 404 }
      )
    }

    // Extract organization data safely
    const organization = extractOrganization(userData)

    console.log('✅ Login successful for:', userData.full_name)
    console.log('🏢 Organization:', organization.name)
    console.log('👤 Role:', userData.role)

    // 🔑 IMPORTANTE: Restituisci success
    // I cookie sono già stati impostati da supabase.auth.signInWithPassword()
    return NextResponse.json({
      success: true,
      message: 'Login effettuato con successo',
      data: {
        user: {
          id: userData.id,
          email: authData.user.email,
          full_name: userData.full_name,
          role: userData.role
        },
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          plan_type: organization.plan_type
        }
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dati non validi', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('❌ Login error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}