'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { calculateVAT } from '@/lib/financial/calculations'
import { PaymentData } from '@/types/financial'
import { AlertTriangle, DollarSign } from 'lucide-react'

interface PaymentEditModalProps {
  booking: {
    id: string
    client: { full_name: string }
    service: { name: string }
    price: number
    payment_method?: string
    fiscal_document?: string
    actual_amount?: number
    vat_amount?: number
    payment_notes?: string
    completed_at?: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (bookingId: string, paymentData: PaymentData, reason: string) => Promise<void>
}

export default function PaymentEditModal({ 
  booking, 
  open, 
  onOpenChange, 
  onUpdate 
}: PaymentEditModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentData['paymentMethod']>(
    (booking.payment_method as PaymentData['paymentMethod']) || 'card'
  )
  const [fiscalDocument, setFiscalDocument] = useState<PaymentData['fiscalDocument']>(
    (booking.fiscal_document as PaymentData['fiscalDocument']) || 'receipt'
  )
  const [actualAmount, setActualAmount] = useState(booking.actual_amount || booking.price)
  const [notes, setNotes] = useState(booking.payment_notes || '')
  const [editReason, setEditReason] = useState('')
  const [loading, setLoading] = useState(false)

  const vatCalc = calculateVAT(actualAmount, fiscalDocument)
  
  const hasChanges = (
    paymentMethod !== booking.payment_method ||
    fiscalDocument !== booking.fiscal_document ||
    actualAmount !== booking.actual_amount ||
    notes !== booking.payment_notes
  )

  const handleUpdate = async () => {
    if (!editReason.trim()) {
      alert('Inserisci il motivo della modifica')
      return
    }

    if (!hasChanges) {
      alert('Nessuna modifica da salvare')
      return
    }

    setLoading(true)
    
    const paymentData: PaymentData = {
      paymentMethod,
      fiscalDocument,
      actualAmount,
      vatApplicable: vatCalc.vatApplicable,
      vatAmount: vatCalc.vatAmount,
      notes: notes.trim() || undefined
    }

    try {
      await onUpdate(booking.id, paymentData, editReason)
      onOpenChange(false)
      // Reset form
      setEditReason('')
    } catch (error) {
      console.error('Errore aggiornamento pagamento:', error)
      alert('Errore durante l\'aggiornamento del pagamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full sm:max-w-lg p-0 sm:p-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm p-6 border-b">
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Modifica Dati Pagamento
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 p-6">
          {/* Booking Info */}
          <Card>
            <CardContent className="p-3">
              <div className="space-y-1">
                <div className="font-medium text-sm">{booking.client.full_name}</div>
                <div className="text-xs text-muted-foreground">{booking.service.name}</div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Prezzo base:</span>
                  <Badge variant="outline" className="text-xs">€{booking.price}</Badge>
                </div>
                {booking.completed_at && (
                  <div className="text-xs text-muted-foreground">
                    Completato: {new Date(booking.completed_at).toLocaleString('it-IT')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Changes Alert */}
          {hasChanges && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                Modifiche rilevate - verrà creato un log di audit
              </AlertDescription>
            </Alert>
          )}

          {/* Payment Method */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Metodo di Pagamento</Label>
            <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="payment-cash" />
                <Label htmlFor="payment-cash" className="text-sm flex items-center gap-1">
                  💸 Contanti
                  {booking.payment_method === 'cash' && (
                    <Badge variant="secondary" className="text-xs">Attuale</Badge>
                  )}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="payment-card" />
                <Label htmlFor="payment-card" className="text-sm flex items-center gap-1">
                  💳 Carta
                  {booking.payment_method === 'card' && (
                    <Badge variant="secondary" className="text-xs">Attuale</Badge>
                  )}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="transfer" id="payment-transfer" />
                <Label htmlFor="payment-transfer" className="text-sm flex items-center gap-1">
                  🏦 Bonifico
                  {booking.payment_method === 'transfer' && (
                    <Badge variant="secondary" className="text-xs">Attuale</Badge>
                  )}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mixed" id="payment-mixed" />
                <Label htmlFor="payment-mixed" className="text-sm flex items-center gap-1">
                  🔄 Pagamento Misto
                  {booking.payment_method === 'mixed' && (
                    <Badge variant="secondary" className="text-xs">Attuale</Badge>
                  )}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Fiscal Document */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Documento Fiscale</Label>
            <RadioGroup value={fiscalDocument} onValueChange={(value: any) => setFiscalDocument(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="receipt" id="fiscal-receipt" />
                <Label htmlFor="fiscal-receipt" className="text-sm flex items-center gap-1">
                  🧾 Scontrino fiscale
                  {booking.fiscal_document === 'receipt' && (
                    <Badge variant="secondary" className="text-xs">Attuale</Badge>
                  )}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="invoice" id="fiscal-invoice" />
                <Label htmlFor="fiscal-invoice" className="text-sm flex items-center gap-1">
                  📄 Fattura elettronica
                  {booking.fiscal_document === 'invoice' && (
                    <Badge variant="secondary" className="text-xs">Attuale</Badge>
                  )}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="fiscal-none" />
                <Label htmlFor="fiscal-none" className="text-sm flex items-center gap-1">
                  ❌ Nessun documento
                  {booking.fiscal_document === 'none' && (
                    <Badge variant="secondary" className="text-xs">Attuale</Badge>
                  )}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="payment-amount" className="text-sm font-medium">Importo Effettivo</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                value={actualAmount}
                onChange={(e) => setActualAmount(parseFloat(e.target.value) || 0)}
                className={actualAmount !== booking.actual_amount ? 'border-blue-300' : ''}
              />
              {booking.actual_amount && actualAmount !== booking.actual_amount && (
                <Badge variant="outline" className="text-xs whitespace-nowrap">
                  Era: €{booking.actual_amount}
                </Badge>
              )}
            </div>
          </div>

          {/* VAT Calculation Preview */}
          <Card className={fiscalDocument === 'none' ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}>
            <CardContent className="p-3">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Riepilogo Fiscale:</span>
                  {booking.vat_amount && vatCalc.vatAmount !== booking.vat_amount && (
                    <Badge variant="outline" className="text-xs">
                      IVA era: €{booking.vat_amount.toFixed(2)}
                    </Badge>
                  )}
                </div>
                <div className="flex justify-between">
                  <span>Importo totale:</span>
                  <span className="font-medium">€{actualAmount.toFixed(2)}</span>
                </div>
                {vatCalc.vatApplicable ? (
                  <>
                    <div className="flex justify-between">
                      <span>Imponibile:</span>
                      <span>€{vatCalc.baseAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IVA (22%):</span>
                      <span className={
                        booking.vat_amount && vatCalc.vatAmount !== booking.vat_amount 
                          ? 'font-bold text-blue-600' 
                          : 'font-medium'
                      }>
                        €{vatCalc.vatAmount.toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-orange-600 text-xs">
                    ⚠️ Nessuna IVA da versare (no documento fiscale)
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Notes */}
          <div className="space-y-2">
            <Label htmlFor="payment-notes" className="text-sm font-medium">Note Pagamento</Label>
            <Textarea
              id="payment-notes"
              placeholder="Note aggiuntive sul pagamento..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="text-sm"
            />
          </div>

          {/* Edit Reason - MANDATORY */}
          <div className="space-y-2">
            <Label htmlFor="edit-reason" className="text-sm font-medium text-red-600">
              Motivo Modifica *
            </Label>
            <Textarea
              id="edit-reason"
              placeholder="Es: Errore inserimento importo, cliente ha cambiato metodo pagamento, correzione documento fiscale..."
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              rows={2}
              className="border-red-200 text-sm"
              required
            />
            <p className="text-xs text-muted-foreground">
              Obbligatorio per audit trail - spiega il motivo della modifica
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annulla
            </Button>
            <Button
              className="flex-1"
              onClick={handleUpdate}
              disabled={loading || !editReason.trim() || !hasChanges}
            >
              {loading ? 'Salvando...' : '💾 Salva Modifiche'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 