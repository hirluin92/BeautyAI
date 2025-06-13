import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 401 })

  const { data: userData } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()
  if (!userData || !userData.organization_id) return NextResponse.json([], { status: 404 })

  const { data: staff, error } = await supabase
    .from('users')
    .select('id, full_name')
    .eq('organization_id', userData.organization_id)
    .eq('is_active', true)
    .order('full_name')

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(staff)
} 