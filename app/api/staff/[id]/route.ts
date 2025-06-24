import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/supabase/requireAuth'

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userData, supabase } = await requireAuth()
    
    console.log('👨‍💼 Getting staff member for organization:', userData.organization.name)

    const { data: staff, error } = await supabase
      .from('staff')
      .select('*')
      .eq('id', params.id)
      .eq('organization_id', userData.organization.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error fetching staff member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userData, supabase } = await requireAuth()
    
    console.log('👨‍💼 Updating staff member for organization:', userData.organization.name)

    const body = await request.json()
    
    // Validate input
    const validatedData = updateStaffSchema.parse(body)

    // Prepare update data
    const updateData: any = {}
    if (validatedData.full_name !== undefined) updateData.full_name = validatedData.full_name.trim()
    if (validatedData.email !== undefined) updateData.email = validatedData.email?.trim() || null
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone?.trim() || null
    if (validatedData.role !== undefined) updateData.role = validatedData.role?.trim() || null
    if (validatedData.specializations !== undefined) {
      updateData.specializations = validatedData.specializations && validatedData.specializations.length > 0 
        ? validatedData.specializations 
        : null
    }
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes?.trim() || null
    if (validatedData.is_active !== undefined) updateData.is_active = validatedData.is_active

    const { data: updatedStaff, error } = await supabase
      .from('staff')
      .update(updateData)
      .eq('id', params.id)
      .eq('organization_id', userData.organization.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(updatedStaff)
  } catch (error: any) {
    console.error('Error updating staff member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userData, supabase } = await requireAuth()
    
    console.log('👨‍💼 Deleting staff member for organization:', userData.organization.name)

    // Check if staff member has any bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id')
      .eq('staff_id', params.id)
      .eq('organization_id', userData.organization.id)
      .limit(1)

    if (bookingsError) throw bookingsError

    if (bookings && bookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete staff member with existing bookings' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', userData.organization.id)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ message: 'Staff member deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting staff member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 