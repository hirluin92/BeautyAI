import { requireAuth } from '@/lib/supabase/requireAuth'
import WhitelistClient from './whitelist-client'

// Type definitions
type ContactType = 'friend' | 'family' | 'employee' | 'partner' | 'vip'

export default async function WhitelistPage() {
  const { userData, supabase } = await requireAuth()

  // Fetch whitelist contacts
  const { data: contacts, error } = await supabase
    .from('whatsapp_whitelist')
    .select('*')
    .eq('organization_id', userData.organization_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching whitelist contacts:', error)
    throw new Error('Errore nel caricamento della whitelist')
  }

  const whitelistContacts = contacts || []

  return (
    <WhitelistClient 
      initialContacts={whitelistContacts} 
      organizationId={userData.organization_id} 
    />
  )
}