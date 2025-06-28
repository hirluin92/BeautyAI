export interface PaymentData {
  paymentMethod: 'cash' | 'card' | 'transfer' | 'mixed'
  fiscalDocument: 'receipt' | 'invoice' | 'none'
  actualAmount: number
  vatApplicable: boolean
  vatAmount: number
  notes?: string
}

export interface AuditLogEntry {
  id: string
  booking_id: string
  organization_id: string
  user_id: string
  action: string
  original_data: any
  new_data: any
  edit_reason: string
  created_at: string
} 