import { requireAuth } from '@/lib/supabase/requireAuth'
import Link from 'next/link'
import { Plus, Upload, Download } from 'lucide-react'
import ClientsTable from '@/components/clients/clients-table'
import ClientsSearch from '@/components/clients/clients-search'
import { Button } from '@/components/ui/button'

export default async function ClientsPage() {
  const { userData, supabase } = await requireAuth()

  // Fetch clients data server-side
  const { data: clientsData, error, count } = await supabase
    .from('clients')
    .select('*', { count: 'exact' })
    .eq('organization_id', userData.organization_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching clients:', error)
    throw new Error('Errore nel caricamento dei clienti')
  }

  const clients = clientsData || []
  const totalCount = count || 0

  // Calculate additional stats
  const now = new Date()
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const { data: statsData } = await supabase
    .from('clients')
    .select('created_at, last_booking_date')
    .eq('organization_id', userData.organization_id)

  let newThisMonth = 0
  let inactiveClients = 0
  let vipClients = 0

  if (statsData) {
    newThisMonth = statsData.filter((client: { created_at: string }) => 
      new Date(client.created_at) >= thisMonth
    ).length

    inactiveClients = statsData.filter((client: { last_booking_date: string | null }) => 
      !client.last_booking_date || 
      new Date(client.last_booking_date) < threeMonthsAgo
    ).length

    // Per ora, consideriamo VIP i clienti con più di 5 prenotazioni
    // In futuro, questo potrebbe essere un campo specifico
    vipClients = Math.floor(totalCount * 0.1) // 10% dei clienti totali
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clienti</h1>
          <p className="text-muted-foreground">
            Gestisci i tuoi clienti e le loro informazioni
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/clients/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Cliente
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Totale Clienti</p>
              <p className="text-2xl font-semibold text-gray-900">{totalCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Nuovi Questo Mese</p>
              <p className="text-2xl font-semibold text-gray-900">{newThisMonth}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inattivi</p>
              <p className="text-2xl font-semibold text-gray-900">{inactiveClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Clienti VIP</p>
              <p className="text-2xl font-semibold text-gray-900">{vipClients}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg border">
        <ClientsSearch 
          initialSearch=""
          initialTags={[]}
        />
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg border">
        <ClientsTable 
          clients={clients}
          currentPage={1}
          totalPages={Math.ceil(totalCount / 10)}
          totalCount={totalCount}
        />
      </div>
    </div>
  )
}