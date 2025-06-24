import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/supabase/requireAuth'

// Validation schema
const statsQuerySchema = z.object({
  period: z.enum(['hour', 'day', 'week', 'month']).default('day'),
  limit_type: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { userData, supabase } = await requireAuth()
    
    // Verify admin role
    if (userData.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    console.log('📊 Getting rate limit stats for organization:', userData.organization.name)

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedParams = statsQuerySchema.parse(queryParams);
    
    // Calculate time range
    const now = new Date();
    let startDate: Date;
    
    switch (validatedParams.period) {
      case 'hour':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Build query
    let query = supabase
      .from('rate_limit_logs')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', now.toISOString());

    if (validatedParams.limit_type) {
      query = query.eq('limit_type', validatedParams.limit_type);
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error('Error fetching rate limit stats:', error);
      return NextResponse.json(
        { error: 'Errore durante il recupero delle statistiche' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const stats = {
      total_requests: logs?.length || 0,
      blocked_requests: logs?.filter((log: any) => log.blocked).length || 0,
      unique_ips: new Set(logs?.map((log: any) => log.ip_address)).size,
      unique_users: new Set(logs?.map((log: any) => log.user_id).filter(Boolean)).size,
      by_type: logs?.reduce((acc: Record<string, number>, log: any) => {
        acc[log.limit_type] = (acc[log.limit_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      period: validatedParams.period,
      start_date: startDate.toISOString(),
      end_date: now.toISOString(),
    };

    return NextResponse.json(stats);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parametri non validi', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error in GET /api/admin/rate-limit/stats:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
} 