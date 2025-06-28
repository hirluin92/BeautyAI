import { requireAuth } from '@/lib/supabase/requireAuth'
import FinancialDashboard from '@/components/financial/FinancialDashboard'

export const metadata = {
  title: 'Analytics Finanziarie - Beauty AI',
  description: 'Dashboard per monitoraggio performance finanziarie e fiscali'
}

export default async function FinancialAnalyticsPage() {
  const { userData } = await requireAuth()
  
  return (
    <div className="container mx-auto p-6">
      <FinancialDashboard />
    </div>
  )
}