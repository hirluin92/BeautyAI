import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase/requireAuth'

export async function GET(request: NextRequest) {
  try {
    const { userData, supabase } = await requireAuth()
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const period = searchParams.get('period') || 'day'
    
    // Calculate date range
    let startDate: string
    let endDate: string
    
    switch (period) {
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(weekStart.getDate() - weekStart.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        startDate = weekStart.toISOString().split('T')[0]
        endDate = weekEnd.toISOString().split('T')[0]
        break
      case 'month':
        const monthDate = new Date(date)
        startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString().split('T')[0]
        endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).toISOString().split('T')[0]
        break
      default:
        startDate = date
        endDate = date
    }
    
    console.log('🔍 Querying staff performance for period:', period, 'date range:', startDate, 'to', endDate)
    
    // Query bookings with staff data - more defensive query
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        actual_amount,
        completed_at,
        staff_id,
        services!inner(name, category)
      `)
      .eq('organization_id', userData.organization.id)
      .eq('status', 'completed')
      .gte('completed_at', `${startDate}T00:00:00`)
      .lte('completed_at', `${endDate}T23:59:59`)
      .not('completed_at', 'is', null)
      .not('staff_id', 'is', null)
    
    if (error) {
      console.error('Database query error:', error)
      throw error
    }
    
    console.log('📊 Found', bookings?.length || 0, 'completed bookings with staff')
    
    // Filter bookings with actual amounts
    const bookingsWithAmounts = bookings?.filter(b => b.actual_amount != null) || []
    
    // Group by staff
    const staffStats = bookingsWithAmounts.reduce((acc, booking) => {
      const staffId = booking.staff_id
      // For now, use staff_id as name since we don't have the relationship
      const staffName = `Staff ${staffId.slice(0, 8)}`
      
      if (!acc[staffId]) {
        acc[staffId] = {
          staffId,
          staffName,
          totalRevenue: 0,
          totalBookings: 0,
          services: {}
        }
      }
      
      acc[staffId].totalRevenue += booking.actual_amount || 0
      acc[staffId].totalBookings += 1
      
      // Track services
      // Handle services as array (Supabase returns relationships as arrays)
      const serviceData = Array.isArray(booking.services) ? booking.services[0] : booking.services
      const serviceName = serviceData?.name || 'Servizio sconosciuto'
      if (!acc[staffId].services[serviceName]) {
        acc[staffId].services[serviceName] = { count: 0, revenue: 0 }
      }
      acc[staffId].services[serviceName].count += 1
      acc[staffId].services[serviceName].revenue += booking.actual_amount || 0
      
      return acc
    }, {} as Record<string, any>)
    
    // Convert to array and calculate metrics
    const performance = Object.values(staffStats).map((staff: any) => {
      const topServices = Object.entries(staff.services)
        .map(([serviceName, data]: [string, any]) => ({
          serviceName,
          count: data.count,
          revenue: data.revenue
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
      
      return {
        staffId: staff.staffId,
        staffName: staff.staffName,
        totalRevenue: staff.totalRevenue,
        totalBookings: staff.totalBookings,
        averageTicket: staff.totalBookings > 0 ? staff.totalRevenue / staff.totalBookings : 0,
        topServices
      }
    }).sort((a, b) => b.totalRevenue - a.totalRevenue)
    
    console.log('✅ Staff performance calculated successfully')
    return NextResponse.json({
      success: true,
      period,
      dateRange: period === 'day' ? date : `${startDate} - ${endDate}`,
      performance
    })
    
  } catch (error) {
    console.error('API staff performance error:', error)
    return NextResponse.json(
      { 
        error: 'Errore recupero performance staff',
        details: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    )
  }
} 