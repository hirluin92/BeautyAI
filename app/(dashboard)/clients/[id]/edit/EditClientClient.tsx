'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Client } from '@/types'
import ClientForm from '@/components/clients/client-form'

interface EditClientClientProps {
  client: Client
  organizationId: string
}

export default function EditClientClient({ client, organizationId }: EditClientClientProps) {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link 
            href={`/clients/${client.id}`}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Torna al cliente
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Modifica Cliente</h1>
        <p className="text-gray-600 mt-2">
          Aggiorna le informazioni di {client.full_name}
        </p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <ClientForm 
          organizationId={organizationId}
          mode="edit"
          client={client}
        />
      </div>
    </>
  )
} 