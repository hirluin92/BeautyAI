import { requireAuth } from '@/lib/supabase/requireAuth'
import StaffTable from '@/components/staff/staff-table'
import React from 'react'

export default async function StaffPage() {
  const { userData } = await requireAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestione Staff</h1>
        <p className="mt-2 text-gray-600">
          Gestisci il tuo team di professionisti
        </p>
      </div>
      <StaffTable organizationId={userData.organization_id} />
    </div>
  )
} 