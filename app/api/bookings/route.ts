import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 401 })

  const { data: userData } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()
  if (!userData || !userData.organization_id) return NextResponse.json([], { status: 404 })

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      client:clients(id, full_name, phone),
      service:services(id, name, duration_minutes, price),
      staff:users!bookings_staff_id_fkey(id, full_name)
    `)
    .eq('organization_id', userData.organization_id)
    .gte('start_at', from)
    .lt('start_at', to)
    .order('start_at', { ascending: true })

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(bookings)
} 