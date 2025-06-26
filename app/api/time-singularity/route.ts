import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase/requireAuth'

export async function GET(request: NextRequest) {
  try {
    const { userData, supabase } = await requireAuth()
    const { searchParams } = new URL(request.url)
    
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const staffId = searchParams.get('staff_id')
    
    // Get quantum time slots for the date
    let slotsQuery = supabase
      .from('quantum_time_slots')
      .select(`
        *,
        staff:staff(id, full_name, role, specializations),
        booking:bookings(id, client:clients(full_name), service:services(name, duration_minutes))
      `)
      .eq('organization_id', userData.organization.id)
      .eq('date', date)
      .order('start_time')
    
    if (staffId && staffId !== 'all') {
      slotsQuery = slotsQuery.eq('staff_id', staffId)
    }
    
    const { data: timeSlots, error: slotsError } = await slotsQuery
    
    if (slotsError) throw slotsError
    
    // Get calendar analytics for the date
    const { data: analytics, error: analyticsError } = await supabase
      .from('quantum_calendar_analytics')
      .select('*')
      .eq('organization_id', userData.organization.id)
      .eq('date', date)
      .single()
    
    // Get staff quantum sync data
    const { data: staffSync, error: staffError } = await supabase
      .from('staff_quantum_sync')
      .select(`
        *,
        staff:staff(id, full_name, role, specializations, hourly_rate)
      `)
      .eq('organization_id', userData.organization.id)
    
    if (staffError) throw staffError
    
    return NextResponse.json({
      success: true,
      data: {
        timeSlots: timeSlots || [],
        analytics: analytics || null,
        staff: staffSync || [],
        date
      }
    })
  } catch (error: any) {
    console.error('Error fetching time singularity data:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
} 