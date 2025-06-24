import { requireAuth } from '@/lib/supabase/requireAuth'
import AITestClient from './AITestClient'

export default async function AITestPage() {
  const { userData } = await requireAuth()

  return (
    <AITestClient organizationId={userData.organization_id} />
  )
} 