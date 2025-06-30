// lib/supabase/requireAuth.ts - AGGIORNATO per email da Auth
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { SupabaseClient } from '@supabase/supabase-js'

export interface UserData {
  id: string
  email: string // Ora viene da auth.users, non dalla tabella users
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

  // 2. Ottieni dati utente con organizzazione (SENZA EMAIL)
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select(`
      id,
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
  const organization = Array.isArray(userData.organization) 
    ? userData.organization[0] 
    : userData.organization

  if (!organization) {
    console.log('🚫 Organization data not found')
    redirect('/auth/complete-setup')
  }

  // 8. IMPORTANTE: Email viene da auth.users, non dalla tabella users
  const typedUserData = {
    id: userData.id,
    email: user.email!, // 🔑 Email da Supabase Auth
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
  console.log('📧 Email from auth.users:', typedUserData.email)
  console.log('🏢 Organization:', typedUserData.organization.name)
  console.log('👤 Role:', typedUserData.role)
  console.log('🔒 === requireAuth END ===')

  return {
    user,
    userData: typedUserData,
    supabase
  }
}

// Resto delle funzioni helper rimane uguale...
export async function requireBasicAuth() {
  return requireAuth()
}

export async function requireOwnerAuth() {
  return requireAuth(['owner'])
}

export async function requireAdminAuth() {
  return requireAuth(['owner', 'admin'])
}

export async function requireStaffAuth() {
  return requireAuth(['owner', 'admin', 'staff'])
}

// Utility function to safely extract organization data
export function extractOrganization(userData: any) {
  const organization = Array.isArray(userData.organization) 
    ? userData.organization[0] 
    : userData.organization
  
  if (!organization) {
    throw new Error('Organization data not found')
  }
  
  return organization
}