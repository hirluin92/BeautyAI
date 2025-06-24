'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, Save, Loader2 } from 'lucide-react'
import { Client, ClientInsert } from '@/types'
import { clientSchema, ClientInput } from '@/lib/validation/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { z } from 'zod'

interface ClientFormProps {
  organizationId: string
  mode: 'create' | 'edit'
  client?: Client
  onClientCreated?: (clientId: string) => void
}

const COMMON_TAGS = [
  'VIP',
  'Nuovo',
  'Fedele',
  'Matrimonio',
  'Evento',
  'Primo appuntamento',
  'Raccomandato',
  'Social media'
]

// Validation schema
const clientFormSchema = z.object({
  full_name: z.string().min(2, 'Il nome è obbligatorio'),
  phone: z.string().min(8, 'Il telefono è obbligatorio'),
  email: z.string().email('Email non valida').optional().or(z.literal('')),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  whatsapp_phone: z.string().optional(),
  birth_date: z.string().optional(),
  is_active: z.boolean(),
})

type ClientFormData = z.infer<typeof clientFormSchema>

export default function ClientForm({ 
  organizationId, 
  mode, 
  client,
  onClientCreated
}: ClientFormProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      full_name: client?.full_name || '',
      phone: client?.phone || '',
      email: client?.email || '',
      whatsapp_phone: client?.whatsapp_phone || '',
      birth_date: client?.birth_date || '',
      notes: client?.notes || '',
      tags: client?.tags || [],
      is_active: client?.is_active ?? true,
    }
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [newTag, setNewTag] = useState('')

  const watchedTags = watch('tags') || []
  const isActive = watch('is_active')

  const handleAddTag = (tag: string) => {
    if (tag && !watchedTags.includes(tag)) {
      setValue('tags', [...watchedTags, tag])
    }
    setNewTag('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter((tag: string) => tag !== tagToRemove))
  }

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true)
    setError(null)

    try {
      if (mode === 'create') {
        // Create new client
        const clientData: ClientInsert = {
          organization_id: organizationId,
          full_name: data.full_name.trim(),
          phone: data.phone.trim(),
          email: data.email?.trim() || null,
          whatsapp_phone: data.whatsapp_phone?.trim() || null,
          birth_date: data.birth_date || null,
          notes: data.notes?.trim() || null,
          tags: data.tags && data.tags.length > 0 ? data.tags : null
        }

        const { data: newClient, error } = await supabase
          .from('clients')
          .insert(clientData)
          .select()
          .single()

        if (error) throw error

        setSuccess(true)
        if (onClientCreated) {
          onClientCreated(newClient.id)
        } else {
          setTimeout(() => {
            router.push(`/clients/${newClient.id}`)
          }, 1000)
        }
      } else {
        // Update existing client
        const updateData = {
          full_name: data.full_name.trim(),
          phone: data.phone.trim(),
          email: data.email?.trim() || null,
          whatsapp_phone: data.whatsapp_phone?.trim() || null,
          birth_date: data.birth_date || null,
          notes: data.notes?.trim() || null,
          tags: data.tags && data.tags.length > 0 ? data.tags : null,
          is_active: data.is_active
        }

        const { error } = await supabase
          .from('clients')
          .update(updateData)
          .eq('id', client!.id)
          .eq('organization_id', organizationId)

        if (error) throw error

        setSuccess(true)
        setTimeout(() => {
          router.push(`/clients/${client!.id}`)
        }, 1000)
      }

    } catch (error: any) {
      setError(error.message || 'Errore durante il salvataggio')
    } finally {
      setLoading(false)
    }
  }

  // Reset form when client prop changes
  useEffect(() => {
    if (client) {
      reset({
        full_name: client.full_name || '',
        phone: client.phone || '',
        email: client.email || '',
        whatsapp_phone: client.whatsapp_phone || '',
        birth_date: client.birth_date || '',
        notes: client.notes || '',
        tags: client.tags || [],
        is_active: client.is_active ?? true
      })
    }
  }, [client, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Cliente {mode === 'create' ? 'creato' : 'aggiornato'} con successo!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome completo */}
        <div>
          <Label htmlFor="full_name">Nome completo *</Label>
          <Input
            {...register('full_name')}
            type="text"
            id="full_name"
            placeholder="Nome e cognome"
            className={errors.full_name ? 'border-red-500' : ''}
          />
          {errors.full_name && (
            <p className="text-sm text-red-500 mt-1">{errors.full_name.message}</p>
          )}
        </div>

        {/* Telefono */}
        <div>
          <Label htmlFor="phone">Telefono *</Label>
          <Input
            {...register('phone')}
            type="tel"
            id="phone"
            placeholder="+39 123 456 7890"
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            {...register('email')}
            type="email"
            id="email"
            placeholder="email@esempio.com"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* WhatsApp */}
        <div>
          <Label htmlFor="whatsapp_phone">WhatsApp</Label>
          <Input
            {...register('whatsapp_phone')}
            type="tel"
            id="whatsapp_phone"
            placeholder="+39 123 456 7890"
          />
        </div>

        {/* Data di nascita */}
        <div>
          <Label htmlFor="birth_date">Data di nascita</Label>
          <Input
            {...register('birth_date')}
            type="date"
            id="birth_date"
          />
        </div>

        {/* Note */}
        <div className="md:col-span-2">
          <Label htmlFor="notes">Note</Label>
          <Textarea
            {...register('notes')}
            id="notes"
            placeholder="Note aggiuntive sul cliente..."
            rows={3}
          />
        </div>

        {/* Tags */}
        <div className="md:col-span-2">
          <Label>Tag</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {watchedTags.map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Aggiungi tag..."
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTag(newTag)
                }
              }}
            />
            <Button
              type="button"
              onClick={() => handleAddTag(newTag)}
              disabled={!newTag.trim()}
              variant="outline"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {COMMON_TAGS.map((tag: string) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddTag(tag)}
                disabled={watchedTags.includes(tag)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Cliente attivo */}
        <div className="md:col-span-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
            <Label htmlFor="is_active">Cliente attivo</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Annulla
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {mode === 'create' ? 'Crea cliente' : 'Aggiorna cliente'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}