import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase/requireAuth'
import { z } from 'zod'

const campaignSchema = z.object({
  name: z.string().min(1, 'Nome campagna obbligatorio'),
  type: z.enum(['promotional', 'reminder', 'welcome', 'retention', 'reactivation']),
  channels: z.array(z.string()).min(1, 'Almeno un canale richiesto'),
  audience_segments: z.array(z.string()).optional(),
  schedule_type: z.enum(['immediate', 'scheduled', 'recurring']),
  schedule_date: z.string().optional(),
  schedule_frequency: z.string().optional(),
  content: z.object({}).optional()
})

export async function GET(request: NextRequest) {
  try {
    const { userData, supabase } = await requireAuth()
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    let query = supabase
      .from('campaigns')
      .select('*', { count: 'exact' })
      .eq('organization_id', userData.organization.id)
      .order('created_at', { ascending: false })
      
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data: campaigns, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data: campaigns,
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userData, supabase } = await requireAuth()
    const body = await request.json()
    
    const validatedData = campaignSchema.parse(body)
    
    // Calculate audience total based on segments
    let audienceTotal = 0
    if (validatedData.audience_segments && validatedData.audience_segments.length > 0) {
      const { count } = await supabase
        .from('clients')
        .select('id', { count: 'exact' })
        .eq('organization_id', userData.organization.id)
        .not('deleted_at', 'is', null)
      
      audienceTotal = count || 0
    }
    
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        ...validatedData,
        organization_id: userData.organization.id,
        audience_total: audienceTotal,
        created_by: userData.id
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data: campaign
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dati non validi',
        details: error.errors
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
} 