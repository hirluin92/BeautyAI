// lib/constants/booking.ts

export type BookingStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export const STATUS_CONFIG = {
  scheduled: {
    variant: 'secondary' as const,
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    label: 'Programmato',
    icon: 'Clock'
  },
  confirmed: {
    variant: 'default' as const,
    className: 'bg-green-50 text-green-700 border-green-200',
    label: 'Confermato',
    icon: 'CheckCircle'
  },
  completed: {
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-700 border-gray-300',
    label: 'Completato',
    icon: 'CheckCircle'
  },
  cancelled: {
    variant: 'destructive' as const,
    className: 'bg-red-50 text-red-700 border-red-200',
    label: 'Annullato',
    icon: 'XCircle'
  },
  no_show: {
    variant: 'secondary' as const,
    className: 'bg-orange-50 text-orange-700 border-orange-200',
    label: 'No Show',
    icon: 'AlertCircle'
  }
} as const

export const NOTIFICATION_MESSAGES = {
  reminder: (clientName: string, date: string, time: string, service: string) => 
    `⏰ *Promemoria Appuntamento*\n\nCiao ${clientName}!\n\nTi ricordiamo l'appuntamento di domani:\n📅 ${date}\n⏰ ${time}\n💆 ${service}\n\nA domani! 😊`,
  
  confirmation: (clientName: string, date: string, time: string, service: string) => 
    `✅ *Prenotazione Confermata*\n\nCiao ${clientName}! 👋\n\nTi confermiamo la prenotazione:\n📅 ${date}\n⏰ ${time}\n💆 ${service}\n\nTi aspettiamo!`,
  
  cancellation: (clientName: string, date: string, time: string) => 
    `❌ *Appuntamento Annullato*\n\nCiao ${clientName},\n\nIl tuo appuntamento del ${date} alle ${time} è stato annullato.\n\n📞 Chiamaci per riprenotare!`
} as const