import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase/requireAuth'
import { z } from 'zod'

const aiPersonaSchema = z.object({
  name: z.string().min(1, 'Nome AI Persona obbligatorio'),
  type: z.enum(['assistant', 'salesperson', 'support', 'expert']),
  personality: z.string().min(1, 'Personalità obbligatoria'),
  expertise: z.array(z.string()).optional(),
  channels: z.array(z.string()).optional(),
  settings: z.object({}).optional()
})

export async function GET(request: NextRequest) {
  try {
    const { userData, supabase } = await requireAuth()
    
    const { data: aiPersonas, error } = await supabase
      .from('ai_personas')
      .select('*')
      .eq('organization_id', userData.organization.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data: aiPersonas
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
    
    const validatedData = aiPersonaSchema.parse(body)
    
    const { data: aiPersona, error } = await supabase
      .from('ai_personas')
      .insert({
        ...validatedData,
        organization_id: userData.organization.id
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data: aiPersona
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