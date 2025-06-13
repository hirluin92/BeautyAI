'use client'

import { useRouter } from 'next/navigation'

interface DeleteBookingFormProps {
  bookingId: string
}

export default function DeleteBookingForm({ bookingId }: DeleteBookingFormProps) {
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!confirm('Confermi di voler eliminare questa prenotazione?')) {
      return
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}/delete`, {
        method: 'POST',
      })

      if (response.ok) {
        router.push('/calendar')
        router.refresh()
      } else {
        throw new Error('Errore durante l\'eliminazione della prenotazione')
      }
    } catch (error) {
      console.error('Error deleting booking:', error)
      alert('Si è verificato un errore durante l\'eliminazione della prenotazione')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <button 
        type="submit" 
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
      >
        Elimina
      </button>
    </form>
  )
} 