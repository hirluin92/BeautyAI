// app/api/auth/complete-registration/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { organizationName, fullName, userId } = await request.json()
    const supabase = await createClient()

    // Verifica che l'utente sia autenticato
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Inizia una transazione usando RPC o gestisci manualmente
    try {
      // 1. Crea l'organizzazione
      const orgSlug = organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: organizationName,
          slug: orgSlug,
          email: user.email,
          plan_type: 'free',
          client_count: 0
        })
        .select()
        .single()

      if (orgError) {
        console.error('Organization creation error:', orgError)
        throw new Error(`Errore creazione organizzazione: ${orgError.message}`)
      }

      // 2. Crea o aggiorna il profilo utente
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: fullName,
          organization_id: org.id,
          role: 'owner',
          is_active: true
        })

      if (userError) {
        // Se fallisce, elimina l'organizzazione creata
        await supabase
          .from('organizations')
          .delete()
          .eq('id', org.id)
        
        console.error('User creation error:', userError)
        throw new Error(`Errore creazione utente: ${userError.message}`)
      }

      return NextResponse.json({
        success: true,
        organization: org
      })

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
      console.error('Error completing registration:', errorMessage)
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
    console.error('Complete registration error:', errorMessage)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}