'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ServiceForm from '@/components/services/service-form'

interface NewServiceClientProps {
  organizationId: string
}

export default function NewServiceClient({ organizationId }: NewServiceClientProps) {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link 
            href="/services"
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Torna ai servizi
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Nuovo Servizio</h1>
        <p className="text-gray-600 mt-2">
          Aggiungi un nuovo servizio al tuo listino
        </p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <ServiceForm 
          organizationId={organizationId}
          mode="create"
        />
      </div>
    </>
  )
} 