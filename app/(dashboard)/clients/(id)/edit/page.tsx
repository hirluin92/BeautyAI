import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Client, UserWithOrganization } from '@/types'
import ClientForm from '@/components/clients/client-form'

interface EditClientPageProps {
  params: {
    id: string
  }
}

export default async function EditClientPage({ params }: EditClientPageProps) {
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

  // Get client data
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', params.id)
    .eq('organization_id', typedUserData.organization_id!)
    .single()

  if (clientError || !client) {
    notFound()
  }

  const typedClient = client as Client

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">Beauty AI</h2>
          <p className="text-sm text-gray-600">{typedUserData.organization?.name}</p>
        </div>
        
        <nav className="mt-8">
          <Link href="/dashboard" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50">
            Dashboard
          </Link>
          <Link href="/calendar" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50">
            Calendario
          </Link>
          <Link href="/clients" className="flex items-center px-6 py-3 bg-indigo-50 text-indigo-700 border-r-4 border-indigo-700">
            <span className="mr-3">👥</span>
            Clienti
          </Link>
          <Link href="/services" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50">
            Servizi
          </Link>
          <Link href="/chat" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50">
            Chat WhatsApp
          </Link>
          <Link href="/settings" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50">
            Impostazioni
          </Link>
        </nav>

        <div className="absolute bottom-0 w-full p-6">
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="flex items-center text-gray-700 hover:text-red-600 w-full">
              <span className="mr-3">🚪</span>
              Esci
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link 
              href={`/clients/${params.id}`}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Torna al cliente
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Modifica Cliente</h1>
          <p className="text-gray-600 mt-2">
            Aggiorna le informazioni di {typedClient.full_name}
          </p>
        </div>

        {/* Form */}
        <div className="max-w-2xl">
          <ClientForm 
            organizationId={typedUserData.organization_id!}
            mode="edit"
            client={typedClient}
          />
        </div>
      </main>
    </div>
  )
}