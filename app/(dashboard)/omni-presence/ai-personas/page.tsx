import { Metadata } from 'next'
import AIPersonasPage from '@/components/omni-presence/AIPersonasPage'

export const metadata: Metadata = {
  title: 'AI Personas',
  description: 'Gestisci le tue AI Personas per automazione conversazioni'
}

export default function AIPersonasPageRoute() {
  return <AIPersonasPage />
} 