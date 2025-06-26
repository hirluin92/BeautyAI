import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: messages, error } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', params.id)
      .order('timestamp', { ascending: true })

    if (error) throw error

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const message = {
      conversation_id: params.id,
      sender: body.sender || 'client',
      content: body.content,
      type: body.type || 'text',
      metadata: body.metadata || null
    }

    const { data: newMessage, error } = await supabase
      .from('ai_messages')
      .insert([message])
      .select()
      .single()

    if (error) throw error

    // Update conversation last_message_at
    await supabase
      .from('ai_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', params.id)

    return NextResponse.json(newMessage)
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
} 