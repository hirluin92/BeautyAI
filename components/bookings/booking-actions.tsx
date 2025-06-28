'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, X, Clock, AlertCircle, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface BookingActionsProps {
  bookingId: string
  currentStatus: string
  bookingPrice?: number
  onStatusChange?: (newStatus: string) => void
}

interface PaymentData {
  method: 'cash' | 'card' | 'bank_transfer' | 'mixed'
  fiscalDocument: 'receipt' | 'invoice' | 'none'
  amount: number
  notes: string
}

export function BookingActions({ 
  bookingId, 
  currentStatus, 
  bookingPrice = 0,
  onStatusChange 
}: BookingActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState<string | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentData, setPaymentData] = useState<PaymentData>({
    method: 'cash',
    fiscalDocument: 'receipt',
    amount: bookingPrice,
    notes: ''
  })
  
  const supabase = createClient()

  const handleAction = async (action: string) => {
    if (action === 'complete') {
      // Per "complete", apri il form pagamento invece del dialog di conferma
      setShowPaymentForm(true)
      return
    }

    setLoading(action)
    setShowDialog(null)

    try {
      let result
      
      switch (action) {
        case 'confirm':
          result = await supabase.rpc('confirm_booking', { booking_id: bookingId })
          break
        case 'no_show':
          result = await supabase.rpc('mark_booking_no_show', { booking_id: bookingId })
          break
        case 'cancel':
          result = await supabase
            .from('bookings')
            .update({ 
              status: 'cancelled',
              updated_at: new Date().toISOString()
            })
            .eq('id', bookingId)
          break
        default:
          throw new Error('Invalid action')
      }

      if (result.error) throw result.error

      // Show success toast
      switch (action) {
        case 'confirm':
          toast.success('Prenotazione confermata', {
            description: 'Il cliente riceverà una notifica di conferma'
          })
          break
        case 'no_show':
          toast.warning('Segnato come No Show', {
            description: 'Il cliente non si è presentato all\'appuntamento'
          })
          break
        case 'cancel':
          toast.info('Prenotazione annullata', {
            description: 'La prenotazione è stata annullata'
          })
          break
      }

      // Notify parent component
      const newStatus = action === 'no_show' ? 'no_show' : action === 'confirm' ? 'confirmed' : 'cancelled'
      if (onStatusChange) {
        onStatusChange(newStatus)
      } else if (typeof window !== 'undefined') {
        window.location.reload()
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Si è verificato un errore'
      console.error(`Error performing ${action}:`, error)
      toast.error(`Errore durante l'operazione`, {
        description: errorMessage
      })
    } finally {
      setLoading(null)
    }
  }

  const handleCompleteWithPayment = async () => {
    setLoading('complete')

    try {
      // Prima salva i dati di pagamento
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: bookingId,
          method: paymentData.method,
          fiscal_document: paymentData.fiscalDocument,
          amount: paymentData.amount,
          notes: paymentData.notes,
          created_at: new Date().toISOString()
        })

      if (paymentError) throw paymentError

      // Poi completa la prenotazione
      const { error: bookingError } = await supabase.rpc('complete_booking', { 
        booking_id: bookingId 
      })

      if (bookingError) throw bookingError

      toast.success('Prenotazione completata', {
        description: 'Servizio completato e pagamento registrato con successo'
      })

      setShowPaymentForm(false)

      // Notify parent component
      if (onStatusChange) {
        onStatusChange('completed')
      } else if (typeof window !== 'undefined') {
        window.location.reload()
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Si è verificato un errore'
      console.error('Error completing booking with payment:', error)
      toast.error('Errore durante il completamento', {
        description: errorMessage
      })
    } finally {
      setLoading(null)
    }
  }

  const calculateTaxBreakdown = () => {
    const total = paymentData.amount
    const taxableAmount = total / 1.22 // Assumendo IVA 22%
    const taxAmount = total - taxableAmount
    return { taxableAmount, taxAmount, total }
  }

  // Don't show actions for completed or cancelled bookings
  if (['completed', 'cancelled', 'no_show'].includes(currentStatus)) {
    return null
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {currentStatus === 'scheduled' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowDialog('confirm')}
            disabled={loading !== null}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <Check className="w-4 h-4 mr-1" />
            Conferma
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAction('complete')}
          disabled={loading !== null}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Clock className="w-4 h-4 mr-1" />
          Completa
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowDialog('no_show')}
          disabled={loading !== null}
          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
        >
          <AlertCircle className="w-4 h-4 mr-1" />
          No Show
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowDialog('cancel')}
          disabled={loading !== null}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <X className="w-4 h-4 mr-1" />
          Annulla
        </Button>
      </div>

      {/* Payment Form Dialog */}
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Completa Servizio - Inserisci Dati Pagamento
            </DialogTitle>
            <DialogDescription>
              Prima di completare il servizio, inserisci i dati del pagamento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Payment Method */}
            <div>
              <Label className="text-sm font-medium">Metodo di Pagamento</Label>
              <div className="mt-2 space-y-2">
                {[
                  { value: 'cash', label: '💵 Contanti', icon: '💵' },
                  { value: 'card', label: '💳 Carta', icon: '💳' },
                  { value: 'bank_transfer', label: '🏦 Bonifico', icon: '🏦' },
                  { value: 'mixed', label: '🔄 Pagamento Misto', icon: '🔄' }
                ].map((method) => (
                  <label key={method.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value={method.value}
                      checked={paymentData.method === method.value}
                      onChange={(e) => setPaymentData(prev => ({
                        ...prev,
                        method: e.target.value as PaymentData['method']
                      }))}
                      className="text-blue-600"
                    />
                    <span>{method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fiscal Document */}
            <div>
              <Label className="text-sm font-medium">Documento Fiscale</Label>
              <div className="mt-2 space-y-2">
                {[
                  { value: 'receipt', label: '📄 Scontrino fiscale', icon: '📄' },
                  { value: 'invoice', label: '📋 Fattura elettronica', icon: '📋' },
                  { value: 'none', label: '❌ Nessun documento', icon: '❌' }
                ].map((doc) => (
                  <label key={doc.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value={doc.value}
                      checked={paymentData.fiscalDocument === doc.value}
                      onChange={(e) => setPaymentData(prev => ({
                        ...prev,
                        fiscalDocument: e.target.value as PaymentData['fiscalDocument']
                      }))}
                      className="text-blue-600"
                    />
                    <span>{doc.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="amount">Importo Effettivo</Label>
              <Input
                id="amount"
                type="number"
                value={paymentData.amount}
                onChange={(e) => setPaymentData(prev => ({
                  ...prev,
                  amount: parseFloat(e.target.value) || 0
                }))}
                step="0.01"
                min="0"
                className="mt-1"
              />
            </div>

            {/* Tax Breakdown */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Riepilogo Fiscale:</h3>
              <div className="grid grid-cols-3 gap-4 text-sm text-blue-800">
                <div>
                  <span className="block font-medium">Importo totale:</span>
                  <span>€{calculateTaxBreakdown().total.toFixed(2)}</span>
                </div>
                <div>
                  <span className="block font-medium">Imponibile:</span>
                  <span>€{calculateTaxBreakdown().taxableAmount.toFixed(2)}</span>
                </div>
                <div>
                  <span className="block font-medium">IVA (22%):</span>
                  <span>€{calculateTaxBreakdown().taxAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="payment-notes">Note Pagamento</Label>
              <Textarea
                id="payment-notes"
                value={paymentData.notes}
                onChange={(e) => setPaymentData(prev => ({
                  ...prev,
                  notes: e.target.value
                }))}
                placeholder="Note aggiuntive sul pagamento..."
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowPaymentForm(false)}
                disabled={loading !== null}
              >
                Annulla
              </Button>
              <Button
                onClick={handleCompleteWithPayment}
                disabled={loading !== null || paymentData.amount <= 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading === 'complete' ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Completamento...
                  </div>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Completa e Salva Pagamento
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Existing Confirmation Dialogs */}
      <AlertDialog open={showDialog === 'confirm'} onOpenChange={(open: boolean) => !open && setShowDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Prenotazione</AlertDialogTitle>
            <AlertDialogDescription>
              Vuoi confermare questa prenotazione? Il cliente riceverà una notifica di conferma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleAction('confirm')}>
              Conferma
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDialog === 'no_show'} onOpenChange={(open: boolean) => !open && setShowDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Segnala No Show</AlertDialogTitle>
            <AlertDialogDescription>
              Il cliente non si è presentato all&apos;appuntamento? Questo verrà registrato nel suo storico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleAction('no_show')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Segnala No Show
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDialog === 'cancel'} onOpenChange={(open: boolean) => !open && setShowDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annulla Prenotazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler annullare questa prenotazione?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantieni</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleAction('cancel')}
              className="bg-red-600 hover:bg-red-700"
            >
              Sì, annulla
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default BookingActions