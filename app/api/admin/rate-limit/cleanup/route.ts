import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimitManager } from '@/lib/rate-limit'
import { requireAuth } from '@/lib/supabase/requireAuth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { daysToKeep = 7 } = body

    const { userData, supabase } = await requireAuth()
    
    // Verify admin role
    if (userData.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    console.log('🧹 Starting rate limit cleanup for organization:', userData.organization.name)

    // Esegui cleanup
    await rateLimitManager.cleanupOldLogs(daysToKeep)

    // Ottieni statistiche storage dopo cleanup
    const stats = await rateLimitManager.getStats()
    
    return NextResponse.json({
      success: true,
      message: 'Cleanup completed',
      storageStats: {
        logsDeleted: stats.totalRequests,
        violationsDeleted: stats.totalViolations,
        storageSaved: `${Math.round((stats.totalRequests + stats.totalViolations) * 0.001 * 100) / 100} MB`
      }
    })
  } catch (error) {
    console.error('Error during cleanup:', error)
    return NextResponse.json(
      { success: false, error: 'Cleanup failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userData, supabase } = await requireAuth()

    // Verifica ruolo admin
    if (userData.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Ottieni statistiche storage
    const { data: storageStats } = await supabase
      .rpc('get_storage_usage')

    // Ottieni statistiche rate limiting
    const { data: rateLimitStats } = await supabase
      .rpc('get_rate_limit_stats')

    return NextResponse.json({
      success: true,
      data: {
        storageStats,
        rateLimitStats: rateLimitStats?.[0] || {
          total_requests: 0,
          total_violations: 0,
          violation_rate: 0,
          avg_response_time: 0
        }
      }
    })

  } catch (error) {
    console.error('Error getting storage stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 