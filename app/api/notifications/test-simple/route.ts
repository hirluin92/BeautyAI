import { NextResponse } from 'next/server';
import twilioClient from '@/lib/twilio-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, body: messageBody, messagingServiceSid } = body;

    if (!to || !messageBody || !messagingServiceSid) {
      return NextResponse.json({ error: 'Missing parameters: to, body, and messagingServiceSid are required.' }, { status: 400 });
    }

    const message = await twilioClient.messages.create({
      body: messageBody,
      messagingServiceSid: messagingServiceSid,
      to: to,
    });

    return NextResponse.json({ success: true, sid: message.sid });
  } catch (error: any) {
    console.error('Twilio API error:', error);
    return NextResponse.json({ error: 'Failed to send message', details: error.message }, { status: 500 });
  }
} 