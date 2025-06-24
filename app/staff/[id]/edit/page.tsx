import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/supabase/requireAuth'
import StaffForm from '@/components/staff/staff-form'
import React from 'react'
import { DynamicPageProps } from '@/lib/utils'

export default async function EditStaffPage({ params }: DynamicPageProps<{ id: string }>) {
  const { userData, supabase } = await requireAuth()
  
  // ✅ FIXED: await params per Next.js 15
  const { id } = await params

  // Get staff member
  const { data: staff } = await supabase
    .from('staff')
    .select('*')
    .eq('id', id)
    .eq('organization_id', userData.organization_id)
    .single()

  if (!staff) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Modifica Staff</h1>
        <p className="mt-2 text-gray-600">
          Modifica le informazioni del membro del team
        </p>
      </div>

      <div className="max-w-2xl">
        <StaffForm 
          organizationId={userData.organization_id}
          mode="edit" 
          staff={staff}
        />
      </div>
    </div>
  )
} 