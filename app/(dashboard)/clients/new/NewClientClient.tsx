'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import NewClientFormWrapper from '@/components/clients/new-client-form-wrapper'

interface NewClientClientProps {
  organizationId: string
}

export default function NewClientClient({ organizationId }: NewClientClientProps) {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link 
            href="/clients"
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Torna ai clienti
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Nuovo Cliente</h1>
        <p className="text-gray-600 mt-2">
          Aggiungi un nuovo cliente al tuo sistema
        </p>
      </div>
      
      {/* Form */}
      <div className="max-w-2xl">
        <NewClientFormWrapper 
          organizationId={organizationId}
        />
      </div>
    </>
  )
} 