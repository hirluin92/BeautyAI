import { Metadata } from 'next'
import CampaignsPage from '@/components/omni-presence/CampaignsPage'

export const metadata: Metadata = {
  title: 'Campagne Omni-Channel',
  description: 'Gestisci le tue campagne marketing multi-canale'
}

export default function CampaignsPageRoute() {
  return <CampaignsPage />
} 