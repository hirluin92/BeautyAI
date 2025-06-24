import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/supabase/requireAuth'
import EditServiceClient from './EditServiceClient'

export default async function EditServicePage({ params }: { params: { id: string } }) {
  const { userData, supabase } = await requireAuth()
  const { id } = params

  // Fetch service data server-side
  const { data: service, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .eq('organization_id', userData.organization_id)
    .single()

  if (error || !service) {
    notFound()
  }

  return (
    <EditServiceClient 
      service={service} 
      organizationId={userData.organization_id} 
    />
  )
}