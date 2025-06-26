import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: conversations, error } = await supabase
      .from('ai_conversations')
      .select(`
        *,
        ai_personas (
          id,
          name,
          avatar,
          role
        )
      `)
      .order('last_message_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(conversations)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data: conversation, error } = await supabase
      .from('ai_conversations')
      .insert([body])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(conversation)
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
} 