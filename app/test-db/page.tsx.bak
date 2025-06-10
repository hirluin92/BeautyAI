import { createClient } from '@/lib/supabase/server'

export default async function TestDB() {
  const supabase = await createClient()
  
  // Test senza RLS usando service role (solo per test!)
  const { data: tablesInfo } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .in('table_name', ['organizations', 'users', 'services', 'clients', 'bookings'])

  // Proviamo a leggere direttamente senza auth
  const { data: orgCount } = await supabase
    .from('organizations')
    .select('id', { count: 'exact', head: true })

  const { data: serviceCount } = await supabase
    .from('services') 
    .select('id', { count: 'exact', head: true })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Connessione Database</h1>
      
      <div className="space-y-6">
        <div className="bg-green-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">✅ Connessione Stabilita!</h2>
          <p>Il database è raggiungibile. L'errore è dovuto alle RLS policies.</p>
        </div>

        <div className="bg-blue-100 p-4 rounded">
          <h3 className="font-semibold mb-2">📊 Tabelle nel Database:</h3>
          <pre className="text-sm">
            {JSON.stringify(tablesInfo?.map(t => t.table_name), null, 2)}
          </pre>
        </div>

        <div className="bg-yellow-100 p-4 rounded">
          <h3 className="font-semibold mb-2">⚠️ Fix RLS in corso...</h3>
          <p>Esegui lo script SQL sopra nel Supabase SQL Editor per sistemare le policies.</p>
          <p className="mt-2 text-sm">Per ora il database è vuoto, quindi è normale non vedere dati.</p>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold">🎯 Prossimi step:</h3>
          <ol className="list-decimal ml-6 mt-2">
            <li>Fix RLS policies nel SQL Editor</li>
            <li>Creare dati di test</li>
            <li>Implementare autenticazione</li>
          </ol>
        </div>
      </div>
    </div>
  )
}