import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Get service
    const { data: service, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', params.id)
      .eq('organization_id', userData.organization_id)
      .single()

    if (error || !service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if service exists and belongs to organization
    const { data: existingService } = await supabase
      .from('services')
      .select('id')
      .eq('id', params.id)
      .eq('organization_id', userData.organization_id)
      .single()

    if (!existingService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Parse body
    const body = await request.json()
    
    // Validate price if provided
    if (body.price !== undefined && body.price < 0) {
      return NextResponse.json(
        { error: 'Price cannot be negative' },
        { status: 400 }
      )
    }

    // Validate duration if provided
    if (body.duration_minutes !== undefined && 
        (body.duration_minutes < 5 || body.duration_minutes > 480)) {
      return NextResponse.json(
        { error: 'Duration must be between 5 and 480 minutes' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    const allowedFields = ['name', 'description', 'category', 'price', 'duration_minutes', 'is_active']
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Update service
    const { data: service, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating service:', error)
      return NextResponse.json(
        { error: 'Failed to update service' },
        { status: 500 }
      )
    }

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if service exists and belongs to organization
    const { data: existingService } = await supabase
      .from('services')
      .select('id')
      .eq('id', params.id)
      .eq('organization_id', userData.organization_id)
      .single()

    if (!existingService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Check if service has bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id')
      .eq('service_id', params.id)
      .limit(1)

    if (bookingsError) {
      console.error('Error checking bookings:', bookingsError)
      return NextResponse.json(
        { error: 'Failed to check service bookings' },
        { status: 500 }
      )
    }

    if (bookings && bookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete service with existing bookings. Please deactivate it instead.' },
        { status: 400 }
      )
    }

    // Delete service
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting service:', error)
      return NextResponse.json(
        { error: 'Failed to delete service' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Service deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}