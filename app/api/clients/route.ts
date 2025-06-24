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

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .eq('organization_id', userData.organization.id)

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    const { data: clients, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching clients:', error)
      return NextResponse.json(
        { error: 'Errore nel recupero dei clienti' },
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

    const body = await request.json()
    
    // Validazione Zod
    const parseResult = clientSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Dati non validi', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }
    const validData = parseResult.data

    // Crea il cliente
    const { data, error } = await supabase
      .from('clients')
      .insert({
        ...validData,
        organization_id: userData.organization.id
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error creating client:', error)
      return NextResponse.json(
        { error: 'Errore nella creazione del cliente' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, client: data })
  } catch (error) {
    console.error('Error in clients POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}