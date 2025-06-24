import { requireAuth } from '@/lib/supabase/requireAuth'
import NewClientClient from './NewClientClient'

export default async function NewClientPage() {
  const { userData } = await requireAuth()

  return (
    <NewClientClient organizationId={userData.organization_id} />
  )
}