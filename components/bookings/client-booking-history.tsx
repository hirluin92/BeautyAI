// components/bookings/client-booking-history.tsx
'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'

interface Props {
  clientId: string
  excludeBookingId?: string
}

export default function ClientBookingHistory({ clientId, excludeBookingId }: Props) {
  const supabase = useMemo(() => createClient(), [])
  const [bookings, setBookings] = useState<any[]>([])

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('id, start_at, status')
      .eq('client_id', clientId)
      .neq('id', excludeBookingId || '')
      .order('start_at', { ascending: false })

    if (!error && data) setBookings(data)
  }, [supabase, clientId, excludeBookingId])

  useEffect(() => {
    load()
  }, [load])

  if (!bookings.length) return <p className="text-sm text-gray-500">Nessuna altra prenotazione trovata.</p>

  return (
    <ul className="divide-y divide-gray-200">
      {bookings.map(b => (
        <li key={b.id} className="py-2 text-sm text-gray-700">
          <Link href={`/bookings/${b.id}`} className="hover:underline text-indigo-600">
            {format(parseISO(b.start_at), 'dd/MM/yyyy HH:mm', { locale: it })}
          </Link>{' '}
          - <span className="capitalize">{b.status}</span>
        </li>
      ))}
    </ul>
  )
}
