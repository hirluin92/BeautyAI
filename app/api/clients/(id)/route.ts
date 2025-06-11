import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      )
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, full_name')
      .eq('id', params.id)
      .eq('organization_id', userData.organization_id)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Cliente non trovato' },
        { status: 404 }
      )
    }

    const { data: futureBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id')
      .eq('client_id', params.id)
      .gte('start_at', new Date().toISOString())
      .eq('status', 'confirmed')

    if (bookingsError) {
      return NextResponse.json(
        { error: 'Errore nel controllo delle prenotazioni' },
        { status: 500 }
      )
    }

    if (futureBookings && futureBookings.length > 0) {
      return NextResponse.json(
        { 
          error: 'Impossibile eliminare: il cliente ha prenotazioni future attive',
          details: `Trovate ${futureBookings.length} prenotazioni future` 
        },
        { status: 400 }
      )
    }

    const { error: deleteError } = await supabase
      .from('clients')
      .update({
        full_name: `[ELIMINATO] ${client.full_name}`,
        phone: `deleted_${Date.now()}`,
        email: null,
        whatsapp_phone: null,
        notes: `Cliente eliminato il ${new Date().toLocaleString('it-IT')}`,
        tags: ['Eliminato']
      })
      .eq('id', params.id)
      .eq('organization_id', userData.organization_id)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Errore durante l\'eliminazione' },
        { status: 500 }
      )
    }

    await supabase.from('analytics_events').insert({
      organization_id: userData.organization_id,
      event_type: 'client_deleted',
      event_data: {
        client_id: params.id,
        client_name: client.full_name,
        deleted_by: user.id,
        deleted_at: new Date().toISOString()
      },
      user_id: user.id
    })

    return NextResponse.json({
      success: true,
      message: 'Cliente eliminato con successo'
    })

  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      )
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', params.id)
      .eq('organization_id', userData.organization_id)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Cliente non trovato' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: client
    })

  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      )
    }

    if (!body.full_name || !body.phone) {
      return NextResponse.json(
        { error: 'Nome e telefono sono obbligatori' },
        { status: 400 }
      )
    }

    const { data: client, error: updateError } = await supabase
      .from('clients')
      .update({
        full_name: body.full_name.trim(),
        phone: body.phone.trim(),
        email: body.email?.trim() || null,
        whatsapp_phone: body.whatsapp_phone?.trim() || null,
        birth_date: body.birth_date || null,
        notes: body.notes?.trim() || null,
        tags: body.tags || null
      })
      .eq('id', params.id)
      .eq('organization_id', userData.organization_id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Errore durante l\'aggiornamento' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: client,
      message: 'Cliente aggiornato con successo'
    })

  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}