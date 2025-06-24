import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimitManager, rateLimitResponse } from '@/lib/rate-limit'
import { requireAuth } from '@/lib/supabase/requireAuth'
import { z } from 'zod'

// Staff creation schema
const createStaffSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  specializations: z.array(z.string()).optional().nullable(),
  notes: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
})

// Staff update schema
const updateStaffSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  specializations: z.array(z.string()).optional().nullable(),
  notes: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const result = await rateLimitManager.checkRateLimit(
      request,
      'dashboard',
      '/api/staff'
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
      .from('staff')
      .select('*', { count: 'exact' })
      .eq('organization_id', userData.organization.id)

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    const { data: staff, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching staff:', error)
      return NextResponse.json(
        { error: 'Errore nel recupero dello staff' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      staff,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error in staff GET:', error)
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
      '/api/staff'
    )
    
    if (!result.success) {
      return rateLimitResponse(result.retryAfter)
    }

    const { userData, supabase } = await requireAuth()

    const body = await request.json()
    
    // Validazione base
    if (!body.full_name || !body.email) {
      return NextResponse.json(
        { error: 'Nome e email sono obbligatori' },
        { status: 400 }
      )
    }

    // Crea il membro dello staff
    const { data, error } = await supabase
      .from('staff')
      .insert({
        ...body,
        organization_id: userData.organization.id
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error creating staff member:', error)
      return NextResponse.json(
        { error: 'Errore nella creazione del membro dello staff' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, staff: data })
  } catch (error) {
    console.error('Error in staff POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { userData, supabase } = await requireAuth()
    
    console.log('👨‍💼 Updating staff for organization:', userData.organization.name)

    // Parse and validate request body
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 })
    }

    const validationResult = updateStaffSchema.safeParse(updateData)

    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid data', 
        details: validationResult.error.flatten() 
      }, { status: 400 })
    }

    // Update staff member
    const { data: updatedStaff, error } = await supabase
      .from('staff')
      .update(validationResult.data)
      .eq('id', id)
      .eq('organization_id', userData.organization.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!updatedStaff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    return NextResponse.json(updatedStaff)
  } catch (error) {
    console.error('Error updating staff:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { userData, supabase } = await requireAuth()
    
    console.log('👨‍💼 Deleting staff for organization:', userData.organization.name)

    // Get staff ID from query parameters
    const { searchParams } = new URL(request.url)
    const staffId = searchParams.get('id')

    if (!staffId) {
      return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 })
    }

    // Delete staff member
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', staffId)
      .eq('organization_id', userData.organization.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting staff:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}