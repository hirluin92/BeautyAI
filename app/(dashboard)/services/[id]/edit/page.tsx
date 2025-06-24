import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/supabase/requireAuth'
import EditServiceClient from './EditServiceClient'

interface EditServicePageProps {
  params: Promise<{ id: string }>
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const { userData, supabase } = await requireAuth()
  
  // ✅ FIXED: await params per Next.js 15
  const { id } = await params

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