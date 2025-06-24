import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/supabase/requireAuth'
import EditClientClient from './EditClientClient'
import { DynamicPageProps } from '@/lib/utils'

export default async function EditClientPage({ params }: DynamicPageProps<{ id: string }>) {
  const { userData, supabase } = await requireAuth()
  
  // ✅ FIXED: await params per Next.js 15
  const { id } = await params

  // Fetch client data server-side
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('organization_id', userData.organization_id)
    .single()

  if (error || !client) {
    notFound()
  }

  return (
    <EditClientClient 
      client={client} 
      organizationId={userData.organization_id} 
    />
  )
}