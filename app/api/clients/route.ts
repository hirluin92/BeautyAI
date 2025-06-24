import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimitManager, rateLimitResponse } from '@/lib/rate-limit'
import { clientSchema } from '@/lib/validation/client'
import { requireAuth } from '@/lib/supabase/requireAuth'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const result = await rateLimitManager.checkRateLimit(
      request,
      'dashboard',
      '/api/clients'
    )
    
    if (!result.success) {
      return rateLimitResponse(result.retryAfter)
    }

    const { userData, supabase } = await requireAuth()
    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Calculate offset
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .eq('organization_id', userData.organization.id)

    // Add search filter if provided
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    // Add sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Add pagination
    query = query.range(offset, offset + limit - 1)

    const { data: clients, error, count } = await query

    if (error) {
      console.error('Error fetching clients:', error)
      return NextResponse.json(
        { error: 'Failed to fetch clients' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      clients,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Error in clients GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - più restrittivo per creazione
    const result = await rateLimitManager.checkRateLimit(
      request,
      'dashboard',
      '/api/clients'
    )
    
    if (!result.success) {
      return rateLimitResponse(result.retryAfter)
    }

    const { userData, supabase } = await requireAuth()
    const body = await request.json()

    console.log('👥 Creating client for organization:', userData.organization.name)

    // Validazione Zod
    const parseResult = clientSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Dati non validi', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }
    const validData = parseResult.data

    // Check if client with same phone already exists
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('organization_id', userData.organization.id)
      .eq('phone', validData.phone)
      .single()

    if (existingClient) {
      return NextResponse.json(
        { error: 'Un cliente con questo numero di telefono esiste già' },
        { status: 409 }
      )
    }

    // Create client
    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        organization_id: userData.organization.id,
        full_name: validData.full_name,
        phone: validData.phone,
        email: validData.email || null,
        whatsapp_phone: validData.whatsapp_phone || validData.phone,
        birth_date: validData.birth_date || null,
        notes: validData.notes || null,
        tags: validData.tags || []
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating client:', error)
      return NextResponse.json(
        { error: 'Failed to create client' },
        { status: 500 }
      )
    }

    return NextResponse.json(client, { status: 201 })

  } catch (error) {
    console.error('Error in clients POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}