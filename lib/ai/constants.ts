import { ChatCompletionCreateParams } from 'openai/resources/chat';

// System Prompts
export const SYSTEM_PROMPTS = {
  assistant: `Sei l'assistente virtuale di {organizationName}, un centro estetico.
Il tuo compito è aiutare i clienti a:
- Prenotare appuntamenti
- Controllare disponibilità
- Cancellare o modificare prenotazioni
- Fornire informazioni sui servizi
- Rispondere a domande generali

Regole:
1. Sii sempre cortese e professionale
2. Usa un tono amichevole ma rispettoso
3. Conferma sempre i dettagli prima di procedere con prenotazioni
4. Se non sei sicuro, chiedi chiarimenti
5. Non fornire consigli medici
6. Gestisci una conversazione alla volta in modo chiaro

Informazioni del centro:
- Nome: {organizationName}
- Indirizzo: {address}
- Orari: {workingHours}
- Servizi disponibili: {services}`,

  booking_context: `Stai gestendo una prenotazione. Raccogli le seguenti informazioni:
1. Servizio desiderato
2. Data preferita
3. Orario preferito
4. Conferma dei dati del cliente`,
};

// Function Definitions for OpenAI
export const AI_FUNCTIONS: ChatCompletionCreateParams.Function[] = [
  {
    name: 'check_availability',
    description: 'Controlla la disponibilità per un servizio in una data specifica',
    parameters: {
      type: 'object',
      properties: {
        service_id: {
          type: 'string',
          description: 'ID del servizio richiesto',
        },
        date: {
          type: 'string',
          description: 'Data richiesta in formato YYYY-MM-DD',
        },
        preferred_time: {
          type: 'string',
          description: 'Orario preferito in formato HH:MM (opzionale)',
        },
      },
      required: ['service_id', 'date'],
    },
  },
  {
    name: 'book_appointment',
    description: 'Crea una nuova prenotazione',
    parameters: {
      type: 'object',
      properties: {
        client_phone: {
          type: 'string',
          description: 'Numero di telefono del cliente',
        },
        service_id: {
          type: 'string',
          description: 'ID del servizio',
        },
        datetime: {
          type: 'string',
          description: 'Data e ora in formato ISO 8601',
        },
        notes: {
          type: 'string',
          description: 'Note aggiuntive (opzionale)',
        },
      },
      required: ['client_phone', 'service_id', 'datetime'],
    },
  },
  {
    name: 'cancel_appointment',
    description: 'Cancella una prenotazione esistente',
    parameters: {
      type: 'object',
      properties: {
        booking_id: {
          type: 'string',
          description: 'ID della prenotazione da cancellare',
        },
        reason: {
          type: 'string',
          description: 'Motivo della cancellazione',
        },
      },
      required: ['booking_id'],
    },
  },
  {
    name: 'get_client_bookings',
    description: 'Ottieni le prenotazioni di un cliente',
    parameters: {
      type: 'object',
      properties: {
        client_phone: {
          type: 'string',
          description: 'Numero di telefono del cliente',
        },
        status: {
          type: 'string',
          enum: ['upcoming', 'past', 'all'],
          description: 'Filtra per stato delle prenotazioni',
        },
      },
      required: ['client_phone'],
    },
  },
  {
    name: 'get_services',
    description: 'Ottieni la lista dei servizi disponibili',
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Categoria di servizi (opzionale)',
        },
      },
    },
  },
  {
    name: 'get_service_info',
    description: 'Ottieni informazioni dettagliate su un servizio',
    parameters: {
      type: 'object',
      properties: {
        service_name: {
          type: 'string',
          description: 'Nome o parte del nome del servizio',
        },
      },
      required: ['service_name'],
    },
  },
];

// Message Templates for WhatsApp
export const MESSAGE_TEMPLATES = {
  welcome: `Ciao! 👋 Sono l'assistente virtuale di {organizationName}.
Come posso aiutarti oggi?`,

  booking_confirmed: `✅ Prenotazione confermata!

📅 Data: {date}
⏰ Ora: {time}
💆 Servizio: {service}
💰 Prezzo: €{price}

Ti invieremo un promemoria 24 ore prima dell'appuntamento.
Per cancellare o modificare, scrivi qui in qualsiasi momento.`,

  availability_response: `📅 Ecco gli orari disponibili per {service} il {date}:

{availableSlots}

Quale preferisci?`,

  no_availability: `😔 Mi dispiace, non ci sono slot disponibili per {service} il {date}.

Vuoi provare con un'altra data? Ecco i prossimi giorni con disponibilità:
{alternativeDates}`,

  error_generic: `❌ Si è verificato un errore. Per favore riprova o contattaci al {phone}.`,
}; 