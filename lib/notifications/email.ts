// lib/notifications/email.ts
import emailjs from '@emailjs/browser'

// Initialize EmailJS
emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!)

interface EmailParams {
  to_email: string
  to_name: string
  [key: string]: unknown
}

// Template configurations per tipo di notifica
const templateConfigs = {
  confirmation: {
    subject: 'Prenotazione Confermata ✓',
    header_color: '#4F46E5',
    header_title: 'Prenotazione Confermata ✓',
    greeting: 'Gentile',
    main_message: 'Siamo lieti di confermare la sua prenotazione. Di seguito i dettagli del suo appuntamento:',
    detail_title: '📅 Dettagli Appuntamento',
    detail_bg_color: '#f8f9fa',
    detail_text_color: '#333333',
    alert_bg_color: '#FEF3C7',
    alert_border_color: '#F59E0B',
    alert_text_color: '#92400E',
    alert_message: '<strong>📌 Si prega di:</strong><br>• Arrivare 5 minuti prima dell\'orario previsto<br>• In caso di impedimento, avvisare almeno 24 ore prima<br>• Portare con sé eventuali prodotti personali richiesti',
    cta_text: 'Per qualsiasi domanda o necessità di modificare l\'appuntamento, non esiti a contattarci.',
    closing_message: '',
    signature: 'A presto!',
    footer_message: 'Questa email è stata inviata automaticamente. Per favore non rispondere a questo messaggio.'
  },
  reminder: {
    subject: '🔔 Promemoria Appuntamento - Domani',
    header_color: '#10B981',
    header_title: '🔔 Promemoria Appuntamento',
    greeting: 'Ciao',
    main_message: 'Ti ricordiamo che hai un appuntamento programmato per domani. Ecco i dettagli:',
    detail_title: '📅 Il tuo appuntamento',
    detail_bg_color: '#10B981',
    detail_text_color: '#ffffff',
    alert_bg_color: '#F3F4F6',
    alert_border_color: '#D1D5DB',
    alert_text_color: '#374151',
    alert_message: '<strong>✅ Da ricordare:</strong><br>• Arriva 5 minuti prima per il check-in<br>• Porta con te eventuali prodotti personali necessari<br>• In caso di ritardo, chiamaci subito',
    cta_text: 'Hai bisogno di modificare o annullare l\'appuntamento? Contattaci subito.',
    closing_message: '',
    signature: 'Ti aspettiamo!',
    footer_message: 'Hai ricevuto questo promemoria perché hai una prenotazione attiva.'
  },
  cancellation: {
    subject: 'Appuntamento Annullato',
    header_color: '#DC2626',
    header_title: 'Appuntamento Annullato',
    greeting: 'Gentile',
    main_message: 'Ti confermiamo che il seguente appuntamento è stato <strong>annullato</strong>:',
    detail_title: '❌ Appuntamento Annullato',
    detail_bg_color: '#FEE2E2',
    detail_text_color: '#991B1B',
    alert_bg_color: '#E0E7FF',
    alert_border_color: '#4F46E5',
    alert_text_color: '#312E81',
    alert_message: '<strong>💡 Vuoi prenotare un nuovo appuntamento?</strong><br>Saremo felici di trovare un nuovo orario che si adatti alle tue esigenze.',
    cta_text: 'Chiamaci per prenotare un nuovo appuntamento.',
    closing_message: 'Ci dispiace per l\'inconveniente. Speriamo di rivederti presto!',
    signature: 'Cordiali saluti,',
    footer_message: 'Se non hai richiesto questa cancellazione, contattaci immediatamente.'
  }
}

export async function sendEmail(type: 'confirmation' | 'reminder' | 'cancellation', params: EmailParams) {
  try {
    const config = templateConfigs[type]
    
    const response = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_UNIVERSAL_TEMPLATE_ID!, // Un solo template ID
      {
        ...params,
        ...config,
        organization_name: process.env.NEXT_PUBLIC_ORGANIZATION_NAME || 'Beauty Salon'
      }
    )
    
    return { success: true, response }
  } catch (error: unknown) {
    console.error('Email send error:', error)
    return { success: false, error: typeof error === 'object' && error && 'text' in error ? (error as any).text : (error as Error).message }
  }
}

// Funzioni specifiche per ogni tipo di email
export async function sendBookingConfirmation(booking: {
  clientEmail: string
  clientName: string
  serviceName: string
  date: string
  time: string
  duration: number
}) {
  return sendEmail('confirmation', {
    to_email: booking.clientEmail,
    to_name: booking.clientName,
    service_name: booking.serviceName,
    appointment_date: booking.date,
    appointment_time: booking.time,
    duration: booking.duration
  })
}

export async function sendBookingReminder(booking: {
  clientEmail: string
  clientName: string
  serviceName: string
  date: string
  time: string
  duration: number
}) {
  return sendEmail('reminder', {
    to_email: booking.clientEmail,
    to_name: booking.clientName,
    service_name: booking.serviceName,
    appointment_date: booking.date,
    appointment_time: booking.time,
    duration: booking.duration
  })
}

export async function sendBookingCancellation(booking: {
  clientEmail: string
  clientName: string
  serviceName: string
  date: string
  time: string
}) {
  return sendEmail('cancellation', {
    to_email: booking.clientEmail,
    to_name: booking.clientName,
    service_name: booking.serviceName,
    appointment_date: booking.date,
    appointment_time: booking.time,
    duration: 0 // Non necessario per cancellazione
  })
}