import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get organization ID from query params
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    // Verify user belongs to this organization
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!userData || userData.organization_id !== organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get date ranges
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1)

    // Fetch today's bookings with relations
    const { data: todayBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        start_at,
        end_at,
        price,
        status,
        client:clients(id, full_name, phone),
        service:services(id, name, duration_minutes),
        staff:staff(id, full_name)
      `)
      .eq('organization_id', organizationId)
      .gte('start_at', todayStart.toISOString())
      .lt('start_at', todayEnd.toISOString())
      .order('start_at')

    if (bookingsError) {
      console.error('Error fetching today bookings:', bookingsError)
      return NextResponse.json({ error: 'Error fetching bookings' }, { status: 500 })
    }

    // Fetch total clients count
    const { count: totalClients, error: clientsError } = await supabase
      .from('clients')
      .select('id', { count: 'exact' })
      .eq('organization_id', organizationId)
      .eq('deleted_at', null)

    if (clientsError) {
      console.error('Error fetching clients count:', clientsError)
      return NextResponse.json({ error: 'Error fetching clients' }, { status: 500 })
    }

    // Fetch active services count
    const { count: activeServices, error: servicesError } = await supabase
      .from('services')
      .select('id', { count: 'exact' })
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .eq('deleted_at', null)

    if (servicesError) {
      console.error('Error fetching services count:', servicesError)
      return NextResponse.json({ error: 'Error fetching services' }, { status: 500 })
    }

    // Fetch monthly bookings for revenue calculation
    const { data: monthlyBookings, error: monthlyError } = await supabase
      .from('bookings')
      .select('price, status')
      .eq('organization_id', organizationId)
      .gte('start_at', monthStart.toISOString())
      .lt('start_at', monthEnd.toISOString())
      .in('status', ['confirmed', 'completed'])

    if (monthlyError) {
      console.error('Error fetching monthly bookings:', monthlyError)
      return NextResponse.json({ error: 'Error fetching monthly data' }, { status: 500 })
    }

    // Calculate revenues
    const todayRevenue = (todayBookings || [])
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.price || 0), 0)

    const monthlyRevenue = (monthlyBookings || [])
      .reduce((sum, b) => sum + (b.price || 0), 0)

    // Return statistics
    const stats = {
      todayBookings: todayBookings || [],
      totalClients: totalClients || 0,
      activeServices: activeServices || 0,
      todayRevenue,
      monthlyRevenue,
      loading: false
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Dashboard stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 