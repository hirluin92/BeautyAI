import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimitManager, rateLimitResponse } from '@/lib/rate-limit'
import { z } from 'zod'

// Validation schema
const registerSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'Password deve essere di almeno 6 caratteri'),
  name: z.string().min(1, 'Nome è obbligatorio'),
  organization_name: z.string().min(1, 'Nome organizzazione è obbligatorio'),
  phone: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting per registrazione (più restrittivo)
    const result = await rateLimitManager.checkRateLimit(
      request,
      'dashboard',
      '/api/auth/register'
    )
    
    if (!result.success) {
      return rateLimitResponse(result.retryAfter)
    }

    const body = await request.json()
    // Validate request body
    const validatedData = registerSchema.parse(body)

    // Create service role client for admin operations
    const cookieStore = await cookies();
    const serviceClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    )

    // Create user account
    const { data: authData, error: authError } = await serviceClient.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          name: validatedData.name,
        }
      }
    })

    if (authError || !authData.user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: authError?.message || 'Errore durante la registrazione' },
        { status: 400 }
      )
    }

    // Create organization
    const { data: organization, error: orgError } = await serviceClient
      .from('organizations')
      .insert({
        name: validatedData.organization_name,
        plan_type: 'free',
        settings: {
          business_hours: {
            monday: { open: '09:00', close: '18:00', isOpen: true },
            tuesday: { open: '09:00', close: '18:00', isOpen: true },
            wednesday: { open: '09:00', close: '18:00', isOpen: true },
            thursday: { open: '09:00', close: '18:00', isOpen: true },
            friday: { open: '09:00', close: '18:00', isOpen: true },
            saturday: { open: '09:00', close: '13:00', isOpen: true },
            sunday: { open: '09:00', close: '13:00', isOpen: false }
          },
          booking_settings: {
            slot_duration: 30,
            advance_booking_days: 30,
            cancellation_hours: 24
          }
        },
        owner_id: authData.user.id
      })
      .select()
      .single()

    if (orgError || !organization) {
      console.error('Organization error:', orgError)
      await serviceClient.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Errore durante la creazione dell\'organizzazione' },
        { status: 500 }
      )
    }

    // Create user profile
    const { error: userError } = await serviceClient
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        full_name: validatedData.name,
        phone: validatedData.phone || null,
        organization_id: organization.id,
        role: 'owner',
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(validatedData.name)}&background=6366f1&color=fff`,
      })

    if (userError) {
      console.error('User profile error:', userError)
      await serviceClient.from('organizations').delete().eq('id', organization.id)
      await serviceClient.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Errore durante la creazione del profilo utente' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Registrazione completata con successo',
      user: authData.user,
      organization: organization
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dati non validi', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    )
  }
}