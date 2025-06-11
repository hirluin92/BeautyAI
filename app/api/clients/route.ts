import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { ClientInsert } from '@/types'

// GET all clients
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
    
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Get user's organization
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

    // Calculate offset
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .eq('organization_id', userData.organization_id)
      .not('full_name', 'like', '[ELIMINATO]%') // Exclude soft-deleted clients
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply search filter
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Apply tags filter
    if (tags.length > 0) {
      query = query.overlaps('tags', tags)
    }

    const { data: clients, error: clientsError, count } = await query

    if (clientsError) {
      return NextResponse.json(
        { error: 'Errore nel recupero dei clienti' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: clients,
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// POST create new client
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Get user's organization
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

    // Validate required fields
    if (!body.full_name || !body.phone) {
      return NextResponse.json(
        { error: 'Nome e telefono sono obbligatori' },
        { status: 400 }
      )
    }

    // Check if phone already exists for this organization
    const { data: existingClient, error: checkError } = await supabase
      .from('clients')
      .select('id')
      .eq('organization_id', userData.organization_id)
      .eq('phone', body.phone.trim())
      .not('full_name', 'like', '[ELIMINATO]%')
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      return NextResponse.json(
        { error: 'Errore nel controllo duplicati' },
        { status: 500 }
      )
    }

    if (existingClient) {
      return NextResponse.json(
        { error: 'Esiste già un cliente con questo numero di telefono' },
        { status: 400 }
      )
    }

    // Create client
    const clientData: ClientInsert = {
      organization_id: userData.organization_id,
      full_name: body.full_name.trim(),
      phone: body.phone.trim(),
      email: body.email?.trim() || null,
      whatsapp_phone: body.whatsapp_phone?.trim() || null,
      birth_date: body.birth_date || null,
      notes: body.notes?.trim() || null,
      tags: body.tags && body.tags.length > 0 ? body.tags : null
    }

    const { data: client, error: insertError } = await supabase
      .from('clients')
      .insert(clientData)
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: 'Errore durante la creazione del cliente' },
        { status: 500 }
      )
    }

    // Update organization client count
    await supabase
      .from('organizations')
      .update({ 
        client_count: supabase.rpc('increment_client_count')
      })
      .eq('id', userData.organization_id)

    // Log the creation for analytics
    await supabase.from('analytics_events').insert({
      organization_id: userData.organization_id,
      event_type: 'client_created',
      event_data: {
        client_id: client.id,
        client_name: client.full_name,
        created_by: user.id
      },
      user_id: user.id
    })

    return NextResponse.json({
      success: true,
      data: client,
      message: 'Cliente creato con successo'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}