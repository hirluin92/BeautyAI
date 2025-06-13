import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { ServiceInsert } from '@/types'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('per_page') || '10')
    
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    // Build query
    let query = supabase
      .from('services')
      .select('*', { count: 'exact' })
      .eq('organization_id', userData.organization_id)
      .order('name', { ascending: true })

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (status && status !== 'all') {
      query = query.eq('is_active', status === 'active')
    }

    // Execute query with pagination
    const { data: services, error, count } = await query.range(from, to)

    if (error) {
      console.error('Error fetching services:', error)
      return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
    }

    return NextResponse.json({
      services,
      pagination: {
        page,
        perPage,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / perPage)
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse body
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.price || !body.duration_minutes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate data types and ranges
    if (body.price < 0) {
      return NextResponse.json(
        { error: 'Price cannot be negative' },
        { status: 400 }
      )
    }

    if (body.duration_minutes < 5 || body.duration_minutes > 480) {
      return NextResponse.json(
        { error: 'Duration must be between 5 and 480 minutes' },
        { status: 400 }
      )
    }

    // Create service data
    const serviceData: ServiceInsert = {
      name: body.name,
      description: body.description || null,
      category: body.category || null,
      price: body.price,
      duration_minutes: body.duration_minutes,
      is_active: body.is_active ?? true,
      organization_id: userData.organization_id
    }

    // Insert service
    const { data: service, error } = await supabase
      .from('services')
      .insert(serviceData)
      .select()
      .single()

    if (error) {
      console.error('Error creating service:', error)
      return NextResponse.json(
        { error: 'Failed to create service' },
        { status: 500 }
      )
    }

    return NextResponse.json({ service }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}