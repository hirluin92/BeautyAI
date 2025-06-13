'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Service } from '@/types'
import { Edit, Trash2, MoreVertical, Eye, Clock, Euro, ToggleLeft } from 'lucide-react'
import DeleteConfirmationModal from '@/components/ui/delete-confirmation-modal'

// Estendi il tipo Service per includere deleted_at
interface ExtendedService extends Omit<Service, 'deleted_at'> {
  deleted_at: string | null
}

interface ServicesTableProps {
  services: ExtendedService[]
}

export default function ServicesTable({ services }: ServicesTableProps) {
  const router = useRouter()
  const supabase = createClient()
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<ExtendedService | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleToggleActive = async (service: ExtendedService) => {
    const { error } = await supabase
      .from('services')
      .update({ is_active: !service.is_active })
      .eq('id', service.id)

    if (error) {
      console.error('Error toggling service status:', error)
      alert('Errore nel cambiare lo stato del servizio')
    } else {
      router.refresh()
    }
  }

  const handleDeleteClick = (service: ExtendedService) => {
    setServiceToDelete(service)
    setDeleteModalOpen(true)
    setOpenDropdownId(null)
  }

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return

    setIsDeleting(true)

    // Check if service has bookings
    const { data: bookings, error: checkError } = await supabase
      .from('bookings')
      .select('id')
      .eq('service_id', serviceToDelete.id)
      .limit(1)

    if (checkError) {
      console.error('Error checking bookings:', checkError)
      alert('Errore nel verificare le prenotazioni')
      setIsDeleting(false)
      return
    }

    if (bookings && bookings.length > 0) {
      alert('Non puoi eliminare un servizio con prenotazioni associate. Disattivalo invece.')
      setIsDeleting(false)
      setDeleteModalOpen(false)
      return
    }

    // Soft delete
    const { error } = await supabase
      .from('services')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', serviceToDelete.id)

    setIsDeleting(false)
    setDeleteModalOpen(false)

    if (error) {
      console.error('Error deleting service:', error)
      alert('Errore durante l\'eliminazione del servizio')
    } else {
      router.refresh()
    }
  }

  const getCategoryColor = (category: string | null) => {
    if (!category) return 'bg-gray-100 text-gray-800'
    
    const colors: Record<string, string> = {
      'Viso': 'bg-pink-100 text-pink-800',
      'Corpo': 'bg-purple-100 text-purple-800',
      'Massaggi': 'bg-blue-100 text-blue-800',
      'Epilazione': 'bg-orange-100 text-orange-800',
      'Manicure': 'bg-red-100 text-red-800',
      'Pedicure': 'bg-green-100 text-green-800',
      'Trucco': 'bg-indigo-100 text-indigo-800',
      'Capelli': 'bg-yellow-100 text-yellow-800'
    }
    
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Servizio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durata
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prezzo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stato
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {service.name}
                    </div>
                    {service.description && (
                      <div className="text-sm text-gray-500 line-clamp-1">
                        {service.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {service.category && (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(service.category)}`}>
                      {service.category}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Clock className="w-4 h-4 mr-1 text-gray-400" />
                    {service.duration_minutes} min
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm font-medium text-gray-900">
                    <Euro className="w-4 h-4 mr-1 text-gray-400" />
                    {service.price}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(service)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      service.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <ToggleLeft className="w-3 h-3 mr-1" />
                    {service.is_active ? 'Attivo' : 'Inattivo'}
                  </button>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <Link href={`/services/${service.id}`} title="Visualizza">
                    <Eye className="w-5 h-5 text-gray-600 hover:text-indigo-600 cursor-pointer" />
                  </Link>
                  <Link href={`/services/${service.id}/edit`} title="Modifica">
                    <Edit className="w-5 h-5 text-gray-600 hover:text-indigo-600 cursor-pointer" />
                  </Link>
                  <button
                    title="Elimina"
                    onClick={() => handleDeleteClick(service)}
                    className="focus:outline-none"
                  >
                    <Trash2 className="w-5 h-5 text-red-600 hover:text-red-800 cursor-pointer" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {services.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nessun servizio trovato</p>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Elimina Servizio"
        message={`Sei sicuro di voler eliminare il servizio "${serviceToDelete?.name}"? Questa azione non può essere annullata.`}
        isLoading={isDeleting}
      />
    </>
  )
}