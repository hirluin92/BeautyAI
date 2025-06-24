import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const config = {
      twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID || process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN || process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER || process.env.NEXT_PUBLIC_TWILIO_SMS_NUMBER
      },
      emailjs: {
        serviceId: process.env.EMAILJS_SERVICE_ID,
        templateId: process.env.EMAILJS_TEMPLATE_ID,
        publicKey: process.env.EMAILJS_PUBLIC_KEY
      }
    }

    const hasTwilioConfig = !!(config.twilio.accountSid && config.twilio.authToken && config.twilio.phoneNumber)
    const hasEmailConfig = !!(config.emailjs.serviceId && config.emailjs.templateId && config.emailjs.publicKey)

    return NextResponse.json({
      success: true,
      config: {
        twilio: {
          configured: hasTwilioConfig,
          accountSid: config.twilio.accountSid ? '***' + config.twilio.accountSid.slice(-4) : null,
          authToken: config.twilio.authToken ? '***' + config.twilio.authToken.slice(-4) : null,
          phoneNumber: config.twilio.phoneNumber
        },
        emailjs: {
          configured: hasEmailConfig,
          serviceId: config.emailjs.serviceId ? '***' + config.emailjs.serviceId.slice(-4) : null,
          templateId: config.emailjs.templateId ? '***' + config.emailjs.templateId.slice(-4) : null,
          publicKey: config.emailjs.publicKey ? '***' + config.emailjs.publicKey.slice(-4) : null
        }
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasTwilioAccountSid: !!process.env.TWILIO_ACCOUNT_SID,
        hasNextPublicTwilioAccountSid: !!process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID,
        hasTwilioAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
        hasNextPublicTwilioAuthToken: !!process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN,
        hasTwilioPhoneNumber: !!process.env.TWILIO_PHONE_NUMBER,
        hasNextPublicTwilioSmsNumber: !!process.env.NEXT_PUBLIC_TWILIO_SMS_NUMBER
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 