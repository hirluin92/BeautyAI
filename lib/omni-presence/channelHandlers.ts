export interface ChannelHandler {
  sendMessage(to: string, content: any, options?: any): Promise<{ success: boolean; messageId?: string; error?: string }>
  validateConfig(config: any): boolean
  getStatus(): Promise<{ status: 'active' | 'inactive' | 'error'; message?: string }>
}

export class WhatsAppHandler implements ChannelHandler {
  private accessToken: string
  private phoneNumberId: string
  
  constructor(config: any) {
    this.accessToken = config.accessToken || process.env.WHATSAPP_ACCESS_TOKEN
    this.phoneNumberId = config.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID
  }
  
  async sendMessage(to: string, content: any): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Remove + from phone number for WhatsApp API
      const cleanPhone = to.replace(/^\+/, '')
      
      const response = await fetch(`https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: {
            body: content.text
          }
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to send WhatsApp message')
      }
      
      return {
        success: true,
        messageId: result.messages?.[0]?.id
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }
  
  validateConfig(config: any): boolean {
    return !!(config.accessToken && config.phoneNumberId)
  }
  
  async getStatus(): Promise<{ status: 'active' | 'inactive' | 'error'; message?: string }> {
    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${this.phoneNumberId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })
      
      if (response.ok) {
        return { status: 'active' }
      } else {
        return { status: 'error', message: 'WhatsApp API not responding' }
      }
    } catch (error: any) {
      return { status: 'error', message: error.message }
    }
  }
}

export class EmailHandler implements ChannelHandler {
  private serviceId: string
  private templateId: string
  private publicKey: string
  
  constructor(config: any) {
    this.serviceId = config.serviceId || process.env.EMAILJS_SERVICE_ID
    this.templateId = config.templateId || process.env.EMAILJS_TEMPLATE_ID
    this.publicKey = config.publicKey || process.env.EMAILJS_PUBLIC_KEY
  }
  
  async sendMessage(to: string, content: any): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Using EmailJS for simplicity - in production you might want to use a more robust service
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service_id: this.serviceId,
          template_id: this.templateId,
          user_id: this.publicKey,
          template_params: {
            to_email: to,
            subject: content.subject,
            html_content: content.html,
            text_content: content.text
          }
        })
      })
      
      if (response.ok) {
        return { success: true }
      } else {
        throw new Error('Failed to send email')
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }
  
  validateConfig(config: any): boolean {
    return !!(config.serviceId && config.templateId && config.publicKey)
  }
  
  async getStatus(): Promise<{ status: 'active' | 'inactive' | 'error'; message?: string }> {
    // EmailJS doesn't have a status endpoint, so we assume it's active if config is valid
    return { status: this.validateConfig({ serviceId: this.serviceId, templateId: this.templateId, publicKey: this.publicKey }) ? 'active' : 'error' }
  }
}

export class SMSHandler implements ChannelHandler {
  private accountSid: string
  private authToken: string
  private fromNumber: string
  
  constructor(config: any) {
    this.accountSid = config.accountSid || process.env.TWILIO_ACCOUNT_SID
    this.authToken = config.authToken || process.env.TWILIO_AUTH_TOKEN
    this.fromNumber = config.fromNumber || process.env.TWILIO_PHONE_NUMBER
  }
  
  async sendMessage(to: string, content: any): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: this.fromNumber,
          To: to,
          Body: content.text
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to send SMS')
      }
      
      return {
        success: true,
        messageId: result.sid
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }
  
  validateConfig(config: any): boolean {
    return !!(config.accountSid && config.authToken && config.fromNumber)
  }
  
  async getStatus(): Promise<{ status: 'active' | 'inactive' | 'error'; message?: string }> {
    try {
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}.json`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`
        }
      })
      
      if (response.ok) {
        return { status: 'active' }
      } else {
        return { status: 'error', message: 'Twilio API not responding' }
      }
    } catch (error: any) {
      return { status: 'error', message: error.message }
    }
  }
}

export function getChannelHandler(channelType: string, config: any): ChannelHandler {
  switch (channelType) {
    case 'whatsapp':
      return new WhatsAppHandler(config)
    case 'email':
      return new EmailHandler(config)
    case 'sms':
      return new SMSHandler(config)
    default:
      throw new Error(`Unsupported channel type: ${channelType}`)
  }
} 