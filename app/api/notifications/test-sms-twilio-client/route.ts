import { NextResponse } from 'next/server'
import twilio from 'twilio'

// Bypass SSL verification in development - this affects all HTTPS requests
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

export async function POST(request: Request) {
  try {
    const { phoneNumber, message } = await request.json()

    if (!phoneNumber || !message) {
      return NextResponse.json({ error: 'Phone number and message are required' }, { status: 400 })
    }

    // Get Twilio configuration
    const accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN || process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER || process.env.NEXT_PUBLIC_TWILIO_SMS_NUMBER

    if (!accountSid || !authToken || !fromNumber) {
      return NextResponse.json({ 
        error: 'Twilio configuration missing',
        config: {
          hasAccountSid: !!accountSid,
          hasAuthToken: !!authToken,
          hasFromNumber: !!fromNumber
        }
      }, { status: 500 })
    }

    // Format phone number
    let to = phoneNumber.replace(/\D/g, '')
    if (!to.startsWith('39') && to.length === 10) {
      to = '39' + to
    }
    if (!to.startsWith('+')) {
      to = '+' + to
    }

    console.log('📱 Test SMS with Twilio Client:', {
      originalPhone: phoneNumber,
      formattedPhone: to,
      from: fromNumber,
      message,
      accountSid: '***' + accountSid.slice(-4),
      messageLength: message.length,
      sslBypass: process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0'
    })

    // Create Twilio client
    const client = twilio(accountSid, authToken)

    // Send SMS using Twilio client
    const twilioMessage = await client.messages.create({
      body: message,
      from: fromNumber,
      to: to
    })

    console.log('✅ SMS Sent Successfully with Twilio Client:', twilioMessage.sid)

    return NextResponse.json({
      success: true,
      messageId: twilioMessage.sid,
      status: twilioMessage.status,
      to,
      from: fromNumber,
      requestDetails: {
        to,
        from: fromNumber,
        messageLength: message.length,
        accountSid: '***' + accountSid.slice(-4),
        sslBypass: process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0'
      }
    })

  } catch (error: any) {
    console.error('💥 Test SMS with Twilio Client Error:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        details: error
      },
      { status: 500 }
    )
  }
} 