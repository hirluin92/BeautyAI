'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ClientError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Client detail error:', error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">Errore nel caricamento</CardTitle>
          <CardDescription>
            Si è verificato un errore durante il caricamento dei dettagli del cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            {error.message || 'Errore sconosciuto'}
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={reset} variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Riprova
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/clients">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Torna ai clienti
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 