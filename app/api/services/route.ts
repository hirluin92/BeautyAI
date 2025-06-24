import { createClient } from '@/lib/supabase/server'
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
    
    console.log('🛠️ Getting services for organization:', userData.organization.name)

    // Get services - only active ones
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .eq('organization_id', userData.organization.id)
      .is('deleted_at', null)
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching services:', error)
      return NextResponse.json(
        { error: 'Failed to fetch services' },
        { status: 500 }
      )
    }

    return NextResponse.json({ services })

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
    
    console.log('🛠️ Creating service for organization:', userData.organization.name)
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

    // Create service
    const { data: service, error } = await supabase
      .from('services')
      .insert({
        organization_id: userData.organization.id,
        name: validData.name,
        description: validData.description || null,
        price: validData.price,
        duration_minutes: validData.duration_minutes,
        category: validData.category || null,
        is_active: validData.is_active ?? true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating service:', error)
      return NextResponse.json(
        { error: 'Failed to create service' },
        { status: 500 }
      )
    }

    return NextResponse.json(service, { status: 201 })

  } catch (error) {
    console.error('Error in services POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}