import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Service, UserWithOrganization } from '@/types'
import ServicesSearch from '@/components/services/services-search'
import ServicesTable from '@/components/services/services-table'

interface ServicesPageProps {
  searchParams: Promise<{
    search?: string
    category?: string
    status?: 'active' | 'inactive' | 'all'
    page?: string
    limit?: string
  }>
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  // Await searchParams as required in Next.js 15
  const params = await searchParams
  
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

  // Pagination
  const currentPage = parseInt(params.page || '1')
  const limit = parseInt(params.limit || '20')
  const from = (currentPage - 1) * limit
  const to = from + limit - 1

  // Build query
  let query = supabase
    .from('services')
    .select('*', { count: 'exact' })
    .eq('organization_id', typedUserData.organization_id!)
    .is('deleted_at', null)
    .order('name', { ascending: true })

  // Apply filters
  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }

  if (params.category) {
    query = query.eq('category', params.category)
  }

  if (params.status && params.status !== 'all') {
    query = query.eq('is_active', params.status === 'active')
  }

  // Execute query with pagination
  const { data: services, error, count } = await query.range(from, to)

  if (error) {
    console.error('Error fetching services:', error)
  }

  const typedServices = services as Service[] | null
  const totalPages = Math.ceil((count || 0) / limit)

  // Get unique categories for filter
  const { data: allServices } = await supabase
    .from('services')
    .select('category')
    .eq('organization_id', typedUserData.organization_id!)
    .is('deleted_at', null)
    .not('category', 'is', null)

  const categories = [...new Set(allServices?.map(s => s.category).filter((c): c is string => c !== null) || [])]

  // Calculate stats
  const totalServices = count || 0
  const activeServices = typedServices?.filter(s => s.is_active).length || 0
  const totalValue = typedServices?.reduce((sum, s) => sum + (s.price || 0), 0) || 0

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Servizi</h1>
            <p className="text-gray-600 mt-2">Gestisci i servizi del tuo salone</p>
          </div>
          <Link
            href="/services/new"
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuovo Servizio
          </Link>
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-600">Servizi Totali</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{totalServices}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-600">Servizi Attivi</p>
          <p className="text-2xl font-bold text-green-600 mt-2">{activeServices}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-600">Categorie</p>
          <p className="text-2xl font-bold text-indigo-600 mt-2">{categories.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-600">Valore Totale</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">€{totalValue.toFixed(2)}</p>
        </div>
      </div>
      {/* Search and Filters */}
      <ServicesSearch 
        categories={categories}
        defaultSearch={params.search}
        defaultCategory={params.category}
        defaultStatus={params.status}
      />
      {/* Services Table */}
      <ServicesTable services={typedServices || []} />
    </>
  )
}