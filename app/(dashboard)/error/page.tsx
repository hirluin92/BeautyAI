// app/(dashboard)/error/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ErrorPage() {
  const router = useRouter()

  useEffect(() => {
    // Opzionale: redirect automatico dopo alcuni secondi
    const timer = setTimeout(() => {
      router.push('/login')
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-red-600 mb-4">
            Errore di Accesso
          </h1>
          <p className="text-gray-600 mb-8">
            Si è verificato un errore inaspettato. Riprova più tardi.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Esci e riprova
            </button>
            <p className="text-sm text-gray-500">
              Verrai reindirizzato automaticamente tra 5 secondi...
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Se il problema persiste, contatta il supporto tecnico.
          </p>
        </div>
      </div>
    </div>
  )
}