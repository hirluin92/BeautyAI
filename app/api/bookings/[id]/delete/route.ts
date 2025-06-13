// app/(dashboard)/bookings/[id]/delete/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  await supabase.from('bookings').delete().eq('id', params.id)
  return NextResponse.redirect(new URL('/calendar', req.url))
}
