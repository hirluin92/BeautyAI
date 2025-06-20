import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 401 })

  const { data: userData } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()
  if (!userData || !userData.organization_id) return NextResponse.json([], { status: 404 })

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      client:clients(id, full_name, phone),
      service:services(id, name, duration_minutes, price),
      staff:users!bookings_staff_id_fkey(id, full_name)
    `)
    .eq('organization_id', userData.organization_id)
    .gte('start_at', from)
    .lt('start_at', to)
    .order('start_at', { ascending: true })

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(bookings)
}

export async function PATCH(request: Request) {
  console.log('🔧 PATCH /api/bookings chiamata')
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.log('❌ User non autenticato')
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  try {
    const body = await request.json()
    console.log('📥 Request body ricevuto:', body)
    
    const { id, start_at, end_at } = body

    if (!id || !start_at || !end_at) {
      console.log('❌ Parametri mancanti:', { id, start_at, end_at })
      return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 })
    }

    // Verifica che l'utente possa modificare questo booking
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!userData?.organization_id) {
      console.log('❌ Organizzazione non trovata per user:', user.id)
      return NextResponse.json({ error: 'Organizzazione non trovata' }, { status: 404 })
    }

    console.log('🏢 Organization ID:', userData.organization_id)
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
      .eq('organization_id', userData.organization_id)
      .select('*')
      .single()

    console.log('🔍 PATCH booking update', {
      id,
      organization_id: userData.organization_id,
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
      details: error.message 
    }, { status: 500 })
  }
}