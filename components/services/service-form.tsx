'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2 } from 'lucide-react'
import { Service, ServiceInsert } from '@/types'
import { serviceSchema, ServiceInput } from '@/lib/validation/service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { z } from 'zod'

interface ServiceFormProps {
  organizationId: string
  mode: 'create' | 'edit'
  service?: Service
  onServiceCreated?: (serviceId: string) => void
}

// Validation schema - is_active is required without default
const serviceFormSchema = z.object({
  name: z.string().min(2, 'Il nome è obbligatorio'),
  description: z.string().optional(),
  category: z.string().optional(),
  duration_minutes: z.number().min(1, 'La durata deve essere almeno 1 minuto'),
  price: z.number().min(0, 'Il prezzo non può essere negativo'),
  is_active: z.boolean(),
})

type ServiceFormData = z.infer<typeof serviceFormSchema>

export default function ServiceForm({ 
  organizationId, 
  mode, 
  service,
  onServiceCreated
}: ServiceFormProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: service?.name || '',
      description: service?.description || '',
      category: service?.category || '',
      duration_minutes: service?.duration_minutes || 60,
      price: service?.price || 0,
      is_active: service?.is_active ?? true,
    }
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isActive = watch('is_active')

  const onSubmit = async (data: ServiceFormData) => {
    setLoading(true)
    setError(null)

    try {
      if (mode === 'create') {
        // Create new service
        const serviceData: ServiceInsert = {
          organization_id: organizationId,
          name: data.name.trim(),
          description: data.description?.trim() || null,
          category: data.category?.trim() || null,
          duration_minutes: data.duration_minutes,
          price: data.price,
          is_active: data.is_active
        }

        const { data: newService, error } = await supabase
          .from('services')
          .insert(serviceData)
          .select()
          .single()

        if (error) throw error

        setSuccess(true)
        if (onServiceCreated) {
          onServiceCreated(newService.id)
        } else {
          setTimeout(() => {
            router.push(`/services/${newService.id}`)
          }, 1000)
        }
      } else {
        // Update existing service
        const updateData = {
          name: data.name.trim(),
          description: data.description?.trim() || null,
          category: data.category?.trim() || null,
          duration_minutes: data.duration_minutes,
          price: data.price,
          is_active: data.is_active
        }

        const { error } = await supabase
          .from('services')
          .update(updateData)
          .eq('id', service!.id)
          .eq('organization_id', organizationId)

        if (error) throw error

        setSuccess(true)
        setTimeout(() => {
          router.push(`/services/${service!.id}`)
        }, 1000)
      }

    } catch (error: any) {
      setError(error.message || 'Errore durante il salvataggio')
    } finally {
      setLoading(false)
    }
  }

  // Reset form when service prop changes
  useEffect(() => {
    if (service) {
      reset({
        name: service.name || '',
        description: service.description || '',
        category: service.category || '',
        duration_minutes: service.duration_minutes || 60,
        price: service.price || 0,
        is_active: service.is_active ?? true
      })
    }
  }, [service, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Servizio {mode === 'create' ? 'creato' : 'aggiornato'} con successo!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome */}
        <div>
          <Label htmlFor="name">Nome servizio *</Label>
          <Input
            {...register('name')}
            type="text"
            id="name"
            placeholder="Es. Taglio e piega"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Prezzo */}
        <div>
          <Label htmlFor="price">Prezzo (€) *</Label>
          <Input
            {...register('price', { valueAsNumber: true })}
            type="number"
            id="price"
            step="0.01"
            min="0"
            placeholder="0.00"
            className={errors.price ? 'border-red-500' : ''}
          />
          {errors.price && (
            <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
          )}
        </div>

        {/* Durata */}
        <div>
          <Label htmlFor="duration_minutes">Durata (minuti) *</Label>
          <Input
            {...register('duration_minutes', { valueAsNumber: true })}
            type="number"
            id="duration_minutes"
            min="1"
            placeholder="60"
            className={errors.duration_minutes ? 'border-red-500' : ''}
          />
          {errors.duration_minutes && (
            <p className="text-sm text-red-500 mt-1">{errors.duration_minutes.message}</p>
          )}
        </div>

        {/* Categoria */}
        <div>
          <Label htmlFor="category">Categoria</Label>
          <Input
            {...register('category')}
            type="text"
            id="category"
            placeholder="Es. Capelli, Unghie, Viso"
          />
        </div>

        {/* Descrizione */}
        <div className="md:col-span-2">
          <Label htmlFor="description">Descrizione</Label>
          <Textarea
            {...register('description')}
            id="description"
            rows={3}
            placeholder="Descrizione dettagliata del servizio..."
          />
        </div>

        {/* Servizio attivo */}
        <div className="md:col-span-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
            <Label htmlFor="is_active">Servizio attivo</Label>
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
              {mode === 'create' ? 'Crea servizio' : 'Aggiorna servizio'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}