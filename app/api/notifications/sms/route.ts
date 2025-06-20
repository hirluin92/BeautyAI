import { NextResponse } from 'next/server'
import twilio from 'twilio'

const accountSid = process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID!
const authToken = process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN!
const fromNumber = process.env.NEXT_PUBLIC_TWILIO_SMS_NUMBER! // Es: '+39...'

const client = twilio(accountSid, authToken)

export async function POST(req: Request) {
  const { to, message } = await req.json()
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