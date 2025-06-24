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
          Testa l&apos;assistente AI per WhatsApp. Simula conversazioni con i clienti.
        </p>
      </div>

      <ChatTest organizationId={organizationId} />

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Come testare:</h3>
        <ul className="text-sm space-y-1">
          <li>• <strong>&quot;Ciao&quot;</strong> - Saluto iniziale</li>
          <li>• <strong>&quot;Prenota un appuntamento&quot;</strong> - Avvia processo prenotazione</li>
          <li>• <strong>&quot;Quali servizi offrite?&quot;</strong> - Lista servizi disponibili</li>
          <li>• <strong>&quot;Le mie prenotazioni&quot;</strong> - Visualizza prenotazioni cliente</li>
          <li>• <strong>&quot;Dai un feedback di 5 stelle&quot;</strong> - Testa raccolta feedback</li>
          <li>• <strong>&quot;Cancella la mia prenotazione&quot;</strong> - Testa cancellazione</li>
        </ul>
      </div>
    </div>
  )
} 