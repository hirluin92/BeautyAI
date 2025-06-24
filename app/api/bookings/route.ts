import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimitManager, rateLimitResponse } from '@/lib/rate-limit'
import { bookingSchema } from '@/lib/validation/booking'
import { requireAuth } from '@/lib/supabase/requireAuth'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const result = await rateLimitManager.checkRateLimit(
      request,
      'dashboard',
      '/api/bookings'
    )
    
    if (!result.success) {
      return rateLimitResponse(result.retryAfter)
    }

    const { userData, supabase } = await requireAuth()

    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        start_at,
        end_at,
        client:clients(id, full_name),
        service:services(id, name, duration_minutes),
        staff:staff(id, full_name)
      `)
      .eq('organization_id', userData.organization.id)
      .gte('start_at', from)
      .lt('start_at', to)
      .order('start_at', { ascending: true })

    if (error) {
      console.error('Error fetching bookings:', error)
      return NextResponse.json([], { status: 500 })
    }
    
    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error in bookings GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Rate limiting
    const result = await rateLimitManager.checkRateLimit(
      request,
      'dashboard',
      '/api/bookings'
    )
    
    if (!result.success) {
      return rateLimitResponse(result.retryAfter)
    }

    console.log('🔧 PATCH /api/bookings chiamata')
    
    const { userData, supabase } = await requireAuth()

    const body = await request.json()
    console.log('📥 Request body ricevuto:', body)
    
    // Validazione Zod
    const parseResult = bookingSchema.partial().safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Dati non validi', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }
    const validData = parseResult.data

    const { id, start_at, end_at } = validData

    if (!id || !start_at || !end_at) {
      console.log('❌ Parametri mancanti:', { id, start_at, end_at })
      return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 })
    }

    console.log('🏢 Organization ID:', userData.organization.id)
    console.log('📝 Aggiornando booking:', { id, start_at, end_at })

    // Aggiorna il booking
    const { data, error } = await supabase
      .from('bookings')
      .update({
        start_at,
        end_at,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', userData.organization.id)
      .select('*')
      .single()

    console.log('🔍 PATCH booking update', {
      id,
      organization_id: userData.organization.id,
      data,
      error
    })

    if (error) {
      console.error('💥 Errore Supabase:', error)
      return NextResponse.json({ 
        error: 'Errore nell\'aggiornamento', 
        details: error.message 
      }, { status: 500 })
    }

    if (!data) {
      console.log('❌ Booking non trovato con ID:', id)
      return NextResponse.json({ error: 'Booking non trovato' }, { status: 404 })
    }

    console.log('✅ Booking aggiornato con successo:', data)
    return NextResponse.json({ success: true, booking: data })

  } catch (error) {
    console.error('💥 Errore nella richiesta PATCH:', error)
    return NextResponse.json({ 
      error: 'Errore del server', 
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userData, supabase } = await requireAuth()
    
    console.log('📅 Creating booking for organization:', userData.organization.name)

    // Rate limiting
    const result = await rateLimitManager.checkRateLimit(
      request,
      'dashboard',
      '/api/bookings'
    )
    
    if (!result.success) {
      return rateLimitResponse(result.retryAfter)
    }

    const body = await request.json()
    console.log('📥 Request body ricevuto:', body)
    
    // Validazione Zod
    const parseResult = bookingSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Dati non validi', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }
    const validData = parseResult.data

    const { start_at, end_at, client_id, service_id, staff_id } = validData

    if (!start_at || !end_at || !client_id || !service_id || !staff_id) {
      console.log('❌ Parametri mancanti:', { start_at, end_at, client_id, service_id, staff_id })
      return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 })
    }

    console.log('🏢 Organization ID:', userData.organization.id)
    console.log('📝 Creando booking:', { start_at, end_at, client_id, service_id, staff_id })

    // Crea il booking
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        start_at,
        end_at,
        client_id,
        service_id,
        staff_id,
        organization_id: userData.organization.id
      })
      .select('*')
      .single()

    console.log('🔍 POST booking creation', {
      organization_id: userData.organization.id,
      data,
      error
    })

    if (error) {
      console.error('💥 Errore Supabase:', error)
      return NextResponse.json({ 
        error: 'Errore nella creazione', 
        details: error.message 
      }, { status: 500 })
    }

    if (!data) {
      console.log('❌ Booking non creato')
      return NextResponse.json({ error: 'Errore nella creazione del booking' }, { status: 500 })
    }

    console.log('✅ Booking creato con successo:', data)
    return NextResponse.json({ success: true, booking: data })

  } catch (error) {
    console.error('💥 Errore nella richiesta POST:', error)
    return NextResponse.json({ 
      error: 'Errore del server', 
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 })
  }
}