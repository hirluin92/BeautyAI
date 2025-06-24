import { requireAdminAuth } from '@/lib/supabase/requireAuth'
import AdminUsersClient from './AdminUsersClient'

export default async function AdminUsersPage() {
  const { userData, supabase } = await requireAdminAuth()

  // Fetch users data server-side
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, role, is_active, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Errore nel caricamento utenti')
  }

  return (
    <AdminUsersClient users={users || []} />
  )
} 