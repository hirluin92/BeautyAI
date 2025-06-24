import { NextResponse } from 'next/server'
import { NotificationService } from '@/lib/notifications/notification.service'

// Configurazione notifiche
const notificationConfig = {
  emailjs: {
    serviceId: process.env.EMAILJS_SERVICE_ID || '',
    templateId: process.env.EMAILJS_TEMPLATE_ID || '',
    publicKey: process.env.EMAILJS_PUBLIC_KEY || ''
  },
  twilio: (process.env.TWILIO_ACCOUNT_SID || process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID) ? {
    accountSid: process.env.TWILIO_ACCOUNT_SID || process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || process.env.NEXT_PUBLIC_TWILIO_SMS_NUMBER || ''
  } : undefined
}

export async function POST() {
  const service = new NotificationService(notificationConfig)
  const results = await service.sendBatchReminders('reminder_24h')
  return NextResponse.json({ sent: results.length, results })
} 