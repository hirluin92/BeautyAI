// app/api/auth/register-staff/route.ts
import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { extractOrganization } from '@/lib/supabase/requireAuth'

const registerStaffSchema = z.object({
  userData: z.object({
    fullName: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8),
    phone: z.string().optional()
  }),
  staffCode: z.string().min(6).max(20)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🚀 Register Staff API - Starting...')
    
    // Validazione input
    const validatedData = registerStaffSchema.parse(body)
    const { userData, staffCode } = validatedData

    const serviceClient = await createServiceClient()

    // 1. Verifica codice invito
    const { data: inviteData, error: inviteError } = await serviceClient
      .from('salon_invite_codes')
      .select(`
        id,
        organization_id,
        max_uses,
        used_count,
        is_active,
        expires_at,
        organization:organizations(
          id,
          name,
          slug
        )
      `)
      .eq('code', staffCode.toUpperCase())
      .eq('is_active', true)
      .single()

    if (inviteError || !inviteData) {
      console.error('❌ Invalid invite code:', staffCode)
      return NextResponse.json(
        { error: 'Codice invito non valido o scaduto' },
        { status: 400 }
      )
    }

    // Verifica se il codice è scaduto
    if (new Date(inviteData.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Codice invito scaduto' },
        { status: 400 }
      )
    }

    // Verifica se il codice ha raggiunto il limite di utilizzi
    if (inviteData.used_count >= inviteData.max_uses) {
      return NextResponse.json(
        { error: 'Codice invito esaurito' },
        { status: 400 }
      )
    }

    // Extract organization data safely
    const organization = extractOrganization(inviteData)

    console.log('✅ Invite code validated for org:', organization.name)

    // 2. Verifica se l'email è già registrata
    // Ora controlla solo in Supabase Auth, non nella tabella users
    const { data: existingUser } = await serviceClient
      .from('users')
      .select('id')
      .eq('email', userData.email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email già registrata nel sistema' },
        { status: 400 }
      )
    }

    // 3. Crea utente in Supabase Auth
    const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.fullName,
        phone: userData.phone,
        pending_approval: true
      }
    })

    if (authError || !authData.user) {
      console.error('❌ Auth creation error:', authError)
      return NextResponse.json(
        { error: 'Errore durante la creazione dell\'account' },
        { status: 400 }
      )
    }

    console.log('✅ Auth user created:', authData.user.id)

    // 4. Crea profilo utente (inizialmente inattivo)
    const { error: userError } = await serviceClient
      .from('users')
      .insert({
        id: authData.user.id,
        full_name: userData.fullName,
        phone: userData.phone || null,
        organization_id: inviteData.organization_id,
        role: 'staff',
        is_active: false, // Richiede approvazione
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.fullName)}&background=10b981&color=fff`
      })

    if (userError) {
      console.error('❌ User profile error:', userError)
      // Rollback: elimina utente Auth
      await serviceClient.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Errore durante la creazione del profilo utente' },
        { status: 500 }
      )
    }

    console.log('✅ User profile created (pending approval)')

    // 5. Incrementa il contatore del codice invito
    await serviceClient
      .from('salon_invite_codes')
      .update({ used_count: inviteData.used_count + 1 })
      .eq('id', inviteData.id)

    // 6. Crea notifica per il proprietario (opzionale)
    // TODO: Implementare sistema notifiche
    
    return NextResponse.json({
      success: true,
      message: 'Richiesta di accesso inviata con successo!',
      data: {
        user: {
          id: authData.user.id,
          email: userData.email,
          full_name: userData.fullName,
          pending_approval: true
        },
        organization: {
          name: organization.name,
          slug: organization.slug
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
    
    console.error('❌ Staff registration error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}