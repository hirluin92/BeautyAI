// middleware.ts - VERSIONE AGGIORNATA
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/database'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 🔒 ROUTE PROTETTE - Tutte le route dashboard 
  const protectedPaths = [
    '/dashboard',
    '/services',
    '/clients', 
    '/bookings',
    '/staff',
    '/settings',
    '/analytics'
  ]

  const isProtectedRoute = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  // Se l'utente non è autenticato e prova ad accedere a una route protetta
  if (!user && isProtectedRoute) {
    console.log('🚫 User not authenticated, redirecting to login from:', request.nextUrl.pathname)
    const redirectUrl = new URL('/login', request.url)
    // Aggiungiamo un parametro per tracciare il reindirizzamento
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Se l'utente è autenticato e prova ad accedere a login/register
  if (user && ['/login', '/register'].includes(request.nextUrl.pathname)) {
    console.log('✅ User authenticated, redirecting from auth page to dashboard')
    // Verifichiamo se c'è un parametro redirectedFrom
    const redirectedFrom = request.nextUrl.searchParams.get('redirectedFrom')
    if (redirectedFrom && protectedPaths.some(path => redirectedFrom.startsWith(path))) {
      // Se c'è un redirectedFrom valido, reindirizziamo lì
      return NextResponse.redirect(new URL(redirectedFrom, request.url))
    }
    // Altrimenti reindirizziamo al dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Log per debugging
  if (user && isProtectedRoute) {
    console.log('✅ Authenticated user accessing:', request.nextUrl.pathname)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}