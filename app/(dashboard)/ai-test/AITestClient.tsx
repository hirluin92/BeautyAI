'use client'

import ChatTest from '@/components/ai/chat-test'

interface AITestClientProps {
  organizationId: string
}

export default function AITestClient({ organizationId }: AITestClientProps) {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Test AI Chat</h1>
        <p className="text-muted-foreground">
          Testa l'assistente AI per WhatsApp. Simula conversazioni con i clienti.
        </p>
      </div>

      <ChatTest organizationId={organizationId} />

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Come testare:</h3>
        <ul className="text-sm space-y-1">
          <li>• <strong>"Ciao"</strong> - Saluto iniziale</li>
          <li>• <strong>"Prenota un appuntamento"</strong> - Avvia processo prenotazione</li>
          <li>• <strong>"Quali servizi offrite?"</strong> - Lista servizi disponibili</li>
          <li>• <strong>"Le mie prenotazioni"</strong> - Visualizza prenotazioni cliente</li>
          <li>• <strong>"Dai un feedback di 5 stelle"</strong> - Testa raccolta feedback</li>
          <li>• <strong>"Cancella la mia prenotazione"</strong> - Testa cancellazione</li>
        </ul>
      </div>
    </div>
  )
} 