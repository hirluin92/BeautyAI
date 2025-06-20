// app/(dashboard)/clients/new/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { UserWithOrganization } from '@/types'
import NewClientFormWrapper from '@/components/clients/new-client-form-wrapper'

export default async function NewClientPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Get user data with organization
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*, organization:organizations(*)')
    .eq('id', user.id)
    .single()
    
  if (userError || !userData) {
    redirect('/login')
  }
  
  const typedUserData = userData as UserWithOrganization
  
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link 
            href="/clients"
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Torna ai clienti
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Nuovo Cliente</h1>
        <p className="text-gray-600 mt-2">
          Aggiungi un nuovo cliente al tuo sistema
        </p>
      </div>
      
      {/* Form */}
      <div className="max-w-2xl">
        <NewClientFormWrapper 
          organizationId={typedUserData.organization_id!}
        />
      </div>
    </>
  )
}