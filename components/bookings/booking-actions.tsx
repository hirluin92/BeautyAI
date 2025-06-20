'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, X, Clock, AlertCircle } from 'lucide-react'
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
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface BookingActionsProps {
  bookingId: string
  currentStatus: string
  onStatusChange?: (newStatus: string) => void
}

export function BookingActions({ bookingId, currentStatus, onStatusChange }: BookingActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState<string | null>(null)
  const supabase = createClient()

  const handleAction = async (action: string) => {
    setLoading(action)
    setShowDialog(null)

    try {
      let result
      
      switch (action) {
        case 'confirm':
          result = await supabase.rpc('confirm_booking', { booking_id: bookingId })
          break
        case 'complete':
          result = await supabase.rpc('complete_booking', { booking_id: bookingId })
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
        case 'complete':
          toast.success('Prenotazione completata', {
            description: 'Il servizio è stato completato con successo'
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
      const newStatus = action === 'no_show' ? 'no_show' : action === 'complete' ? 'completed' : action === 'confirm' ? 'confirmed' : 'cancelled';
      if (onStatusChange) {
        onStatusChange(newStatus);
      } else if (typeof window !== 'undefined') {
        window.location.reload();
      }

    } catch (error: any) {
      console.error(`Error performing ${action}:`, error)
      toast.error(`Errore durante l'operazione`, {
        description: error.message || 'Si è verificato un errore'
      })
    } finally {
      setLoading(null)
    }
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
          onClick={() => setShowDialog('complete')}
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

      {/* Confirmation Dialogs */}
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

      <AlertDialog open={showDialog === 'complete'} onOpenChange={(open: boolean) => !open && setShowDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Completa Servizio</AlertDialogTitle>
            <AlertDialogDescription>
              Confermi che il servizio è stato completato?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleAction('complete')}>
              Completa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDialog === 'no_show'} onOpenChange={(open: boolean) => !open && setShowDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Segnala No Show</AlertDialogTitle>
            <AlertDialogDescription>
              Il cliente non si è presentato all'appuntamento? Questo verrà registrato nel suo storico.
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

export default BookingActions;