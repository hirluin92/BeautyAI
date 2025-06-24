import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/supabase/requireAuth'

// Validation schema
const testChatSchema = z.object({
  message: z.string().min(1, 'Messaggio è obbligatorio'),
  conversation_id: z.string().uuid('ID conversazione non valido').optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userData, supabase } = await requireAuth()
    
    console.log('🤖 AI Test Chat - User:', userData.full_name, 'Org:', userData.organization.name)
    
    // Get request body
    const body = await request.json();
    
    // Validate request body
    const validatedData = testChatSchema.parse(body);

    // Create or get conversation
    let conversationId = validatedData.conversation_id;
    
    if (!conversationId) {
      const { data: newConversation, error: convError } = await supabase
        .from('ai_conversations')
        .insert({
          organization_id: userData.organization.id,
          title: `Test Chat - ${new Date().toLocaleString()}`,
          status: 'active',
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        return NextResponse.json(
          { error: 'Errore durante la creazione della conversazione' },
          { status: 500 }
        );
      }

      conversationId = newConversation.id;
    }

    // Add message to conversation
    const { data: message, error: messageError } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: validatedData.message,
        organization_id: userData.organization.id,
      })
      .select()
      .single();

    if (messageError) {
      console.error('Error adding message:', messageError);
      return NextResponse.json(
        { error: 'Errore durante l\'aggiunta del messaggio' },
        { status: 500 }
      );
    }

    // Simulate AI response (in a real implementation, this would call an AI service)
    const aiResponse = `Risposta AI al messaggio: "${validatedData.message}"`;
    
    const { data: aiMessage, error: aiMessageError } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponse,
        organization_id: userData.organization.id,
      })
      .select()
      .single();

    if (aiMessageError) {
      console.error('Error adding AI message:', aiMessageError);
      return NextResponse.json(
        { error: 'Errore durante l\'aggiunta della risposta AI' },
        { status: 500 }
      );
    }

    // Update conversation last activity
    await supabase
      .from('ai_conversations')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', conversationId);

    return NextResponse.json({
      success: true,
      conversation_id: conversationId,
      user_message: message,
      ai_response: aiMessage,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dati non validi', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error in POST /api/ai/test-chat:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
} 