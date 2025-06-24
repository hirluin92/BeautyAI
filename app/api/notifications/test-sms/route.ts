import { NextResponse } from 'next/server'

// Bypass SSL verification in development
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

    console.log('📱 Test SMS Details:', {
      originalPhone: phoneNumber,
      formattedPhone: to,
      from: fromNumber,
      message,
      accountSid: '***' + accountSid.slice(-4),
      messageLength: message.length
    })

    // Check for potential issues
    const issues = []
    if (fromNumber.startsWith('+1') && to.startsWith('+39')) {
      issues.push('US Twilio number sending to Italian number - may have delivery issues')
    }
    if (message.length > 160) {
      issues.push('Message is longer than 160 characters - will be split into multiple SMS')
    }
    if (!to.match(/^\+39\d{10}$/)) {
      issues.push('Phone number format may be incorrect for Italian numbers')
    }

    // Send SMS via Twilio API
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
    
    const requestBody = new URLSearchParams({
      To: to,
      From: fromNumber,
      Body: message
    })

    console.log('📡 Sending to Twilio API...')
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestBody
      }
    )

    console.log('📡 Twilio Response Status:', response.status)
    console.log('📡 Twilio Response Headers:', Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log('📡 Twilio Response Body:', responseText)

    if (!response.ok) {
      let error
      try {
        error = JSON.parse(responseText)
      } catch {
        error = { message: responseText }
      }
      
      console.error('❌ Twilio Error:', error)
      return NextResponse.json({ 
        error: `Twilio error: ${error.message}`,
        details: error,
        issues,
        requestDetails: {
          to,
          from: fromNumber,
          messageLength: message.length
        }
      }, { status: 500 })
    }

    let result
    try {
      result = JSON.parse(responseText)
    } catch {
      result = { sid: 'unknown', status: 'unknown' }
    }

    console.log('✅ Test SMS Sent Successfully:', result.sid)

    return NextResponse.json({
      success: true,
      messageId: result.sid,
      status: result.status,
      to,
      from: fromNumber,
      issues,
      requestDetails: {
        to,
        from: fromNumber,
        messageLength: message.length,
        accountSid: '***' + accountSid.slice(-4)
      }
    })

  } catch (error: any) {
    console.error('💥 Test SMS Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 