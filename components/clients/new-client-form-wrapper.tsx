'use client'

import { useRouter } from 'next/navigation'
import ClientForm from './client-form'

interface NewClientFormWrapperProps {
  organizationId: string
}

export default function NewClientFormWrapper({ organizationId }: NewClientFormWrapperProps) {
  const router = useRouter()

  const handleClientCreated = (clientId: string) => {
    router.push(`/clients/${clientId}`)
  }

  return (
    <ClientForm
      organizationId={organizationId}
      mode="create"
      onClientCreated={handleClientCreated}
    />
  )
} 