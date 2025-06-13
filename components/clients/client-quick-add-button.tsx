'use client'

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import ClientQuickAddModal from './client-quick-add-modal'

interface ClientQuickAddButtonProps {
  organizationId: string
  onClientCreated: (clientId: string) => void
}

export default function ClientQuickAddButton({ organizationId, onClientCreated }: ClientQuickAddButtonProps) {
  const [showNewClientModal, setShowNewClientModal] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setShowNewClientModal(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <UserPlus className="w-4 h-4 mr-2" />
        Nuovo
      </button>

      {showNewClientModal && (
        <ClientQuickAddModal
          onClose={() => setShowNewClientModal(false)}
          onClientCreated={onClientCreated}
          organizationId={organizationId}
        />
      )}
    </>
  )
} 