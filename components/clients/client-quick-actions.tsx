'use client'

import Link from 'next/link'
import { Client } from '@/types'

interface ClientQuickActionsProps {
  client: Client
}

export default function ClientQuickActions({ client }: ClientQuickActionsProps) {
  const whatsappPhone = client.whatsapp_phone || ''

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
      <div className="space-y-3">
        <Link
          href={`/bookings/new?client=${client.id}`}
          className="block w-full text-center bg-indigo-600 text-white rounded-md px-4 py-3 hover:bg-indigo-700 transition"
        >
          Nuova Prenotazione
        </Link>
        <button
          className="block w-full text-center bg-green-600 text-white rounded-md px-4 py-3 hover:bg-green-700 transition"
          onClick={() => window.open(`tel:${client.phone}`)}
        >
          Chiama Cliente
        </button>
        {client.email && (
          <button
            className="block w-full text-center bg-blue-600 text-white rounded-md px-4 py-3 hover:bg-blue-700 transition"
            onClick={() => window.open(`mailto:${client.email}`)}
          >
            Invia Email
          </button>
        )}
        {whatsappPhone && (
          <button
            className="block w-full text-center bg-green-500 text-white rounded-md px-4 py-3 hover:bg-green-600 transition"
            onClick={() => window.open(`https://wa.me/${whatsappPhone.replace(/\s/g, '')}`)}
          >
            WhatsApp
          </button>
        )}
      </div>
    </div>
  )
} 