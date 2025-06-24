import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/supabase/requireAuth'

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

export async function GET(request: Request) {
  try {
    const { userData, supabase } = await requireAuth()
    
    console.log('👨‍💼 Getting staff for organization:', userData.organization.name)

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('is_active')
    const search = searchParams.get('search')

    // Build query
    let query = supabase
      .from('staff')
      .select('*')
      .eq('organization_id', userData.organization.id)
      .order('full_name')

    // Apply filters
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    const { data: staff, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userData, supabase } = await requireAuth()
    
    console.log('👨‍💼 Creating staff for organization:', userData.organization.name)

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createStaffSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid data', 
        details: validationResult.error.flatten() 
      }, { status: 400 })
    }

    const staffData = validationResult.data

    // Create staff member
    const { data: newStaff, error } = await supabase
      .from('staff')
      .insert([{
        organization_id: userData.organization.id,
        full_name: staffData.full_name,
        email: staffData.email,
        phone: staffData.phone,
        role: staffData.role || 'staff',
        specializations: staffData.specializations,
        notes: staffData.notes,
        is_active: staffData.is_active ?? true
      }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(newStaff, { status: 201 })
  } catch (error) {
    console.error('Error creating staff:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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