import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search, Filter, Upload, Download } from 'lucide-react'
import { Client, UserWithOrganization } from '@/types'
import ClientsTable from '@/components/clients/clients-table'
import ClientsSearch from '@/components/clients/clients-search'

interface SearchParams {
  search?: string
  page?: string
  limit?: string
  tags?: string
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
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

  // Parse search params
  const search = searchParams.search || ''
  const page = parseInt(searchParams.page || '1')
  const limit = parseInt(searchParams.limit || '20')
  const tags = searchParams.tags?.split(',').filter(Boolean) || []
  
  // Calculate offset
  const offset = (page - 1) * limit

  // Build query
  let query = supabase
    .from('clients')
    .select('*', { count: 'exact' })
    .eq('organization_id', typedUserData.organization_id!)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Apply search filter
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`)
  }

  // Apply tags filter
  if (tags.length > 0) {
    query = query.overlaps('tags', tags)
  }

  const { data: clients, error: clientsError, count } = await query

  if (clientsError) {
    console.error('Error fetching clients:', clientsError)
  }

  const typedClients = clients as Client[] | null
  const totalPages = Math.ceil((count || 0) / limit)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Same as dashboard */}
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
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clienti</h1>
            <p className="text-gray-600 mt-2">
              Gestisci i tuoi clienti e le loro informazioni
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              <Upload className="w-4 h-4 mr-2" />
              Importa CSV
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              <Download className="w-4 h-4 mr-2" />
              Esporta
            </button>
            <Link 
              href="/clients/new" 
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Cliente
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clienti Totali</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{count || 0}</p>
              </div>
              <div className="bg-blue-50 rounded-full p-3">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nuovi Questo Mese</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <div className="bg-green-50 rounded-full p-3">
                <span className="text-green-600 text-xl">📈</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cliente VIP</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <div className="bg-yellow-50 rounded-full p-3">
                <span className="text-yellow-600 text-xl">⭐</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inattivi +3 mesi</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <div className="bg-red-50 rounded-full p-3">
                <span className="text-red-600 text-xl">😴</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <ClientsSearch 
          initialSearch={search}
          initialTags={tags}
        />

        {/* Clients Table */}
        <div className="bg-white rounded-lg shadow">
          <ClientsTable 
            clients={typedClients || []}
            currentPage={page}
            totalPages={totalPages}
            totalCount={count || 0}
          />
        </div>

        {/* Empty State */}
        {(!typedClients || typedClients.length === 0) && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {search ? 'Nessun cliente trovato' : 'Nessun cliente ancora'}
            </h3>
            <p className="text-gray-600 mb-6">
              {search 
                ? `Nessun risultato per "${search}". Prova con criteri diversi.`
                : 'Inizia aggiungendo il tuo primo cliente per gestire le prenotazioni.'
              }
            </p>
            {!search && (
              <Link 
                href="/clients/new"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi Primo Cliente
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  )
}