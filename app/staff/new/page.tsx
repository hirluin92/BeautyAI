import { requireAuth } from '@/lib/supabase/requireAuth'
import StaffForm from '@/components/staff/staff-form'
import React from 'react'

export default async function NewStaffPage() {
  const { userData } = await requireAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nuovo Staff</h1>
        <p className="mt-2 text-gray-600">
          Aggiungi un nuovo membro al tuo team
        </p>
      </div>

      <div className="max-w-2xl">
        <StaffForm 
          organizationId={userData.organization_id} 
          mode="create" 
        />
      </div>
    </div>
  )
} 