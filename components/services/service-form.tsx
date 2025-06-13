'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2 } from 'lucide-react'
import { Service, ServiceInsert } from '@/types'

interface ServiceFormProps {
  organizationId: string
  mode: 'create' | 'edit'
  service?: Service
}

const COMMON_CATEGORIES = [
  'Taglio',
  'Colore',
  'Piega',
  'Trattamenti',
  'Manicure',
  'Pedicure',
  'Extension',
  'Makeup',
  'Sopracciglia',
  'Ciglia',
  'Depilazione',
  'Massaggi',
  'Viso',
  'Corpo'
]

export default function ServiceForm({ 
  organizationId, 
  mode, 
  service 
}: ServiceFormProps) {
  const router = useRouter()
  const supabase = createClient()
  
  // Form state
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    category: service?.category || '',
    price: service?.price || 0,
    duration_minutes: service?.duration_minutes || 30,
    is_active: service?.is_active ?? true
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customCategory, setCustomCategory] = useState(false)

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
  }

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Il nome del servizio è obbligatorio'
    }
    if (formData.price < 0) {
      return 'Il prezzo non può essere negativo'
    }
    if (formData.duration_minutes < 5) {
      return 'La durata minima è di 5 minuti'
    }
    if (formData.duration_minutes > 480) {
      return 'La durata massima è di 8 ore (480 minuti)'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (mode === 'create') {
        // Create new service
        const serviceData: ServiceInsert = {
          ...formData,
          organization_id: organizationId
        }

        const { error: insertError } = await supabase
          .from('services')
          .insert(serviceData)

        if (insertError) throw insertError

      } else {
        // Update existing service
        const { error: updateError } = await supabase
          .from('services')
          .update({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            price: formData.price,
            duration_minutes: formData.duration_minutes,
            is_active: formData.is_active
          })
          .eq('id', service!.id)

        if (updateError) throw updateError
      }

      // Redirect to services list
      router.push('/services')
      router.refresh()

    } catch (err) {
      console.error('Error saving service:', err)
      setError('Errore nel salvataggio del servizio. Riprova.')
    } finally {
      setLoading(false)
    }
  }

      const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}min`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      return `${mins}min`
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome Servizio *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="es. Taglio donna, Colore completo..."
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descrizione
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Descrivi il servizio in dettaglio..."
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          {!customCategory ? (
            <div>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setCustomCategory(true)
                    handleInputChange('category', '')
                  } else {
                    handleInputChange('category', e.target.value)
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Seleziona categoria</option>
                {COMMON_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="__custom__">+ Aggiungi categoria personalizzata</option>
              </select>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Nome categoria personalizzata"
              />
              <button
                type="button"
                onClick={() => {
                  setCustomCategory(false)
                  handleInputChange('category', '')
                }}
                className="px-3 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annulla
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Prezzo (€) *
            </label>
            <input
              type="number"
              id="price"
              value={formData.price}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Durata *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="duration"
                value={formData.duration_minutes}
                onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value) || 30)}
                min="5"
                max="480"
                step="5"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              <span className="text-sm text-gray-600 min-w-[80px]">
                {formatDuration(formData.duration_minutes)}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Minimo 5 minuti, massimo 8 ore
            </p>
          </div>
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => handleInputChange('is_active', e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
            Servizio attivo (visibile nelle prenotazioni)
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          disabled={loading}
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvataggio...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {mode === 'create' ? 'Crea Servizio' : 'Salva Modifiche'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}