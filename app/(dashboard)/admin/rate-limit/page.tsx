import { requireAdminAuth } from '@/lib/supabase/requireAuth'
import RateLimitClient from './RateLimitClient'

export default async function RateLimitPage() {
  const { userData, supabase } = await requireAdminAuth()

  // Fetch rate limit statistics server-side
  const { data: stats, error } = await supabase
    .from('rate_limit_logs')
    .select('*')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const { data: violations } = await supabase
    .from('rate_limit_violations')
    .select('*')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  if (error) {
    throw new Error('Errore nel caricamento delle statistiche rate limiting')
  }

  // Calculate statistics
  const totalRequests = stats?.length || 0
  const totalViolations = violations?.length || 0
  const violationRate = totalRequests > 0 ? totalViolations / totalRequests : 0

  const rateLimitStats = {
    totalRequests,
    totalViolations,
    violationRate,
    logs: stats || [],
    violations: violations || []
  }

  return (
    <RateLimitClient stats={rateLimitStats} />
  )
} 