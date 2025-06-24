// lib/supabase/requireAuth.ts - FUNZIONE STANDARDIZZATA
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { SupabaseClient } from '@supabase/supabase-js'

export interface UserData {
  id: string
  email: string
  full_name: string
  organization_id: string
  role: 'owner' | 'staff' | 'admin'
  is_active: boolean
  organization: {
    id: string
    name: string
    slug: string
    plan_type: string
  }
}

export interface RequireAuthResponse {
  user: User
  userData: UserData
  supabase: SupabaseClient
}

/**
 * 🔒 Funzione standardizzata per autenticazione e autorizzazione
 * 
 * Verifica:
 * - Utente autenticato
 * - Dati profilo completi
 * - Organizzazione valida
 * - Ruolo appropriato
 * 
 * @param allowedRoles - Ruoli autorizzati (opzionale)
 * @returns User data completo o redirect automatico
 */
export async function requireAuth(
  allowedRoles?: ('owner' | 'staff' | 'admin')[]
): Promise<RequireAuthResponse> {
  
  console.log('🔒 === requireAuth START ===')
  
  const supabase = await createClient()
  
  // 1. Verifica autenticazione
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  console.log('👤 Auth user:', user ? user.id : 'null')
  console.log('❌ Auth error:', authError)
  
  if (authError || !user) {
    console.log('🚫 User not authenticated, redirecting to login')
    redirect('/login')
  }

  // 2. Ottieni dati utente con organizzazione
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select(`
      id,
      email,
      full_name,
      organization_id,
      role,
      is_active,
      organization:organizations(
        id,
        name,
        slug,
        plan_type
      )
    `)
    .eq('id', user.id)
    .single()

  console.log('👨‍💼 User data:', userData)
  console.log('❌ User error:', userError)

  // 3. Verifica dati utente
  if (userError || !userData) {
    console.log('🚫 User data not found, redirecting to setup')
    redirect('/auth/complete-setup')
  }

  // 4. Verifica organizzazione
  if (!userData.organization_id || !userData.organization) {
    console.log('🚫 Organization not found, redirecting to setup')
    redirect('/auth/complete-setup')
  }

  // 5. Verifica utente attivo
  if (!userData.is_active) {
    console.log('🚫 User not active')
    redirect('/auth/inactive')
  }

  // 6. Verifica ruolo (se specificato)
  if (allowedRoles && !allowedRoles.includes(userData.role)) {
    console.log('🚫 Insufficient role permissions')
    redirect('/auth/unauthorized')
  }

  // 7. Prepara i dati con tipi corretti
  // Supabase restituisce organization come array, prendiamo il primo elemento
  const organization = Array.isArray(userData.organization) 
    ? userData.organization[0] 
    : userData.organization

  if (!organization) {
    console.log('🚫 Organization data not found')
    redirect('/auth/complete-setup')
  }

  const typedUserData = {
    id: userData.id,
    email: userData.email,
    full_name: userData.full_name,
    organization_id: userData.organization_id,
    role: userData.role as 'owner' | 'staff' | 'admin',
    is_active: userData.is_active,
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      plan_type: organization.plan_type
    }
  }

  console.log('✅ Auth successful for:', typedUserData.full_name)
  console.log('🏢 Organization:', typedUserData.organization.name)
  console.log('👤 Role:', typedUserData.role)
  console.log('🔒 === requireAuth END ===')

  return {
    user,
    userData: typedUserData,
    supabase
  }
}

/**
 * 🔒 Versione semplificata per uso comune
 */
export async function requireBasicAuth() {
  return requireAuth()
}

/**
 * 🔒 Solo per owner
 */
export async function requireOwnerAuth() {
  return requireAuth(['owner'])
}

/**
 * 🔒 Solo per owner e admin
 */
export async function requireAdminAuth() {
  return requireAuth(['owner', 'admin'])
}

/**
 * 🔒 Per tutti i ruoli staff
 */
export async function requireStaffAuth() {
  return requireAuth(['owner', 'admin', 'staff'])
}

// Helper functions for role-based authorization
export function requireRole(userData: UserData, requiredRoles: string[]) {
  if (!userData || !userData.role) {
    throw new Error('User role not found')
  }
  
  if (!requiredRoles.includes(userData.role)) {
    throw new Error(`Access denied. Required roles: ${requiredRoles.join(', ')}`)
  }
  
  return true
}

export function requireOwner(userData: UserData) {
  return requireRole(userData, ['owner'])
}

export function requireAdmin(userData: UserData) {
  return requireRole(userData, ['owner', 'admin'])
}

export function requireStaff(userData: UserData) {
  return requireRole(userData, ['owner', 'admin', 'staff'])
}

// Helper per verificare se l'utente può gestire un'altra organizzazione
export function canManageOrganization(userData: UserData, targetOrgId: string) {
  if (!userData || !userData.organization_id) {
    return false
  }
  
  // Solo owner può gestire l'organizzazione
  if (userData.role === 'owner' && userData.organization_id === targetOrgId) {
    return true
  }
  
  return false
}