// Tipi per il sistema AI Chat

export interface ConversationContext {
  state: 'idle' | 'collecting_service' | 'collecting_date' | 'collecting_time' | 'confirming_booking';
  bookingData: Partial<{
    serviceId: string;
    date: string;
    time: string;
    clientPhone: string;
  }>;
  messageHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
}

export interface WhatsAppMessage {
  from: string;
  text?: string;
  type: 'text' | 'interactive' | 'button' | 'location' | 'image';
  timestamp: number;
}

export interface AIResponse {
  text: string;
  quickReplies?: string[];
  buttons?: Array<{
    id: string;
    title: string;
  }>;
  mediaUrl?: string;
}

export interface FunctionCall {
  name: string;
  arguments: string;
}

export interface FunctionResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

// Tipi per le funzioni AI
export interface CheckAvailabilityParams {
  service_id: string;
  date: string;
  preferred_time?: string;
}

export interface BookAppointmentParams {
  client_phone: string;
  service_id: string;
  datetime: string;
  notes?: string;
}

export interface CancelAppointmentParams {
  booking_id: string;
  reason?: string;
}

export interface GetClientBookingsParams {
  client_phone: string;
  status?: 'upcoming' | 'past' | 'all';
}

export interface GetServicesParams {
  category?: string;
}

export interface GetServiceInfoParams {
  service_name: string;
} 