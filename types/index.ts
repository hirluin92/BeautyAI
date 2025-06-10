import { Database } from './database'

// Export dei tipi comuni
export type Organization = Database['public']['Tables']['organizations']['Row']
export type User = Database['public']['Tables']['users']['Row']
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
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type ServiceInsert = Database['public']['Tables']['services']['Insert']
export type ClientInsert = Database['public']['Tables']['clients']['Insert']
export type BookingInsert = Database['public']['Tables']['bookings']['Insert']

// Tipi con relazioni
export type UserWithOrganization = User & {
  organization?: Organization | null
}

export type BookingWithRelations = Booking & {
  client?: Client | null
  service?: Service | null
  staff?: User | null
}

export type ServiceWithOrganization = Service & {
  organization?: Organization | null
}