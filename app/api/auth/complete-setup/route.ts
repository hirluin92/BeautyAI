// app/api/auth/complete-setup/route.ts - VERSIONE SENZA EMAIL
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    console.log('🚀 Complete Setup API - Starting...')
    
    // Parse JSON body
    const { fullName, organizationName } = await request.json()
    
    if (!fullName || !organizationName) {
      return NextResponse.json(
        { error: 'Nome completo e nome organizzazione sono obbligatori' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('❌ No authenticated user')
      return NextResponse.json(
        { error: 'Utente non autenticato' },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', user.id)

    // Verifica se l'utente esiste già (SENZA EMAIL)
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, organization_id')
      .eq('id', user.id)
      .single()

    if (existingUser?.organization_id) {
      console.log('✅ User already has organization, redirecting')
      return NextResponse.json({
        success: true,
        message: 'Setup già completato',
        redirect: '/dashboard'
      })
    }

    // START TRANSACTION-LIKE OPERATION
    try {
      console.log('🏢 Creating organization:', organizationName)
      
      // 1. Crea organizzazione
      const orgSlug = organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: organizationName,
          slug: orgSlug,
          email: user.email, // Email viene da auth.users
          plan_type: 'free',
          client_count: 0
        })
        .select()
        .single()

      if (orgError) {
        console.error('❌ Organization creation error:', orgError)
        throw new Error(`Errore creazione organizzazione: ${orgError.message}`)
      }

      console.log('✅ Organization created:', org.id)

      // 2. Crea/aggiorna utente (SENZA EMAIL nella tabella users)
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          // email: RIMOSSA - è già in auth.users
          full_name: fullName,
          organization_id: org.id,
          role: 'owner',
          is_active: true
        })

      if (userError) {
        console.error('❌ User creation error:', userError)
        
        // ROLLBACK: Elimina organizzazione creata
        await supabase
          .from('organizations')
          .delete()
          .eq('id', org.id)
        
        throw new Error(`Errore creazione utente: ${userError.message}`)
      }

      console.log('✅ User updated successfully')

      // 3. Aggiorna metadati utente in Auth (opzionale)
      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          organization_id: org.id,
          setup_completed: true
        }
      })

      if (metaError) {
        console.warn('⚠️ Warning: Could not update user metadata:', metaError)
        // Non bloccare, è solo un nice-to-have
      }

      console.log('✅ Setup completed successfully')

      return NextResponse.json({
        success: true,
        message: 'Setup completato con successo!',
        data: {
          organization: org,
          user: {
            id: user.id,
            email: user.email, // Da auth.users
            full_name: fullName,
            organization_id: org.id,
            role: 'owner'
          }
        }
      })

    } catch (transactionError: unknown) {
      const errorMessage = transactionError instanceof Error ? transactionError.message : 'Errore durante il setup'
      console.error('❌ Transaction error:', transactionError)
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

  } catch (error: unknown) {
    console.error('❌ Complete setup error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}