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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userData, supabase } = await requireAuth()
    const { id } = await params
    
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .eq('organization_id', userData.organization.id)
      .single()
    
    if (error) throw error
    if (!campaign) {
      return NextResponse.json({ 
        success: false, 
        error: 'Campagna non trovata' 
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: campaign
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userData, supabase } = await requireAuth()
    const { id } = await params
    const body = await request.json()
    
    const validatedData = campaignSchema.partial().parse(body)
    
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', userData.organization.id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data: campaign
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userData, supabase } = await requireAuth()
    const { id } = await params
    
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)
      .eq('organization_id', userData.organization.id)
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      message: 'Campagna eliminata con successo'
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
} 