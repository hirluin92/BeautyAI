'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, User, Phone, Mail, AlertCircle } from 'lucide-react'

interface ClientQuickAddModalProps {
  organizationId: string
  onClose: () => void
  onClientCreated: (clientId: string) => void
}

export default function ClientQuickAddModal({ organizationId, onClose, onClientCreated }: ClientQuickAddModalProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: ''
  })

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!formData.full_name.trim()) {
      errors.full_name = 'Nome completo è obbligatorio'
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Telefono è obbligatorio'
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email non valida'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    // Validation manuale invece di usare required sui campi
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          organization_id: organizationId,
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || null
        })
        .select()
        .single()

      if (error) throw error

      onClientCreated(data.id)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Errore durante la creazione del cliente'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    // Pulisci l'errore di validazione quando l'utente inizia a digitare
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Nuovo Cliente Rapido</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4 inline mr-1" />
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  validationErrors.full_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Inserisci nome e cognome"
              />
              {validationErrors.full_name && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.full_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline mr-1" />
                Telefono *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  validationErrors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Inserisci numero di telefono"
              />
              {validationErrors.phone && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  validationErrors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Inserisci email (opzionale)"
              />
              {validationErrors.email && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Annulla
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Creazione...' : 'Crea Cliente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}