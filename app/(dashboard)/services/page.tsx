// app/(dashboard)/services/page.tsx - VERSIONE SEMPLIFICATA
import Link from 'next/link'
import { Plus, Package, Clock, Euro } from 'lucide-react'
import { requireAuth } from '@/lib/supabase/requireAuth'
import { Database } from '@/types/database'

type Service = Database['public']['Tables']['services']['Row']

export default async function ServicesPage() {
  const { userData, supabase } = await requireAuth()
  
  // Get services
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('organization_id', userData.organization_id)
    .order('category, name')

  const activeServices = services?.filter((s: Service) => s.is_active) || []
  const categories = [...new Set(services?.map((s: Service) => s.category))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Servizi</h1>
          <p className="text-muted-foreground">
            Gestisci i servizi del tuo salone
          </p>
        </div>
        <Link 
          href="/services/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuovo Servizio
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Servizi Totali</p>
              <p className="text-2xl font-bold text-gray-900">{services?.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Servizi Attivi</p>
              <p className="text-2xl font-bold text-gray-900">{activeServices.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Durata Media</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeServices.length > 0 
                  ? Math.round(activeServices.reduce((sum: number, s: Service) => sum + s.duration_minutes, 0) / activeServices.length)
                  : 0
                }min
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Euro className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Prezzo Medio</p>
              <p className="text-2xl font-bold text-gray-900">
                €{activeServices.length > 0 
                  ? (activeServices.reduce((sum: number, s: Service) => sum + s.price, 0) / activeServices.length).toFixed(0)
                  : 0
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Services by Category */}
      {categories.length > 0 ? (
        <div className="space-y-6">
          {categories.map(category => {
            const categoryServices = services?.filter((s: Service) => s.category === category) || []
            
            return (
              <div key={category as string} className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">{category as string}</h2>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-6">
                  {categoryServices.map((service: Service) => (
                    <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          service.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {service.is_active ? 'Attivo' : 'Inattivo'}
                        </span>
                      </div>
                      
                      {service.description && (
                        <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                      )}
                      
                      <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {service.duration_minutes}min
                        </span>
                        <span className="flex items-center font-semibold text-gray-900">
                          <Euro className="w-4 h-4 mr-1" />
                          {service.price.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link
                          href={`/services/${service.id}`}
                          className="flex-1 text-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Visualizza
                        </Link>
                        <Link
                          href={`/bookings/new?service=${service.id}`}
                          className="flex-1 text-center px-3 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                        >
                          Prenota
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Nessun servizio</h3>
            <p className="mt-1 text-sm text-gray-500">
              Inizia aggiungendo il tuo primo servizio.
            </p>
            <div className="mt-6">
              <Link
                href="/services/new"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuovo Servizio
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}