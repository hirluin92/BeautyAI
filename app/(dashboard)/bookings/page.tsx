import { requireAuth } from '@/lib/supabase/requireAuth'
import { 
  getSearchParamValue, 
  getSearchParamNumber,
  SearchablePageProps 
} from '@/lib/utils'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Database } from '@/types/database'

type BookingWithRelations = Database['public']['Tables']['bookings']['Row'] & {
  client: Database['public']['Tables']['clients']['Row'] | null
  service: Database['public']['Tables']['services']['Row'] | null
  staff: Database['public']['Tables']['staff']['Row'] | null
}

export default async function BookingsPage({ 
  searchParams 
}: SearchablePageProps) {
  const { userData, supabase } = await requireAuth()
  
  // ✅ FIXED: await both params and searchParams per Next.js 15
  const resolvedSearchParams = await searchParams
  
  // Safe parameter extraction
  const page = getSearchParamNumber(resolvedSearchParams, 'page', 1)
  const search = getSearchParamValue(resolvedSearchParams, 'search', '')
  const status = getSearchParamValue(resolvedSearchParams, 'status', '')
  const date = getSearchParamValue(resolvedSearchParams, 'date', '')
  const staff = getSearchParamValue(resolvedSearchParams, 'staff', '')

  // Build query with filters
  let query = supabase
    .from('bookings')
    .select(`
      *,
      client:clients(id, full_name, phone),
      service:services(id, name, price),
      staff:staff(id, full_name)
    `, { count: 'exact' })
    .eq('organization_id', userData.organization_id)

  // Apply search filter
  if (search) {
    query = query.or(`clients.full_name.ilike.%${search}%,services.name.ilike.%${search}%`)
  }

  // Apply status filter
  if (status) {
    query = query.eq('status', status)
  }

  // Apply date filter
  if (date) {
    query = query.eq('date', date)
  }

  // Apply staff filter
  if (staff) {
    query = query.eq('staff_id', staff)
  }

  // Apply pagination
  const itemsPerPage = 10
  const from = (page - 1) * itemsPerPage
  const to = from + itemsPerPage - 1

  const { data: bookings, error, count } = await query
    .order('start_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching bookings:', error)
    throw new Error('Errore nel caricamento delle prenotazioni')
  }

  const totalCount = count || 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prenotazioni</h1>
          <p className="text-muted-foreground">
            Gestisci le prenotazioni e gli appuntamenti
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/bookings/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuova Prenotazione
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Cerca cliente o servizio..."
            defaultValue={search}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <select 
            defaultValue={status}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Tutti gli stati</option>
            <option value="confirmed">Confermata</option>
            <option value="pending">In attesa</option>
            <option value="cancelled">Cancellata</option>
            <option value="completed">Completata</option>
          </select>
          <input
            type="date"
            defaultValue={date}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <select 
            defaultValue={staff}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Tutto lo staff</option>
            {/* TODO: Populate with staff options */}
          </select>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg border">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            Prenotazioni ({totalCount})
          </h2>
          
          {bookings && bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking: BookingWithRelations) => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {booking.client?.full_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {booking.service?.name} - {booking.staff?.full_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.start_at).toLocaleString('it-IT')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                      <p className="text-sm font-medium mt-1">
                        €{booking.service?.price || 0}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nessuna prenotazione trovata
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalCount > itemsPerPage && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            {Array.from({ length: Math.ceil(totalCount / itemsPerPage) }, (_, i) => (
              <Link
                key={i + 1}
                href={`/bookings?page=${i + 1}&search=${search}&status=${status}&date=${date}&staff=${staff}`}
                className={`px-3 py-2 border rounded ${
                  page === i + 1 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 