// app/(dashboard)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BarChart3, Calendar, Clock, DollarSign, Package, Users, Settings, MessageSquare, LogOut } from 'lucide-react'
import DashboardStatsClient from './DashboardStatsClient'
export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  // Get user data
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*, organization:organizations(*)')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded shadow max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Errore di Accesso</h2>
          <p className="text-gray-600 mb-4">Il tuo profilo utente non è stato trovato o non è completo. Contatta l'assistenza.</p>
          <form action="/api/auth/logout" method="POST" className="text-center">
            <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Esci</button>
          </form>
        </div>
      </div>
    )
  }

  if (!userData.organization_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded shadow max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Organizzazione mancante</h2>
          <p className="text-gray-600 mb-4">Il tuo profilo non è associato a nessuna organizzazione. Contatta l'assistenza.</p>
          <form action="/api/auth/logout" method="POST" className="text-center">
            <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Esci</button>
          </form>
        </div>
      </div>
    )
  }

  // Per tutte le query che usano organization_id, uso userData.organization_id || ''
  const orgId = userData.organization_id || '';

  // Ora recupera l'organizzazione
  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single()

  // Calcolo intervalli di oggi e mese
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  // Appuntamenti di oggi
  const { data: bookingsToday } = await supabase
    .from('bookings')
    .select('*, client:clients(*), service:services(*), staff:users!bookings_staff_id_fkey(id, full_name)')
    .eq('organization_id', orgId)
    .gte('start_at', today.toISOString())
    .lt('start_at', tomorrow.toISOString());

  const bookingsTodayArr = Array.isArray(bookingsToday) ? bookingsToday : [];
  // Raggruppo bookingsTodayArr per cliente, includendo i servizi prenotati oggi
  const clientsMap = new Map<string, { id: string; full_name: string; phone?: string; services: { name: string; start_at: string; staff_name?: string }[] }>();
  for (const b of bookingsTodayArr) {
    if (!b.client || !b.client.id) continue;
    const clientId = b.client.id;
    if (!clientsMap.has(clientId)) {
      clientsMap.set(clientId, {
        id: b.client.id,
        full_name: b.client.full_name,
        phone: b.client.phone,
        services: [],
      });
    }
    clientsMap.get(clientId)!.services.push({
      name: b.service?.name || 'Servizio',
      start_at: b.start_at,
      staff_name: b.staff?.full_name || undefined,
    });
  }
  const clientsToday = Array.from(clientsMap.values());

  // Incasso previsto di oggi
  const incassoOggi = bookingsTodayArr
    .filter(b => b.status && ['confirmed', 'completed'].includes(b.status))
    .reduce((sum, b) => sum + (b.price ?? 0), 0)

  // Incasso mensile
  const { data: bookingsMonth } = await supabase
    .from('bookings')
    .select('price, status')
    .eq('organization_id', orgId)
    .gte('start_at', monthStart.toISOString())
    .lt('start_at', monthEnd.toISOString());
  const incassoMese = (bookingsMonth || [])
    .filter(b => b.status && ['confirmed', 'completed'].includes(b.status))
    .reduce((sum, b) => sum + (b.price ?? 0), 0)

  // Stato per modale (solo in componente client, qui solo markup)
  // ...

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ciao {userData.full_name}!</h1>
        <p className="text-gray-600 mt-2">Ecco il riepilogo della tua attività di oggi</p>
      </div>
      <DashboardStatsClient
        clientsToday={clientsToday}
        bookingsTodayCount={bookingsTodayArr.length}
        incassoOggi={incassoOggi}
        incassoMese={incassoMese}
      />
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/clients/new" className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">
            <Users className="h-5 w-5 mr-2" />
            Nuovo Cliente
          </Link>
          <Link href="/services/new" className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
            <Package className="h-5 w-5 mr-2" />
            Nuovo Servizio
          </Link>
          <Link href="/calendar" className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            <Calendar className="h-5 w-5 mr-2" />
            Prenota Appuntamento
          </Link>
        </div>
      </div>
    </>
  )
}