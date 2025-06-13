// app/api/auth/register/route.ts
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, fullName, organizationName } = await request.json()
    
    // Crea un client Supabase normale per auth
    const supabase = await createClient()
    
    // Crea un client Supabase con service role per bypassare RLS
    const serviceSupabase = createServiceClient()
    
    // 1. Crea l'utente con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Registrazione fallita' },
        { status: 400 }
      )
    }

    // 2. Crea l'organizzazione
    const orgSlug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const { data: org, error: orgError } = await serviceSupabase
      .from('organizations')
      .insert({
        name: organizationName,
        slug: orgSlug,
        email: email,
        plan_type: 'free',
        client_count: 0
      })
      .select()
      .single()

    if (orgError) {
      console.error('Organization error:', orgError)
      // Rollback: elimina l'utente auth
      await serviceSupabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: `Errore creazione organizzazione: ${orgError.message}` },
        { status: 400 }
      )
    }

    // 3. Aggiorna il record utente con i dati extra
    const { error: userError } = await serviceSupabase
      .from('users')
      .update({
        full_name: fullName,
        organization_id: org.id,
        role: 'owner',
        is_active: true
      })
      .eq('id', authData.user.id)

    if (userError) {
      console.error('User error:', userError)
      // Rollback: elimina organizzazione e utente auth
      await serviceSupabase.from('organizations').delete().eq('id', org.id)
      await serviceSupabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: `Errore aggiornamento profilo utente: ${userError.message}` },
        { status: 400 }
      )
    }

    // 4. Redirect a login con messaggio
    return NextResponse.json({
      success: true,
      message: "Registrazione completata! Controlla la tua email per confermare l'account.",
      redirect: '/login?registered=true'
    })

  } catch (error: any) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}