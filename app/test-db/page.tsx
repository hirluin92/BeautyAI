import { createClient } from '@/lib/supabase/server'
import { Organization, Service } from '@/types'

export default async function TestDB() {
  const supabase = await createClient()
  
  // Test 1: Controlla le organizations
  const { data: organizations, error: orgError } = await supabase
    .from('organizations')
    .select('*')
  
  // Test 2: Controlla i services
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('*')

  // Type assertions
  const typedOrganizations = organizations as Organization[] | null
  const typedServices = services as Service[] | null

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Connessione Database</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">🏢 Organizations</h2>
          {orgError ? (
            <div className="bg-red-100 p-4 rounded">
              <p className="text-red-700">Errore: {orgError.message}</p>
              <p className="text-sm text-red-600 mt-2">Dettagli: {orgError.code}</p>
            </div>
          ) : (
            <div>
              <p className="text-green-600 mb-2">✅ Connesso! Trovate {typedOrganizations?.length || 0} organizations</p>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(typedOrganizations, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">🛠️ Services</h2>
          {servicesError ? (
            <div className="bg-red-100 p-4 rounded">
              <p className="text-red-700">Errore: {servicesError.message}</p>
            </div>
          ) : (
            <div>
              <p className="text-green-600 mb-2">✅ Trovati {typedServices?.length || 0} servizi</p>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(typedServices, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-blue-100 rounded">
          <h3 className="font-semibold">📊 Riepilogo Database:</h3>
          <ul className="mt-2 space-y-1">
            <li>• Organizations: {typedOrganizations?.length || 0}</li>
            <li>• Services: {typedServices?.length || 0}</li>
            <li>• Status: {orgError || servicesError ? '❌ Errore' : '✅ Operativo'}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}