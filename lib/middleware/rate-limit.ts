import { NextRequest, NextResponse } from 'next/server'
import { rateLimitManager, rateLimitResponse } from '../rate-limit'
import { 
  getServiceForRoute, 
  shouldSkipRateLimit, 
  isPermissiveRoute 
} from '../config/rate-limit-config'

// Middleware per rate limiting
export async function rateLimitMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Skip rate limiting per route critiche
  if (shouldSkipRateLimit(pathname)) {
    return NextResponse.next()
  }

  // Determina il servizio basato sulla route
  const serviceName = getServiceForRoute(pathname)

  // Applica rate limiting più permissivo per alcune route
  if (isPermissiveRoute(pathname)) {
    // Per route permissive, usa rate limiting più alto
    console.log(`🔓 Permissive rate limiting for ${pathname}`)
  }

  // Applica rate limiting
  const result = await rateLimitManager.checkRateLimit(
    request,
    serviceName as 'whatsapp_ai' | 'bookings' | 'sms' | 'email' | 'upload' | 'dashboard',
    pathname
  )

  if (!result.success) {
    console.log(`🚫 Rate limit exceeded for ${pathname}: ${result.retryAfter}s remaining`)
    return rateLimitResponse(result.retryAfter)
  }

  // Aggiungi headers di rate limiting alla response
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', result.limit.toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', new Date(result.reset).toISOString())
  
  return response
} 