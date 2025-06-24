import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimitManager, rateLimitResponse } from '@/lib/rate-limit'
import { serviceSchema } from '@/lib/validation/service'
import { requireAuth } from '@/lib/supabase/requireAuth'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const result = await rateLimitManager.checkRateLimit(
      request,
      'dashboard',
      '/api/services'
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
      .from('services')
      .select('*', { count: 'exact' })
      .eq('organization_id', userData.organization.id)

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: services, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching services:', error)
      return NextResponse.json(
        { error: 'Errore nel recupero dei servizi' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      services,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error in services GET:', error)
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
      '/api/services'
    )
    
    if (!result.success) {
      return rateLimitResponse(result.retryAfter)
    }

    const { userData, supabase } = await requireAuth()

    const body = await request.json()
    
    // Validazione Zod
    const parseResult = serviceSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Dati non validi', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }
    const validData = parseResult.data

    // Crea il servizio
    const { data, error } = await supabase
      .from('services')
      .insert({
        ...validData,
        organization_id: userData.organization.id
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error creating service:', error)
      return NextResponse.json(
        { error: 'Errore nella creazione del servizio' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, service: data })
  } catch (error) {
    console.error('Error in services POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}