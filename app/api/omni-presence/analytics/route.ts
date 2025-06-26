import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase/requireAuth'

export async function GET(request: NextRequest) {
  try {
    const { userData, supabase } = await requireAuth()
    const { searchParams } = new URL(request.url)
    
    const period = searchParams.get('period') || '30' // days
    const channelType = searchParams.get('channel_type')
    
    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0]
    
    let query = supabase
      .from('omni_analytics')
      .select('*')
      .eq('organization_id', userData.organization.id)
      .gte('date', startDate)
      .order('date', { ascending: true })
    
    if (channelType) {
      query = query.eq('channel_type', channelType)
    }
    
    const { data: analytics, error } = await query
    
    if (error) throw error
    
    // Group analytics by date and channel
    const groupedAnalytics = analytics?.reduce((acc, item) => {
      const key = `${item.date}_${item.channel_type}`
      if (!acc[key]) {
        acc[key] = {
          date: item.date,
          channel_type: item.channel_type,
          metrics: {}
        }
      }
      acc[key].metrics[item.metric_type] = {
        value: item.value,
        revenue_value: item.revenue_value
      }
      return acc
    }, {} as Record<string, any>)
    
    return NextResponse.json({
      success: true,
      data: {
        raw: analytics,
        grouped: Object.values(groupedAnalytics || {})
      }
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
} 