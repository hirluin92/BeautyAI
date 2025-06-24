import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const messageSid = searchParams.get('sid')

    if (!messageSid) {
      return NextResponse.json({ error: 'Message SID is required' }, { status: 400 })
    }

    // Get Twilio configuration
    const accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN || process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN

    if (!accountSid || !authToken) {
      return NextResponse.json({ error: 'Twilio configuration missing' }, { status: 500 })
    }

    // Check message status via Twilio API
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages/${messageSid}.json`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
        }
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ 
        error: `Twilio error: ${error.message}`,
        details: error
      }, { status: 500 })
    }

    const message = await response.json()

    return NextResponse.json({
      success: true,
      message: {
        sid: message.sid,
        status: message.status,
        direction: message.direction,
        from: message.from,
        to: message.to,
        body: message.body,
        dateCreated: message.date_created,
        dateSent: message.date_sent,
        dateUpdated: message.date_updated,
        errorCode: message.error_code,
        errorMessage: message.error_message,
        price: message.price,
        priceUnit: message.price_unit
      }
    })

  } catch (error: any) {
    console.error('💥 SMS Status Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 