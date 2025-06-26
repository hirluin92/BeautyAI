import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: personas, error } = await supabase
      .from('ai_personas')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(personas)
  } catch (error) {
    console.error('Error fetching AI personas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI personas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data: persona, error } = await supabase
      .from('ai_personas')
      .insert([body])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(persona)
  } catch (error) {
    console.error('Error creating AI persona:', error)
    return NextResponse.json(
      { error: 'Failed to create AI persona' },
      { status: 500 }
    )
  }
} 