// app/api/client-dna/route.ts
// ... (tutto il codice che hai fornito per la route API Client DNA) ... 

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase/requireAuth'

export async function GET(request: NextRequest) {
  try {
    const { userData, supabase } = await requireAuth()
    
    // Get client DNA data
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select(`
        id,
        full_name,
        email,
        phone,
        created_at,
        total_bookings,
        total_spent,
        last_booking_date,
        preferences,
        notes
      `)
      .eq('organization_id', userData.organization.id)
      .order('created_at', { ascending: false })

    if (clientsError) throw clientsError

    // Get booking data for analysis
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        client_id,
        service_id,
        staff_id,
        booking_date,
        status,
        total_amount,
        created_at
      `)
      .eq('organization_id', userData.organization.id)
      .gte('booking_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())

    if (bookingsError) throw bookingsError

    // Analyze client DNA
    const clientDNA = clients.map(client => {
      const clientBookings = bookings.filter(b => b.client_id === client.id)
      const completedBookings = clientBookings.filter(b => b.status === 'completed')
      const cancelledBookings = clientBookings.filter(b => b.status === 'cancelled')
      const noShows = clientBookings.filter(b => b.status === 'no_show')

      // Calculate metrics
      const totalSpent = completedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
      const avgBookingValue = completedBookings.length > 0 ? totalSpent / completedBookings.length : 0
      const bookingFrequency = clientBookings.length / Math.max(1, (Date.now() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)) // bookings per month
      const loyaltyScore = Math.min(100, (completedBookings.length * 10) + (totalSpent / 100))
      const reliabilityScore = Math.max(0, 100 - (noShows.length * 20) - (cancelledBookings.length * 10))

      // Determine client segment
      let segment = 'new'
      if (completedBookings.length >= 10 && totalSpent >= 1000) segment = 'vip'
      else if (completedBookings.length >= 5 && totalSpent >= 500) segment = 'regular'
      else if (completedBookings.length >= 2) segment = 'active'
      else if (completedBookings.length === 1) segment = 'new'

      // Determine preferences
      const servicePreferences = completedBookings.reduce((acc, booking) => {
        acc[booking.service_id] = (acc[booking.service_id] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const preferredServices = Object.entries(servicePreferences)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([serviceId]) => serviceId)

      return {
        id: client.id,
        name: client.full_name,
        email: client.email,
        phone: client.phone,
        segment,
        metrics: {
          totalBookings: clientBookings.length,
          completedBookings: completedBookings.length,
          cancelledBookings: cancelledBookings.length,
          noShows: noShows.length,
          totalSpent,
          avgBookingValue,
          bookingFrequency,
          loyaltyScore,
          reliabilityScore
        },
        preferences: {
          preferredServices,
          lastVisit: client.last_booking_date,
          notes: client.notes
        },
        dna: {
          riskLevel: reliabilityScore < 50 ? 'high' : reliabilityScore < 80 ? 'medium' : 'low',
          valueTier: totalSpent >= 1000 ? 'premium' : totalSpent >= 500 ? 'standard' : 'basic',
          engagementLevel: bookingFrequency >= 2 ? 'high' : bookingFrequency >= 0.5 ? 'medium' : 'low'
        }
      }
    })

    // Calculate aggregate statistics
    const totalClients = clientDNA.length
    const vipClients = clientDNA.filter(c => c.segment === 'vip').length
    const regularClients = clientDNA.filter(c => c.segment === 'regular').length
    const activeClients = clientDNA.filter(c => c.segment === 'active').length
    const newClients = clientDNA.filter(c => c.segment === 'new').length

    const totalRevenue = clientDNA.reduce((sum, c) => sum + c.metrics.totalSpent, 0)
    const avgClientValue = totalClients > 0 ? totalRevenue / totalClients : 0
    const avgLoyaltyScore = totalClients > 0 ? clientDNA.reduce((sum, c) => sum + c.metrics.loyaltyScore, 0) / totalClients : 0
    const avgReliabilityScore = totalClients > 0 ? clientDNA.reduce((sum, c) => sum + c.metrics.reliabilityScore, 0) / totalClients : 0

    return NextResponse.json({
      clients: clientDNA,
      statistics: {
        totalClients,
        segmentDistribution: {
          vip: vipClients,
          regular: regularClients,
          active: activeClients,
          new: newClients
        },
        totalRevenue,
        avgClientValue,
        avgLoyaltyScore,
        avgReliabilityScore
      }
    })

  } catch (error) {
    console.error('Client DNA API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userData, supabase } = await requireAuth()
    const body = await request.json()
    
    const { action, clientId, data } = body

    switch (action) {
      case 'update_preferences':
        const { data: updatedClient, error: updateError } = await supabase
          .from('clients')
          .update({
            preferences: data.preferences,
            notes: data.notes
          })
          .eq('id', clientId)
          .eq('organization_id', userData.organization.id)
          .select()
          .single()

        if (updateError) throw updateError
        return NextResponse.json(updatedClient)

      case 'add_note':
        const { data: client, error: clientError } = await supabase
          .from('clients')
          .select('notes')
          .eq('id', clientId)
          .eq('organization_id', userData.organization.id)
          .single()

        if (clientError) throw clientError

        const updatedNotes = client.notes ? `${client.notes}\n${new Date().toISOString()}: ${data.note}` : `${new Date().toISOString()}: ${data.note}`

        const { data: updatedClientWithNote, error: noteError } = await supabase
          .from('clients')
          .update({ notes: updatedNotes })
          .eq('id', clientId)
          .eq('organization_id', userData.organization.id)
          .select()
          .single()

        if (noteError) throw noteError
        return NextResponse.json(updatedClientWithNote)

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Client DNA API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 