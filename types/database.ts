export type Database = {
    public: {
      Tables: {
        organizations: {
          Row: {
            id: string
            name: string
            slug: string
            owner_id: string
            plan_type: Database['public']['Enums']['plan_type']
            is_active: boolean
            created_at: string
            updated_at: string
            settings: {
              currency?: string
              timezone?: string
              language?: string
              booking_rules?: any
              notifications?: any
            } | null
          }
          Insert: {
            id?: string
            name: string
            slug: string
            owner_id: string
            plan_type?: Database['public']['Enums']['plan_type']
            is_active?: boolean
            created_at?: string
            updated_at?: string
            settings?: {
              currency?: string
              timezone?: string
              language?: string
              booking_rules?: any
              notifications?: any
            } | null
          }
          Update: {
            id?: string
            name?: string
            slug?: string
            owner_id?: string
            plan_type?: Database['public']['Enums']['plan_type']
            is_active?: boolean
            created_at?: string
            updated_at?: string
            settings?: {
              currency?: string
              timezone?: string
              language?: string
              booking_rules?: any
              notifications?: any
            } | null
          }
        }
        users: {
          Row: {
            id: string
            organization_id: string
            full_name: string
            role: Database['public']['Enums']['user_role']
            is_active: boolean
            created_at: string
            updated_at: string
            avatar_url: string | null
            phone: string | null
          }
          Insert: {
            id?: string
            organization_id: string
            full_name: string
            role?: Database['public']['Enums']['user_role']
            is_active?: boolean
            created_at?: string
            updated_at?: string
            avatar_url?: string | null
            phone?: string | null
          }
          Update: {
            id?: string
            organization_id?: string
            full_name?: string
            role?: Database['public']['Enums']['user_role']
            is_active?: boolean
            created_at?: string
            updated_at?: string
            avatar_url?: string | null
            phone?: string | null
          }
        }
        staff: {
          Row: {
            id: string
            organization_id: string
            user_id: string | null
            full_name: string
            email: string | null
            phone: string | null
            role: string | null
            specializations: string[] | null
            notes: string | null
            is_active: boolean
            working_hours: any | null
            avatar_url: string | null
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            organization_id: string
            user_id?: string | null
            full_name: string
            email?: string | null
            phone?: string | null
            role?: string | null
            specializations?: string[] | null
            notes?: string | null
            is_active?: boolean
            working_hours?: any | null
            avatar_url?: string | null
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            organization_id?: string
            user_id?: string | null
            full_name?: string
            email?: string | null
            phone?: string | null
            role?: string | null
            specializations?: string[] | null
            notes?: string | null
            is_active?: boolean
            working_hours?: any | null
            avatar_url?: string | null
            created_at?: string
            updated_at?: string
          }
        }
        services: {
          Row: {
            id: string
            organization_id: string
            name: string
            description: string | null
            price: number
            duration_minutes: number
            category: string | null
            is_active: boolean
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            organization_id: string
            name: string
            description?: string | null
            price: number
            duration_minutes: number
            category?: string | null
            is_active?: boolean
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            organization_id?: string
            name?: string
            description?: string | null
            price?: number
            duration_minutes?: number
            category?: string | null
            is_active?: boolean
            created_at?: string
            updated_at?: string
          }
        }
        clients: {
          Row: {
            id: string
            organization_id: string
            full_name: string
            email: string | null
            phone: string
            whatsapp_phone: string | null
            birth_date: string | null
            notes: string | null
            tags: string[] | null
            is_active: boolean
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            organization_id: string
            full_name: string
            email?: string | null
            phone: string
            whatsapp_phone?: string | null
            birth_date?: string | null
            notes?: string | null
            tags?: string[] | null
            is_active?: boolean
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            organization_id?: string
            full_name?: string
            email?: string | null
            phone?: string
            whatsapp_phone?: string | null
            birth_date?: string | null
            notes?: string | null
            tags?: string[] | null
            is_active?: boolean
            created_at?: string
            updated_at?: string
          }
        }
        bookings: {
          Row: {
            id: string
            organization_id: string
            client_id: string
            service_id: string
            staff_id: string | null
            start_at: string
            end_at: string
            status: Database['public']['Enums']['booking_status']
            price: number
            notes: string | null
            source: string
            created_at: string
            updated_at: string
            date: string
            time: string
          }
          Insert: {
            id?: string
            organization_id: string
            client_id: string
            service_id: string
            staff_id?: string | null
            start_at: string
            end_at: string
            status?: Database['public']['Enums']['booking_status']
            price: number
            notes?: string | null
            source?: string
            created_at?: string
            updated_at?: string
            date?: string
            time?: string
          }
          Update: {
            id?: string
            organization_id?: string
            client_id?: string
            service_id?: string
            staff_id?: string | null
            start_at?: string
            end_at?: string
            status?: Database['public']['Enums']['booking_status']
            price?: number
            notes?: string | null
            source?: string
            created_at?: string
            updated_at?: string
            date?: string
            time?: string
          }
        }
        payments: {
          Row: {
            id: string
            organization_id: string
            booking_id: string
            client_id: string
            amount: number
            payment_method: string
            status: Database['public']['Enums']['payment_status']
            paid_at: string | null
            notes: string | null
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            organization_id: string
            booking_id: string
            client_id: string
            amount: number
            payment_method: string
            status?: Database['public']['Enums']['payment_status']
            paid_at?: string | null
            notes?: string | null
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            organization_id?: string
            booking_id?: string
            client_id?: string
            amount?: number
            payment_method?: string
            status?: Database['public']['Enums']['payment_status']
            paid_at?: string | null
            notes?: string | null
            created_at?: string
            updated_at?: string
          }
        }
        chat_sessions: {
          Row: {
            id: string
            organization_id: string
            client_phone: string
            client_name: string | null
            is_active: boolean
            last_message_at: string
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            organization_id: string
            client_phone: string
            client_name?: string | null
            is_active?: boolean
            last_message_at?: string
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            organization_id?: string
            client_phone?: string
            client_name?: string | null
            is_active?: boolean
            last_message_at?: string
            created_at?: string
            updated_at?: string
          }
        }
        chat_messages: {
          Row: {
            id: string
            session_id: string
            message: string
            is_from_client: boolean
            metadata: any | null
            created_at: string
          }
          Insert: {
            id?: string
            session_id: string
            message: string
            is_from_client: boolean
            metadata?: any | null
            created_at?: string
          }
          Update: {
            id?: string
            session_id?: string
            message?: string
            is_from_client?: boolean
            metadata?: any | null
            created_at?: string
          }
        }
      }
      Views: {
        [_ in never]: never
      }
      Functions: {
        check_booking_conflict: {
          Args: {
            p_organization_id: string
            p_staff_id?: string
            p_start_at: string
            p_end_at: string
            p_exclude_booking_id?: string
          }
          Returns: boolean
        }
      }
      Enums: {
        booking_status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no_show'
        payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
        user_role: 'owner' | 'admin' | 'staff'
        plan_type: 'free' | 'basic' | 'premium'
      }
    }
  }