import { Database } from './database'

// Export dei tipi comuni
export type Organization = Database['public']['Tables']['organizations']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Staff = Database['public']['Tables']['staff']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type ChatSession = Database['public']['Tables']['chat_sessions']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']

// Enums
export type BookingStatus = Database['public']['Enums']['booking_status']
export type PaymentStatus = Database['public']['Enums']['payment_status']
export type UserRole = Database['public']['Enums']['user_role']
export type PlanType = Database['public']['Enums']['plan_type']

// Tipi per insert/update
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type StaffInsert = Database['public']['Tables']['staff']['Insert']
export type StaffUpdate = Database['public']['Tables']['staff']['Update']
export type ServiceInsert = Database['public']['Tables']['services']['Insert']
export type ServiceUpdate = Database['public']['Tables']['services']['Update']
export type ClientInsert = Database['public']['Tables']['clients']['Insert']
export type ClientUpdate = Database['public']['Tables']['clients']['Update']
export type BookingInsert = Database['public']['Tables']['bookings']['Insert']
export type BookingUpdate = Database['public']['Tables']['bookings']['Update']
export type PaymentInsert = Database['public']['Tables']['payments']['Insert']
export type PaymentUpdate = Database['public']['Tables']['payments']['Update']
export type ChatSessionInsert = Database['public']['Tables']['chat_sessions']['Insert']
export type ChatSessionUpdate = Database['public']['Tables']['chat_sessions']['Update']
export type ChatMessageInsert = Database['public']['Tables']['chat_messages']['Insert']
export type ChatMessageUpdate = Database['public']['Tables']['chat_messages']['Update']

// Tipi con relazioni
export type UserWithOrganization = User & {
  organization?: Organization | null
}

export type StaffWithOrganization = Staff & {
  organization?: Organization | null
}

export type BookingWithRelations = Booking & {
  client?: Client | null
  service?: Service | null
  staff?: Staff | null
  payments?: Payment[] | null
}

export type ServiceWithOrganization = Service & {
  organization?: Organization | null
}

export type ClientWithBookings = Client & {
  bookings?: Booking[] | null
  organization?: Organization | null
}

export type PaymentWithRelations = Payment & {
  booking?: Booking | null
  client?: Client | null
  organization?: Organization | null
}

export type ChatSessionWithMessages = ChatSession & {
  messages?: ChatMessage[] | null
  organization?: Organization | null
}

export type OrganizationWithRelations = Organization & {
  users?: User[] | null
  staff?: Staff[] | null
  services?: Service[] | null
  clients?: Client[] | null
  bookings?: Booking[] | null
}

// Tipi di utilità
export type TableNames = keyof Database['public']['Tables']
export type EnumNames = keyof Database['public']['Enums']

// Tipi per le query Supabase
export type Tables<T extends TableNames> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends TableNames> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends TableNames> = Database['public']['Tables'][T]['Update']
export type Enums<T extends EnumNames> = Database['public']['Enums'][T]

// Re-export del database per comodità
export type { Database }