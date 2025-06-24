import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { clientSchema } from '@/lib/validation/client'
import { z } from 'zod'
import { requireAuth } from '@/lib/supabase/requireAuth'

// GET /api/clients/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userData, supabase } = await requireAuth()
    
    const { id } = await params
    
    console.log('👥 Getting client for organization:', userData.organization.name)
    
    // Get client with bookings
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('organization_id', userData.organization.id)
      .single()
    
    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Get client's bookings with related data
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        service:services(id, name, price, duration_minutes, category),
        staff:staff(id, full_name, role)
      `)
      .eq('client_id', id)
      .eq('organization_id', userData.organization.id)
      .order('start_at', { ascending: false })
      .limit(10) // Get only recent bookings

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError)
    }

    return NextResponse.json({
      client,
      bookings: bookings || []
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/clients/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userData, supabase } = await requireAuth()
    
    const { id } = await params
    
    console.log('👥 Updating client for organization:', userData.organization.name)
    
    const body = await request.json()
    
    // Validazione Zod
    const parseResult = clientSchema.partial().safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Dati non validi', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }
    const validData = parseResult.data

    // Check if client with same phone already exists (excluding current client)
    if (validData.phone) {
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('organization_id', userData.organization.id)
        .eq('phone', validData.phone)
        .neq('id', id)
        .single()

      if (existingClient) {
        return NextResponse.json(
          { error: 'Un cliente con questo numero di telefono esiste già' },
          { status: 409 }
        )
      }
    }

    // Update client
    const { data: client, error } = await supabase
      .from('clients')
      .update({
        full_name: validData.full_name,
        phone: validData.phone,
        email: validData.email || null,
        whatsapp_phone: validData.whatsapp_phone || validData.phone,
        birth_date: validData.birth_date || null,
        notes: validData.notes || null,
        tags: validData.tags || []
      })
      .eq('id', id)
      .eq('organization_id', userData.organization.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating client:', error)
      return NextResponse.json(
        { error: 'Failed to update client' },
        { status: 500 }
      )
    }

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(client)

  } catch (error) {
    console.error('Error in clients PUT:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/clients/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userData, supabase } = await requireAuth()
    
    const { id } = await params
    
    console.log('👥 Deleting client for organization:', userData.organization.name)
    
    // Check if client has any bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id')
      .eq('client_id', id)
      .eq('organization_id', userData.organization.id)
      .limit(1)

    if (bookingsError) throw bookingsError

    if (bookings && bookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete client with existing bookings' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('organization_id', userData.organization.id)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ message: 'Client deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting client:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}