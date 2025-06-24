import { NextRequest } from 'next/server'
import { createServiceClient } from './supabase/server'
import { RATE_LIMIT_CONFIG } from './config/rate-limit-config'

// Tipi per il sistema di rate limiting
export type UserType = 'trusted' | 'existing' | 'new' | 'unknown'
export type ServiceType = 'whatsapp_ai' | 'bookings' | 'sms' | 'email' | 'upload' | 'dashboard'
export type IdentifierType = 'ip' | 'user_id' | 'phone_number' | 'session'

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

interface RateLimitViolation {
  identifier: string
  identifierType: IdentifierType
  serviceName: ServiceType
  endpoint: string
  violationType: 'rate_limit_exceeded' | 'spam_detected' | 'suspicious_activity'
  requestCount: number
  windowStart: Date
  windowEnd: Date
  userAgent?: string
  ipAddress?: string
  countryCode?: string
}

// Classe principale per il rate limiting (solo Supabase)
export class RateLimitManager {
  private supabase = createServiceClient()

  // Determina il tipo di utente per WhatsApp
  async getUserType(phoneNumber: string): Promise<UserType> {
    try {
      // Controlla whitelist
      const { data: whitelistEntry } = await this.supabase
        .from('whatsapp_whitelist')
        .select('contact_type, is_active')
        .eq('phone_number', phoneNumber)
        .eq('is_active', true)
        .single()

      if (whitelistEntry) {
        return 'trusted'
      }

      // Controlla se è un cliente esistente
      const { data: client } = await this.supabase
        .from('clients')
        .select('id')
        .eq('phone_number', phoneNumber)
        .single()

      if (client) {
        return 'existing'
      }

      // Controlla se ha fatto prenotazioni recenti
      const { data: recentBookings } = await this.supabase
        .from('bookings')
        .select('id')
        .eq('client_phone', phoneNumber)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Ultimi 30 giorni
        .limit(1)

      if (recentBookings && recentBookings.length > 0) {
        return 'existing'
      }

      // Controlla se ha conversazioni recenti
      const { data: recentConversations } = await this.supabase
        .from('whatsapp_conversations')
        .select('id')
        .eq('phone_number', phoneNumber)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Ultimi 7 giorni
        .limit(1)

      if (recentConversations && recentConversations.length > 0) {
        return 'new'
      }

      return 'unknown'
    } catch (error) {
      console.error('Error determining user type:', error)
      return 'unknown'
    }
  }

