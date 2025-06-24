'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Service } from '@/types'
import ServiceForm from '@/components/services/service-form'

interface EditServiceClientProps {
  service: Service
  organizationId: string
}

export default function EditServiceClient({ service, organizationId }: EditServiceClientProps) {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link 
            href={`/services/${service.id}`}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Torna al servizio
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Modifica Servizio</h1>
        <p className="text-gray-600 mt-2">
          Aggiorna le informazioni di {service.name}
        </p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <ServiceForm 
          organizationId={organizationId}
          mode="edit"
          service={service}
        />
      </div>
    </>
  )
} 