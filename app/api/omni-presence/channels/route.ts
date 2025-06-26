import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase/requireAuth'
import { z } from 'zod'

const channelSchema = z.object({
  channel_type: z.enum(['whatsapp', 'email', 'sms', 'instagram', 'facebook', 'website', 'google']),
  name: z.string().min(1, 'Nome canale obbligatorio'),
  config: z.object({}).optional(),
  automation_enabled: z.boolean().optional(),
  ai_enabled: z.boolean().optional(),
  ai_persona_id: z.string().uuid().optional()
})

export async function GET(request: NextRequest) {
  try {
    const { userData, supabase } = await requireAuth()
    
    const { data: channels, error } = await supabase
      .from('omni_channels')
      .select(`
        *,
        ai_persona:ai_personas(id, name, type)
      `)
      .eq('organization_id', userData.organization.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data: channels
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
    
    const validatedData = channelSchema.parse(body)
    
    const { data: channel, error } = await supabase
      .from('omni_channels')
      .insert({
        ...validatedData,
        organization_id: userData.organization.id
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data: channel
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