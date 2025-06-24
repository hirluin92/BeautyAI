import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/supabase/requireAuth'
import { Edit, User, Mail, Phone, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import React from 'react'
import { DynamicPageProps } from '@/lib/utils'

export default async function StaffPage({ params }: DynamicPageProps<{ id: string }>) {
  const { userData, supabase } = await requireAuth()
  
  // ✅ FIXED: await params per Next.js 15
  const { id } = await params

  // Get staff member
  const { data: staff, error } = await supabase
    .from('staff')
    .select('*')
    .eq('id', id)
    .single()

  if (!staff) {
    notFound()
  }

  // Get recent bookings for this staff member
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select(`
      id,
      date,
      time,
      status,
      clients!inner(full_name),
      services!inner(name)
    `)
    .eq('staff_id', id)
    .eq('organization_id', userData.organization_id)
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .order('time', { ascending: true })
    .limit(10)

  // ...resto del componente invariato...
} 