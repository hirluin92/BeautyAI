'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Users, 
  Building, 
  Star,
  Phone,
  Shield,
  X,
  Save
} from 'lucide-react'

// Type definitions
type ContactType = 'friend' | 'family' | 'employee' | 'partner' | 'vip'

interface WhitelistContact {
  id: string
  phone_number: string
  contact_name: string
  contact_type: ContactType
  notes: string
  is_active: boolean
  created_at: string
}

interface FormData {
  phone_number: string
  contact_name: string
  contact_type: ContactType
  notes: string
}

interface WhitelistClientProps {
  initialContacts: WhitelistContact[]
  organizationId: string
}

export default function WhitelistClient({ initialContacts, organizationId }: WhitelistClientProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingContact, setEditingContact] = useState<WhitelistContact | null>(null)
  const [contacts, setContacts] = useState<WhitelistContact[]>(initialContacts)
  
  const [formData, setFormData] = useState<FormData>({
    phone_number: '',
    contact_name: '',
    contact_type: 'friend',
    notes: ''
  })

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingContact) {
        // Update existing contact
        const { error } = await supabase
          .from('whatsapp_whitelist')
          .update({
            phone_number: formData.phone_number,
            contact_name: formData.contact_name,
            contact_type: formData.contact_type,
            notes: formData.notes
          })
          .eq('id', editingContact.id)

        if (error) throw error

        // Update local state
        setContacts(prev => prev.map(contact => 
          contact.id === editingContact.id 
            ? { ...contact, ...formData }
            : contact
        ))
      } else {
        // Create new contact
        const { data: newContact, error } = await supabase
          .from('whatsapp_whitelist')
          .insert({
            organization_id: organizationId,
            phone_number: formData.phone_number,
            contact_name: formData.contact_name,
            contact_type: formData.contact_type,
            notes: formData.notes
          })
          .select()
          .single()

        if (error) throw error

        // Add to local state
        setContacts(prev => [newContact, ...prev])
      }

      // Reset form
      setFormData({
        phone_number: '',
        contact_name: '',
        contact_type: 'friend',
        notes: ''
      })
      setShowForm(false)
      setEditingContact(null)
    } catch (error) {
      console.error('Error saving contact:', error)
    }
  }

  const handleEdit = (contact: WhitelistContact) => {
    setEditingContact(contact)
    setFormData({
      phone_number: contact.phone_number,
      contact_name: contact.contact_name,
      contact_type: contact.contact_type,
      notes: contact.notes
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo contatto?')) {
      try {
        const { error } = await supabase
          .from('whatsapp_whitelist')
          .delete()
          .eq('id', id)

        if (error) throw error

        // Remove from local state
        setContacts(prev => prev.filter(contact => contact.id !== id))
      } catch (error) {
        console.error('Error deleting contact:', error)
      }
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('whatsapp_whitelist')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error

      // Update local state
      setContacts(prev => prev.map(contact => 
        contact.id === id 
          ? { ...contact, is_active: !currentStatus }
          : contact
      ))
    } catch (error) {
      console.error('Error toggling contact status:', error)
    }
  }

  const getContactTypeIcon = (type: ContactType) => {
    switch (type) {
      case 'friend': return <User className="w-4 h-4" />
      case 'family': return <Users className="w-4 h-4" />
      case 'employee': return <Building className="w-4 h-4" />
      case 'partner': return <Shield className="w-4 h-4" />
      case 'vip': return <Star className="w-4 h-4" />
    }
  }

  const getContactTypeBadgeColor = (type: ContactType) => {
    switch (type) {
      case 'friend': return 'bg-blue-100 text-blue-800'
      case 'family': return 'bg-green-100 text-green-800'
      case 'employee': return 'bg-purple-100 text-purple-800'
      case 'partner': return 'bg-yellow-100 text-yellow-800'
      case 'vip': return 'bg-red-100 text-red-800'
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Whitelist WhatsApp</h1>
        <Button
          onClick={() => {
            setShowForm(true)
            setEditingContact(null)
            setFormData({
              phone_number: '',
              contact_name: '',
              contact_type: 'friend',
              notes: ''
            })
          }}
          className="flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Aggiungi Contatto
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{editingContact ? 'Modifica' : 'Nuovo'} Contatto</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false)
                  setEditingContact(null)
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numero di Telefono
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+393331234567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.phone_number}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Contatto
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mario Rossi"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.contact_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({ ...formData, contact_name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo di Contatto
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.contact_type}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                    setFormData({ 
                      ...formData, 
                      contact_type: e.target.value as ContactType
                    })
                  }
                >
                  <option value="friend">Amico</option>
                  <option value="family">Famiglia</option>
                  <option value="employee">Dipendente</option>
                  <option value="partner">Partner</option>
                  <option value="vip">VIP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <textarea
                  rows={3}
                  placeholder="Note aggiuntive..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex items-center">
                  <Save className="w-4 h-4 mr-2" />
                  {editingContact ? 'Salva Modifiche' : 'Aggiungi'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingContact(null)
                  }}
                >
                  Annulla
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {contacts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Nessun contatto nella whitelist</p>
            </CardContent>
          </Card>
        ) : (
          contacts.map((contact) => (
            <Card key={contact.id} className={!contact.is_active ? 'opacity-60' : ''}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {contact.contact_name}
                    </h3>
                    <p className="text-sm text-gray-600">{contact.phone_number}</p>
                    {contact.notes && (
                      <p className="text-sm text-gray-500 mt-1">{contact.notes}</p>
                    )}
                  </div>
                  <Badge className={`${getContactTypeBadgeColor(contact.contact_type)} flex items-center gap-1`}>
                    {getContactTypeIcon(contact.contact_type)}
                    <span className="capitalize">{contact.contact_type}</span>
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={contact.is_active ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggleActive(contact.id, contact.is_active)}
                  >
                    {contact.is_active ? 'Attivo' : 'Disattivo'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(contact)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(contact.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 