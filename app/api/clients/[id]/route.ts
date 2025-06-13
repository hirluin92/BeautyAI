import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/clients/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()
    if (!userData || !userData.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', params.id)
      .eq('organization_id', userData.organization_id!)
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/clients/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()
    if (!userData || !userData.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }
    // Rimuovi campi non aggiornabili
    delete body.id
    delete body.organization_id
    delete body.created_at
    delete body.updated_at
    const { data, error } = await supabase
      .from('clients')
      .update(body)
      .eq('id', params.id)
      .eq('organization_id', userData.organization_id!)
      .select()
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/clients/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()
    if (!userData || !userData.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }
    // Check if client has bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id')
      .eq('client_id', params.id)
      .eq('organization_id', userData.organization_id)
      .limit(1)
    if (bookingsError) {
      return NextResponse.json({ error: 'Errore nel controllo delle prenotazioni', details: bookingsError.message }, { status: 500 })
    }
    if (bookings && bookings.length > 0) {
      return NextResponse.json({ error: 'Non puoi eliminare un cliente con prenotazioni associate', hasBookings: true }, { status: 400 })
    }
    // Check if client has payments
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('id')
      .eq('client_id', params.id)
      .eq('organization_id', userData.organization_id)
      .limit(1)
    if (paymentsError) {
      return NextResponse.json({ error: 'Errore nel controllo dei pagamenti', details: paymentsError.message }, { status: 500 })
    }
    if (payments && payments.length > 0) {
      return NextResponse.json({ error: 'Non puoi eliminare un cliente con pagamenti associati', hasPayments: true }, { status: 400 })
    }
    // Soft delete
    const { data, error } = await supabase
      .from('clients')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id)
      .eq('organization_id', userData.organization_id)
      .select()
      .single()
    if (error) {
      return NextResponse.json({ error: 'Errore durante l\'eliminazione del cliente', details: error.message }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ error: 'Cliente non trovato' }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: 'Cliente eliminato con successo' })
  } catch (error: any) {
    return NextResponse.json({ error: 'Errore interno del server', details: error.message }, { status: 500 })
  }
}