  // Ottiene l'identificatore per il rate limiting
  async getIdentifier(request: NextRequest, serviceName?: ServiceType): Promise<{
    identifier: string
    identifierType: IdentifierType
    userType?: UserType
  }> {
    // Per WhatsApp, usa il numero di telefono
    if (serviceName === 'whatsapp_ai') {
      try {
        const body = await request.json().catch(() => ({}))
        const phoneNumber = body.From || body.phone_number
        if (phoneNumber) {
          const userType = await this.getUserType(phoneNumber)
          return {
            identifier: phoneNumber,
            identifierType: 'phone_number',
            userType
          }
        }
      } catch (error) {
        console.error('Error parsing WhatsApp body:', error)
      }
    }

    // Per utenti autenticati, usa user_id
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user } } = await this.supabase.auth.getUser(token)
        if (user) {
          return {
            identifier: user.id,
            identifierType: 'user_id'
          }
        }
      } catch (error) {
        console.error('Error decoding JWT:', error)
      }
    }

    // Fallback su IP
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    return {
      identifier: ip,
      identifierType: 'ip'
    }
  }

  // Controlla rate limiting usando Supabase
  async checkRateLimit(
    request: NextRequest,
    serviceName: ServiceType,
    endpoint: string
  ): Promise<RateLimitResult> {
    const startTime = Date.now()
    
    try {
      const { identifier, identifierType, userType } = await this.getIdentifier(request, serviceName)
      
      // Determina la configurazione dalla configurazione centralizzata
      let config
      
      if (serviceName === 'whatsapp_ai' && userType) {
        config = RATE_LIMIT_CONFIG.whatsapp_user[userType]
      } else {
        config = RATE_LIMIT_CONFIG.services[serviceName]
      }

      const windowStart = new Date(Date.now() - config.windowMs)
      
      // Conta le richieste nella finestra temporale
      const { data: requests, error } = await this.supabase
        .from('rate_limit_logs')
        .select('id')
        .eq('identifier', identifier)
        .eq('identifier_type', identifierType)
        .eq('service_name', serviceName)
        .gte('created_at', windowStart.toISOString())

      if (error) {
        console.error('Error checking rate limit:', error)
        // In caso di errore, permette la richiesta
        return {
          success: true,
          limit: config.limit,
          remaining: config.limit - 1,
          reset: Date.now() + config.windowMs
        }
      }

      const currentCount = requests?.length || 0
      const isAllowed = currentCount < config.limit
      const remaining = Math.max(0, config.limit - currentCount)
      const reset = Date.now() + config.windowMs

      // Log della richiesta
      await this.logRequest({
        identifier,
        identifierType,
        serviceName,
        endpoint,
        method: request.method,
        statusCode: isAllowed ? 200 : 429,
        responseTimeMs: Date.now() - startTime,
        userAgent: request.headers.get('user-agent') || undefined,
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      })

      // Se violazione, registra nel database
      if (!isAllowed) {
        await this.logViolation({
          identifier,
          identifierType,
          serviceName,
          endpoint,
          violationType: 'rate_limit_exceeded',
          requestCount: currentCount,
          windowStart,
          windowEnd: new Date(reset),
          userAgent: request.headers.get('user-agent') || undefined,
          ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
        })
      }

      return {
        success: isAllowed,
        limit: config.limit,
        remaining,
        reset,
        retryAfter: isAllowed ? undefined : Math.ceil(config.windowMs / 1000)
      }
    } catch (error) {
      console.error('Rate limiting error:', error)
      // In caso di errore, permette la richiesta ma la logga
      await this.logRequest({
        identifier: 'error',
        identifierType: 'ip',
        serviceName,
        endpoint,
        method: request.method,
        statusCode: 500,
        responseTimeMs: Date.now() - startTime,
        userAgent: request.headers.get('user-agent') || undefined,
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      })
      
      return {
        success: true,
        limit: 1000,
        remaining: 999,
        reset: Date.now() + 3600000
      }
    }
  }

  // Log delle richieste
  private async logRequest(data: {
    identifier: string
    identifierType: IdentifierType
    serviceName: ServiceType
    endpoint: string
    method: string
    statusCode: number
    responseTimeMs: number
    userAgent?: string
    ipAddress?: string
    countryCode?: string
  }) {
    try {
      await this.supabase
        .from('rate_limit_logs')
        .insert(data)
    } catch (error) {
      console.error('Error logging request:', error)
    }
  }

  // Log delle violazioni
  private async logViolation(violation: RateLimitViolation) {
    try {
      await this.supabase
        .from('rate_limit_violations')
        .insert(violation)
    } catch (error) {
      console.error('Error logging violation:', error)
    }
  }

  // Ottiene statistiche di rate limiting
  async getStats(serviceName?: ServiceType, days: number = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    
    const query = this.supabase
      .from('rate_limit_logs')
      .select('*')
      .gte('created_at', since)
    
    if (serviceName) {
      query.eq('service_name', serviceName)
    }
    
    const { data: logs } = await query
    
    const violationsQuery = this.supabase
      .from('rate_limit_violations')
      .select('*')
      .gte('created_at', since)
    
    if (serviceName) {
      violationsQuery.eq('service_name', serviceName)
    }
    
    const { data: violations } = await violationsQuery
    
    return {
      totalRequests: logs?.length || 0,
      totalViolations: violations?.length || 0,
      violationRate: logs?.length ? (violations?.length || 0) / logs.length : 0,
      logs: logs?.slice(0, 100) || [], // Ultimi 100 log
      violations: violations?.slice(0, 50) || [] // Ultime 50 violazioni
    }
  }

  // Cleanup automatico dei log vecchi (per mantenere Supabase gratuito)
  async cleanupOldLogs(daysToKeep: number = 7) {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000).toISOString()
      
      // Elimina log vecchi
      await this.supabase
        .from('rate_limit_logs')
        .delete()
        .lt('created_at', cutoffDate)
      
      // Elimina violazioni vecchie
      await this.supabase
        .from('rate_limit_violations')
        .delete()
        .lt('created_at', cutoffDate)
        
      console.log(`Cleaned up logs older than ${daysToKeep} days`)
    } catch (error) {
      console.error('Error cleaning up old logs:', error)
    }
  }
}

// Istanza globale del rate limit manager
export const rateLimitManager = new RateLimitManager()

// Helper functions per compatibilità
export async function getRateLimitIdentifier(request: NextRequest): Promise<string> {
  const { identifier } = await rateLimitManager.getIdentifier(request)
  return identifier
}

export function rateLimitResponse(retryAfter?: number) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (retryAfter) {
    headers['Retry-After'] = retryAfter.toString()
  }
  
  return new Response(JSON.stringify({
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please try again later.',
    retryAfter
  }), {
    status: 429,
    headers
  })
}
