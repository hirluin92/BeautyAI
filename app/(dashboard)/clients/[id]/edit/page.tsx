import { requireAuth } from '@/lib/supabase/requireAuth'
import EditClientClient from './EditClientClient'

export default async function EditClientPage({ params }: { params: { id: string } }) {
  const { userData, supabase } = await requireAuth()
  const { id } = params

  // Fetch client data server-side
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('organization_id', userData.organization_id)
    .single()

  if (error || !client) {
    throw new Error('Cliente non trovato')
  }

  return (
    <EditClientClient 
      client={client} 
      organizationId={userData.organization_id} 
    />
  )
}