import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase/requireAuth'

export async function POST(request: NextRequest) {
  try {
    const { userData, supabase } = await requireAuth()
    const { staffId, quantumEnabled, preferences } = await request.json()
    
    const { data, error } = await supabase
      .from('staff_quantum_sync')
      .upsert({
        organization_id: userData.organization.id,
        staff_id: staffId,
        quantum_enabled: quantumEnabled,
        optimization_preferences: preferences,
        last_sync_at: new Date().toISOString()
      }, {
        onConflict: 'organization_id,staff_id'
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
} 