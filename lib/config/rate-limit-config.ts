// Configurazione centralizzata per il rate limiting
export const RATE_LIMIT_CONFIG = {
  // Configurazioni per tipo utente WhatsApp
  whatsapp_user: {
    trusted: { limit: 50, windowMs: 30 * 60 * 1000 }, // 50 msg / 30 min
    existing: { limit: 30, windowMs: 30 * 60 * 1000 }, // 30 msg / 30 min
    new: { limit: 15, windowMs: 30 * 60 * 1000 }, // 15 msg / 30 min
    unknown: { limit: 5, windowMs: 30 * 60 * 1000 }, // 5 msg / 30 min
  },
  
  // Configurazioni per servizi
  services: {
    whatsapp_ai: { limit: 30, windowMs: 30 * 60 * 1000 }, // 30 req / 30 min
    bookings: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 req / ora
    sms: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 SMS / ora
    email: { limit: 20, windowMs: 60 * 60 * 1000 }, // 20 email / ora
    upload: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 upload / ora
    dashboard: { limit: 100, windowMs: 60 * 60 * 1000 }, // 100 req / ora
  },
  
  // Configurazioni globali per IP
  global: {
    default: { limit: 50, windowMs: 60 * 60 * 1000 }, // 50 req / ora
    strict: { limit: 5, windowMs: 5 * 60 * 1000 }, // 5 req / 5 min
  }
}

// Route che non necessitano di rate limiting
export const SKIP_RATE_LIMIT_ROUTES = [
  '/api/auth/callback',
  '/api/auth/refresh',
  '/api/health',
  '/api/status',
  '/api/webhooks/verify'
]

// Route che necessitano di rate limiting più permissivo
export const PERMISSIVE_RATE_LIMIT_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password'
]

// Mappa delle route ai servizi
export const ROUTE_SERVICE_MAP: Record<string, string> = {
  // WhatsApp e AI
  '/api/whatsapp/webhook': 'whatsapp_ai',
  '/api/ai': 'whatsapp_ai',
  
  // Prenotazioni
  '/api/bookings': 'bookings',
  
  // Notifiche
  '/api/notifications/sms': 'sms',
  '/api/notifications/send': 'sms',
  '/api/notifications/send-reminders': 'sms',
  '/api/notifications/test-sms': 'sms',
  '/api/notifications/test-sms-twilio': 'sms',
  '/api/notifications/test-sms-twilio-client': 'sms',
  '/api/notifications/test-sms-twilio-official': 'sms',
  '/api/notifications/test-sms-twilio-bypass': 'sms',
  '/api/notifications/test-simple': 'sms',
  '/api/notifications/test-config': 'sms',
  '/api/notifications/test-twilio': 'sms',
  '/api/notifications/test-twilio-bypass': 'sms',
  '/api/notifications/test-twilio-official': 'sms',
  '/api/notifications/sms-status': 'sms',
  
  // Email (se implementate)
  '/api/notifications/email': 'email',
  
  // Upload (se implementate)
  '/api/upload': 'upload',
  
  // Dashboard e Admin
  '/api/admin': 'dashboard',
  '/api/dashboard': 'dashboard',
  '/api/services': 'dashboard',
  '/api/clients': 'dashboard',
  '/api/staff': 'dashboard',
  
  // Auth (rate limiting più permissivo)
  '/api/auth': 'dashboard',
}

// Funzione per ottenere la configurazione per un servizio
export function getServiceConfig(serviceName: string) {
  return RATE_LIMIT_CONFIG.services[serviceName as keyof typeof RATE_LIMIT_CONFIG.services] || 
         RATE_LIMIT_CONFIG.services.dashboard
}

// Funzione per ottenere la configurazione per un tipo utente WhatsApp
export function getWhatsAppUserConfig(userType: string) {
  return RATE_LIMIT_CONFIG.whatsapp_user[userType as keyof typeof RATE_LIMIT_CONFIG.whatsapp_user] || 
         RATE_LIMIT_CONFIG.whatsapp_user.unknown
}

// Funzione per determinare se una route deve saltare il rate limiting
export function shouldSkipRateLimit(pathname: string): boolean {
  return SKIP_RATE_LIMIT_ROUTES.some(route => pathname.startsWith(route))
}

// Funzione per determinare se una route ha rate limiting permissivo
export function isPermissiveRoute(pathname: string): boolean {
  return PERMISSIVE_RATE_LIMIT_ROUTES.some(route => pathname.startsWith(route))
}

// Funzione per ottenere il servizio per una route
export function getServiceForRoute(pathname: string): string {
  for (const [route, service] of Object.entries(ROUTE_SERVICE_MAP)) {
    if (pathname.startsWith(route)) {
      return service
    }
  }
  return 'dashboard' // default
} 