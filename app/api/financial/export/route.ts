import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase/requireAuth'

export async function GET(request: NextRequest) {
  try {
    const { userData, supabase } = await requireAuth()
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const period = searchParams.get('period') || 'day'
    
    // Calculate date range
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
      default:
        startDate = date
        endDate = date
    }
    
    // Query detailed booking data
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        clients!inner(full_name, phone, email),
        services!inner(name, category),
        users!bookings_staff_id_fkey(full_name)
      `)
      .eq('organization_id', userData.organization.id)
      .eq('status', 'completed')
      .gte('completed_at', `${startDate}T00:00:00`)
      .lte('completed_at', `${endDate}T23:59:59`)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: true })
    
    if (error) throw error
    
    // Create CSV content
    const csvHeaders = [
      'Data',
      'Ora',
      'Cliente',
      'Telefono',
      'Servizio',
      'Staff',
      'Importo',
      'Metodo Pagamento',
      'Documento Fiscale',
      'IVA',
      'Note'
    ].join(',')
    
    const csvRows = bookings.map(booking => [
      new Date(booking.completed_at).toLocaleDateString('it-IT'),
      new Date(booking.completed_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      `"${booking.clients?.full_name || 'N/A'}"`,
      booking.clients?.phone || 'N/A',
      `"${booking.services?.name || 'N/A'}"`,
      `"${booking.users?.full_name || 'N/A'}"`,
      (booking.actual_amount || 0).toFixed(2),
      booking.payment_method || 'N/A',
      booking.fiscal_document || 'N/A',
      (booking.vat_amount || 0).toFixed(2),
      `"${booking.payment_notes || ''}"`
    ].join(','))
    
    const csvContent = [csvHeaders, ...csvRows].join('\n')
    
    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="financial-report-${startDate}-${endDate}.csv"`,
      },
    })
    
  } catch (error) {
    console.error('API export error:', error)
    return NextResponse.json(
      { 
        error: 'Errore generazione export',
        details: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    )
  }
} 