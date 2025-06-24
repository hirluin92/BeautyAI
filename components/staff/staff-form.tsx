'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2, User, Mail, Phone } from 'lucide-react'
import { Staff, StaffInsert } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { z } from 'zod'

interface StaffFormProps {
  organizationId: string
  mode: 'create' | 'edit'
  staff?: Staff
  onStaffCreated?: (staffId: string) => void
}

// Validation schema
const staffFormSchema = z.object({
  full_name: z.string().min(2, 'Il nome è obbligatorio'),
  email: z.string().email('Email non valida').optional().or(z.literal('')),
  phone: z.string().optional(),
  role: z.string().optional(),
  specializations: z.array(z.string()).optional(),
  notes: z.string().optional(),
  is_active: z.boolean(),
})

type StaffFormData = z.infer<typeof staffFormSchema>

const COMMON_SPECIALIZATIONS = [
  'Capelli',
  'Colore',
  'Taglio',
  'Piega',
  'Trattamenti viso',
  'Manicure',
  'Pedicure',
  'Massaggi',
  'Estetica',
  'Barbiere',
  'Makeup',
  'Semipermanente'
]

export default function StaffForm({ 
  organizationId, 
  mode, 
  staff,
  onStaffCreated
}: StaffFormProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      full_name: staff?.full_name || '',
      email: staff?.email || '',
      phone: staff?.phone || '',
      role: staff?.role || '',
      specializations: staff?.specializations || [],
      notes: staff?.notes || '',
      is_active: staff?.is_active ?? true,
    }
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [newSpecialization, setNewSpecialization] = useState('')

  const watchedSpecializations = watch('specializations') || []
  const isActive = watch('is_active')

  const handleAddSpecialization = (specialization: string) => {
    if (specialization && !watchedSpecializations.includes(specialization)) {
      setValue('specializations', [...watchedSpecializations, specialization])
    }
    setNewSpecialization('')
  }

  const handleRemoveSpecialization = (specializationToRemove: string) => {
    setValue('specializations', watchedSpecializations.filter(s => s !== specializationToRemove))
  }

  const onSubmit = async (data: StaffFormData) => {
    setLoading(true)
    setError(null)

    try {
      if (mode === 'create') {
        // Create new staff member
        const staffData: StaffInsert = {
          organization_id: organizationId,
          full_name: data.full_name.trim(),
          email: data.email?.trim() || null,
          phone: data.phone?.trim() || null,
          role: data.role?.trim() || null,
          specializations: data.specializations && data.specializations.length > 0 ? data.specializations : null,
          notes: data.notes?.trim() || null,
          is_active: data.is_active
        }

        const { data: newStaff, error } = await supabase
          .from('staff')
          .insert(staffData)
          .select()
          .single()

        if (error) throw error

        setSuccess(true)
        if (onStaffCreated) {
          onStaffCreated(newStaff.id)
        } else {
          setTimeout(() => {
            router.push(`/staff/${newStaff.id}`)
          }, 1000)
        }
      } else {
        // Update existing staff member
        const updateData = {
          full_name: data.full_name.trim(),
          email: data.email?.trim() || null,
          phone: data.phone?.trim() || null,
          role: data.role?.trim() || null,
          specializations: data.specializations && data.specializations.length > 0 ? data.specializations : null,
          notes: data.notes?.trim() || null,
          is_active: data.is_active
        }

        const { data: updatedStaff, error } = await supabase
          .from('staff')
          .update(updateData)
          .eq('id', staff!.id)
          .eq('organization_id', organizationId)
          .select()
          .single()

        if (error) throw error

        setSuccess(true)
        setTimeout(() => {
          router.push(`/staff/${staff!.id}`)
        }, 1000)
      }

    } catch (error: any) {
      setError(error.message || 'Errore durante il salvataggio')
    } finally {
      setLoading(false)
    }
  }

  // Reset form when staff prop changes
  useEffect(() => {
    if (staff) {
      reset({
        full_name: staff.full_name || '',
        email: staff.email || '',
        phone: staff.phone || '',
        role: staff.role || '',
        specializations: staff.specializations || [],
        notes: staff.notes || '',
        is_active: staff.is_active ?? true
      })
    }
  }, [staff, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Staff {mode === 'create' ? 'creato' : 'aggiornato'} con successo!
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

        {/* Telefono */}
        <div>
          <Label htmlFor="phone">Telefono</Label>
          <Input
            {...register('phone')}
            type="tel"
            id="phone"
            placeholder="+39 123 456 7890"
          />
        </div>

        {/* Ruolo */}
        <div>
          <Label htmlFor="role">Ruolo</Label>
          <Input
            {...register('role')}
            type="text"
            id="role"
            placeholder="Es. Stylist, Estetista, Barbiere"
          />
        </div>

        {/* Note */}
        <div className="md:col-span-2">
          <Label htmlFor="notes">Note</Label>
          <Textarea
            {...register('notes')}
            id="notes"
            placeholder="Note aggiuntive sullo staff..."
          />
        </div>

        {/* Specializzazioni */}
        <div className="md:col-span-2">
          <Label>Specializzazioni</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {watchedSpecializations.map((specialization: string) => (
              <span
                key={specialization}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                {specialization}
                <button
                  type="button"
                  onClick={() => handleRemoveSpecialization(specialization)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newSpecialization}
              onChange={(e) => setNewSpecialization(e.target.value)}
              placeholder="Aggiungi specializzazione..."
              className="flex-1"
            />
            <Button
              type="button"
              onClick={() => handleAddSpecialization(newSpecialization)}
              disabled={!newSpecialization.trim()}
              variant="outline"
            >
              Aggiungi
            </Button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {COMMON_SPECIALIZATIONS.map((specialization: string) => (
              <button
                key={specialization}
                type="button"
                onClick={() => handleAddSpecialization(specialization)}
                disabled={watchedSpecializations.includes(specialization)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
              >
                {specialization}
              </button>
            ))}
          </div>
        </div>

        {/* Staff attivo */}
        <div className="md:col-span-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
            <Label htmlFor="is_active">Staff attivo</Label>
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
              {mode === 'create' ? 'Crea staff' : 'Aggiorna staff'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
} 