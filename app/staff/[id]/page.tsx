import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/supabase/requireAuth'
import { DynamicPageProps } from '@/lib/utils'

interface StaffBooking {
  id: string
  date: string
  time: string
  status: string
  clients: {
    full_name: string
  }[]
  services: {
    name: string
  }[]
}

export default async function StaffPage({ params }: DynamicPageProps<{ id: string }>) {
  const { userData, supabase } = await requireAuth()
  
  // ✅ FIXED: await params per Next.js 15
  const { id } = await params

  // Get staff member
  const { data: staff } = await supabase
    .from('staff')
    .select('*')
    .eq('id', id)
    .single()

  if (!staff) {
    notFound()
  }

  // Get recent bookings for this staff member
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select(`
      id,
      date,
      time,
      status,
      clients!inner(full_name),
      services!inner(name)
    `)
    .eq('staff_id', id)
    .eq('organization_id', userData.organization_id)
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .order('time', { ascending: true })
    .limit(10)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dettagli Staff</h1>
          <p className="text-muted-foreground">
            Informazioni su {staff.full_name}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Informazioni Personali</h2>
          <div className="space-y-2">
            <p><strong>Nome:</strong> {staff.full_name}</p>
            <p><strong>Email:</strong> {staff.email}</p>
            <p><strong>Telefono:</strong> {staff.phone}</p>
            <p><strong>Ruolo:</strong> {staff.role}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Prenotazioni Recenti</h2>
          <div className="space-y-2">
            {recentBookings && recentBookings.length > 0 ? (
              recentBookings.map((booking: StaffBooking) => (
                <div key={booking.id} className="p-3 border rounded-lg">
                  <p className="font-medium">{booking.clients[0]?.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.services[0]?.name} - {booking.date} {booking.time}
                  </p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Nessuna prenotazione recente</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 