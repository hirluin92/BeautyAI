import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PaymentData } from '@/types/financial'

interface UpdatePaymentRequest extends PaymentData {
  editReason: string
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Parse request body
    const body: UpdatePaymentRequest = await request.json()
    const { editReason, ...paymentData } = body
    
    // Validate required fields
    if (!editReason?.trim()) {
      return NextResponse.json(
        { error: 'Motivo modifica obbligatorio' },
        { status: 400 }
      )
    }
    
    if (!paymentData.paymentMethod || !paymentData.fiscalDocument || !paymentData.actualAmount) {
      return NextResponse.json(
        { error: 'Dati pagamento incompleti' },
        { status: 400 }
      )
    }
    
    // Verify booking exists and is completed
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', params.id)
      .eq('status', 'completed')
      .single()
    
    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Prenotazione non trovata o non completata' },
        { status: 404 }
      )
    }

    // Store original data for audit trail
    const originalData = {
      payment_method: booking.payment_method,
      fiscal_document: booking.fiscal_document,
      actual_amount: booking.actual_amount,
      vat_applicable: booking.vat_applicable,
      vat_amount: booking.vat_amount,
      payment_notes: booking.payment_notes
    }
    
    // Update booking with new payment data
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_method: paymentData.paymentMethod,
        fiscal_document: paymentData.fiscalDocument,
        actual_amount: paymentData.actualAmount,
        vat_applicable: paymentData.vatApplicable,
        vat_amount: paymentData.vatAmount,
        payment_notes: paymentData.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
    
    if (updateError) {
      console.error('Database update error:', updateError)
      throw new Error('Errore aggiornamento database')
    }

    // Create audit log entry (optional - only if you want full audit trail)
    const auditLogData = {
      booking_id: params.id,
      organization_id: booking.organization_id,
      user_id: booking.staff_id, // Using staff_id as user_id for now
      action: 'payment_update',
      original_data: originalData,
      new_data: {
        payment_method: paymentData.paymentMethod,
        fiscal_document: paymentData.fiscalDocument,
        actual_amount: paymentData.actualAmount,
        vat_applicable: paymentData.vatApplicable,
        vat_amount: paymentData.vatAmount,
        payment_notes: paymentData.notes
      },
      edit_reason: editReason.trim(),
      created_at: new Date().toISOString()
    }

    // Try to save audit log (don't fail if this fails)
    try {
      await supabase
        .from('audit_logs')
        .insert(auditLogData)
    } catch (auditError) {
      console.warn('Audit log save failed (non-critical):', auditError)
      // Continue execution - audit log failure shouldn't block the update
    }
    
    return NextResponse.json({
      success: true,
      message: 'Dati pagamento aggiornati con successo',
      originalData,
      newData: {
        payment_method: paymentData.paymentMethod,
        fiscal_document: paymentData.fiscalDocument,
        actual_amount: paymentData.actualAmount,
        vat_amount: paymentData.vatAmount
      }
    })
    
  } catch (error) {
    console.error('API update payment error:', error)
    return NextResponse.json(
      { 
        error: 'Errore interno del server',
        details: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    )
  }
} 