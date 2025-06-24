import { NextResponse } from 'next/server'
import twilio from 'twilio'
import { z } from 'zod'

const accountSid = process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID!
const authToken = process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN!
const fromNumber = process.env.NEXT_PUBLIC_TWILIO_SMS_NUMBER! // Es: '+39...'

const client = twilio(accountSid, authToken)

const smsSchema = z.object({
  to: z.string().min(8, 'Numero destinatario richiesto'),
  message: z.string().min(1, 'Messaggio richiesto')
})

export async function POST(req: Request) {
  const body = await req.json()
  // Validazione Zod
  const parseResult = smsSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Dati non validi', details: parseResult.error.flatten() },
      { status: 400 }
    )
  }
  const { to, message } = parseResult.data
  try {
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: to.startsWith('+') ? to : `+${to}`
    })
    return NextResponse.json({ success: true, sid: result.sid })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
} 