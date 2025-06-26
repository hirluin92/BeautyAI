import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase/requireAuth'

export async function GET(request: NextRequest) {
  try {
    const { userData, supabase } = await requireAuth()
    
    // Get overview stats
    const [channelsResult, campaignsResult, aiPersonasResult, analyticsResult] = await Promise.all([
      // Channels
      supabase
        .from('omni_channels')
        .select('*')
        .eq('organization_id', userData.organization.id),
      
      // Campaigns  
      supabase
        .from('campaigns')
        .select('*')
        .eq('organization_id', userData.organization.id)
        .eq('status', 'active'),
      
      // AI Personas
      supabase
        .from('ai_personas')
        .select('*')
        .eq('organization_id', userData.organization.id)
        .eq('is_active', true),
      
      // Analytics (last 30 days)
      supabase
        .from('omni_analytics')
        .select('*')
        .eq('organization_id', userData.organization.id)
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    ])

    if (channelsResult.error) throw channelsResult.error
    if (campaignsResult.error) throw campaignsResult.error
    if (aiPersonasResult.error) throw aiPersonasResult.error
    if (analyticsResult.error) throw analyticsResult.error

    // Calculate overview stats
    const totalStats = analyticsResult.data.reduce((acc, item) => {
      if (item.metric_type === 'sent') acc.sent += item.value
      if (item.metric_type === 'delivered') acc.delivered += item.value
      if (item.metric_type === 'opened') acc.opened += item.value
      if (item.metric_type === 'clicked') acc.clicked += item.value
      if (item.metric_type === 'conversion') acc.conversions += item.value
      return acc
    }, { sent: 0, delivered: 0, opened: 0, clicked: 0, conversions: 0 })

    const totalRevenue = analyticsResult.data.reduce((acc, item) => {
      return acc + (item.revenue_value || 0)
    }, 0)

    const overview = {
      channels: channelsResult.data.length,
      activeChannels: channelsResult.data.filter(c => c.status === 'active').length,
      activeCampaigns: campaignsResult.data.length,
      aiPersonas: aiPersonasResult.data.length,
      totalStats,
      totalRevenue,
      aiSatisfaction: 94 // Mock value for now
    }

    return NextResponse.json({
      overview,
      channels: channelsResult.data,
      campaigns: campaignsResult.data,
      aiPersonas: aiPersonasResult.data,
      recentActivity: [] // TODO: Implement recent activity
    })

  } catch (error) {
    console.error('Omni Presence API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userData, supabase } = await requireAuth()
    const body = await request.json()
    
    const { action, data } = body

    switch (action) {
      case 'create_campaign':
        const campaignResult = await supabase
          .from('campaigns')
          .insert({
            ...data,
            organization_id: userData.organization.id,
            created_by: userData.id
          })
          .select()
          .single()

        if (campaignResult.error) throw campaignResult.error
        return NextResponse.json(campaignResult.data)

      case 'create_ai_persona':
        const personaResult = await supabase
          .from('ai_personas')
          .insert({
            ...data,
            organization_id: userData.organization.id
          })
          .select()
          .single()

        if (personaResult.error) throw personaResult.error
        return NextResponse.json(personaResult.data)

      case 'update_channel':
        const channelResult = await supabase
          .from('omni_channels')
          .update(data)
          .eq('id', data.id)
          .eq('organization_id', userData.organization.id)
          .select()
          .single()

        if (channelResult.error) throw channelResult.error
        return NextResponse.json(channelResult.data)

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Omni Presence API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}