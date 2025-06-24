// app/(dashboard)/dashboard/page.tsx - VERSIONE SEMPLIFICATA
import { requireAuth } from '@/lib/supabase/requireAuth'
import Link from 'next/link'
import { Calendar } from 'lucide-react'
import DashboardStatsClient from './DashboardStatsClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  // ✅ USA requireAuth STANDARDIZZATO
  const { user, userData, supabase } = await requireAuth()

  console.log('✅ Dashboard loaded for:', userData.full_name)
  console.log('🏢 Organization:', userData.organization.name)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Benvenuto, {userData.full_name}! Ecco un riepilogo della tua attività.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/bookings/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Nuova Prenotazione
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Calendar className="h-10 w-10 text-indigo-600" />
            <div>
              <h3 className="font-semibold">Calendario</h3>
              <p className="text-sm text-muted-foreground">Visualizza e gestisci appuntamenti</p>
            </div>
          </div>
          <Link 
            href="/calendar" 
            className="block mt-4 text-center bg-indigo-50 text-indigo-700 py-2 rounded-md hover:bg-indigo-100 transition-colors"
          >
            Apri Calendario
          </Link>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <div>
              <h3 className="font-semibold">Clienti</h3>
              <p className="text-sm text-muted-foreground">Gestisci la tua base clienti</p>
            </div>
          </div>
          <Link 
            href="/clients" 
            className="block mt-4 text-center bg-green-50 text-green-700 py-2 rounded-md hover:bg-green-100 transition-colors"
          >
            Gestisci Clienti
          </Link>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <svg className="h-10 w-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <div>
              <h3 className="font-semibold">Servizi</h3>
              <p className="text-sm text-muted-foreground">Configura i tuoi servizi</p>
            </div>
          </div>
          <Link 
            href="/services" 
            className="block mt-4 text-center bg-purple-50 text-purple-700 py-2 rounded-md hover:bg-purple-100 transition-colors"
          >
            Gestisci Servizi
          </Link>
        </Card>
      </div>

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informazioni Organizzazione</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-medium">{userData.organization.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Piano</p>
              <p className="font-medium capitalize">{userData.organization.plan_type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Il tuo ruolo</p>
              <p className="font-medium capitalize">{userData.role}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stato account</p>
              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Attivo
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Stats Component - TUTTA LA LOGICA STATISTICA QUI */}
      <DashboardStatsClient organizationId={userData.organization_id} />
    </div>
  )
}