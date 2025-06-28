import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase/requireAuth'
import { calculateTaxReserves } from '@/lib/financial/calculations'

export async function GET(request: NextRequest) {
  try {
    const { userData, supabase } = await requireAuth()
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const period = searchParams.get('period') || 'day'
    
    // Calculate date range based on period
    let startDate: string
    let endDate: string
    
    switch (period) {
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(weekStart.getDate() - weekStart.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        startDate = weekStart.toISOString().split('T')[0]
        endDate = weekEnd.toISOString().split('T')[0]
        break
      case 'month':
        const monthDate = new Date(date)
        startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString().split('T')[0]
        endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).toISOString().split('T')[0]
        break
      default: // day
        startDate = date
        endDate = date
    }
    
    console.log('🔍 Querying bookings for period:', period, 'date range:', startDate, 'to', endDate)
    
    // Query completed bookings with payment data - more defensive query
    const { data: completedBookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        price,
        actual_amount,
        vat_amount,
        payment_method,
        fiscal_document,
        completed_at,
        staff_id,
        clients!inner(full_name),
        services!inner(name, category)
      `)
      .eq('organization_id', userData.organization.id)
      .eq('status', 'completed')
      .gte('completed_at', `${startDate}T00:00:00`)
      .lte('completed_at', `${endDate}T23:59:59`)
      .not('completed_at', 'is', null)
    
    if (error) {
      console.error('Database query error:', error)
      throw error
    }
    
    console.log('📊 Found', completedBookings?.length || 0, 'completed bookings')
    
    // Filter bookings with actual amounts (for financial calculations)
    const bookingsWithAmounts = completedBookings?.filter(b => b.actual_amount != null) || []
    
    // Calculate statistics
    const totalRevenue = bookingsWithAmounts.reduce((sum, b) => sum + (b.actual_amount || 0), 0)
    const totalVAT = bookingsWithAmounts.reduce((sum, b) => sum + (b.vat_amount || 0), 0)
    const totalBookings = bookingsWithAmounts.length
    const averageTicket = totalBookings > 0 ? totalRevenue / totalBookings : 0
    
    // Payment methods breakdown
    const paymentMethods = bookingsWithAmounts.reduce((acc, booking) => {
      const method = booking.payment_method || 'cash'
      if (!acc[method]) acc[method] = { count: 0, amount: 0 }
      acc[method].count++
      acc[method].amount += booking.actual_amount || 0
      return acc
    }, {} as Record<string, { count: number; amount: number }>)
    
    // Fiscal documents breakdown
    const fiscalDocuments = bookingsWithAmounts.reduce((acc, booking) => {
      const doc = booking.fiscal_document || 'none'
      if (!acc[doc]) acc[doc] = { count: 0, amount: 0 }
      acc[doc].count++
      acc[doc].amount += booking.actual_amount || 0
      return acc
    }, {} as Record<string, { count: number; amount: number }>)
    
    // Calculate taxes
    const taxes = calculateTaxReserves(totalRevenue, totalVAT)
    
    // Generate warnings
    const warnings: string[] = []
    
    if (fiscalDocuments.none?.amount > 0) {
      warnings.push(`⚠️ €${fiscalDocuments.none.amount.toFixed(2)} incassati senza documento fiscale`)
    }
    
    if (paymentMethods.cash?.amount > 2000) {
      warnings.push(`💰 Alto volume contanti: €${paymentMethods.cash.amount.toFixed(2)} - considera incentivi digitali`)
    }
    
    if (totalBookings === 0) {
      warnings.push(`📊 Nessun servizio completato nel periodo selezionato`)
    }
    
    // Ensure all payment methods exist
    const normalizedPaymentMethods = {
      cash: paymentMethods.cash || { count: 0, amount: 0 },
      card: paymentMethods.card || { count: 0, amount: 0 },
      transfer: paymentMethods.transfer || { count: 0, amount: 0 },
      mixed: paymentMethods.mixed || { count: 0, amount: 0 }
    }
    
    // Ensure all fiscal documents exist
    const normalizedFiscalDocuments = {
      receipt: fiscalDocuments.receipt || { count: 0, amount: 0 },
      invoice: fiscalDocuments.invoice || { count: 0, amount: 0 },
      none: fiscalDocuments.none || { count: 0, amount: 0 }
    }
    
    const stats = {
      date: period === 'day' ? date : `${startDate} - ${endDate}`,
      period,
      totalRevenue,
      totalBookings,
      averageTicket,
      paymentMethods: normalizedPaymentMethods,
      fiscalDocuments: normalizedFiscalDocuments,
      taxes,
      warnings,
      bookings: bookingsWithAmounts
    }
    
    console.log('✅ Financial stats calculated successfully')
    return NextResponse.json(stats)
    
  } catch (error) {
    console.error('API financial stats error:', error)
    return NextResponse.json(
      { 
        error: 'Errore recupero statistiche finanziarie',
        details: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    )
  }
} 