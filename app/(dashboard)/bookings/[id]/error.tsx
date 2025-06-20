// app/(dashboard)/bookings/[id]/error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function BookingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Booking page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">
            Si è verificato un errore
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            Non siamo riusciti a caricare i dettagli della prenotazione.
          </p>
          
          {error.message && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                Dettagli: {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={reset}
              variant="outline"
              className="flex-1"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Riprova
            </Button>
            <Link href="/calendar" className="flex-1">
              <Button className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Torna al calendario
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}