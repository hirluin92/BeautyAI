import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Service, UserWithOrganization } from '@/types'
import ServiceForm from '@/components/services/service-form'

interface EditServicePageProps {
  params: {
    id: string
  }
}

export default async function EditServicePage({ params }: EditServicePageProps) {
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

  // Get service data
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('*')
    .eq('id', params.id)
    .eq('organization_id', typedUserData.organization_id!)
    .single()

  if (serviceError || !service) {
    notFound()
  }

  const typedService = service as Service

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link 
            href={`/services/${params.id}`}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Torna al servizio
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Modifica Servizio</h1>
        <p className="text-gray-600 mt-2">
          Aggiorna le informazioni di {typedService.name}
        </p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <ServiceForm 
          organizationId={typedUserData.organization_id!}
          mode="edit"
          service={typedService}
        />
      </div>
    </>
  )
}