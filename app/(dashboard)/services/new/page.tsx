import { requireAuth } from '@/lib/supabase/requireAuth'
import NewServiceClient from './NewServiceClient'

export default async function NewServicePage() {
  const { userData } = await requireAuth()

  return (
    <NewServiceClient organizationId={userData.organization_id} />
  )
}