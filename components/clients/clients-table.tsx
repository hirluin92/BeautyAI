'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Phone, Mail, Calendar, Euro, MoreHorizontal, Edit, Trash2, MessageSquare } from 'lucide-react'
import { Client } from '@/types'
import DeleteConfirmationModal from '@/components/ui/delete-confirmation-modal'

interface ClientsTableProps {
  clients: Client[]
  currentPage: number
  totalPages: number
  totalCount: number
}

export default function ClientsTable({ 
  clients, 
  currentPage, 
  totalPages, 
  totalCount 
}: ClientsTableProps) {
  const router = useRouter()
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [showDropdown, setShowDropdown] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    clientId: string
    clientName: string
  }>({
    isOpen: false,
    clientId: '',
    clientName: ''
  })
  const [isDeleting, setIsDeleting] = useState(false)

  const formatPhone = (phone: string) => {
    if (phone.startsWith('+39')) {
      return phone.replace('+39', '+39 ').replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')
    }
    return phone
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClients(clients.map(c => c.id))
    } else {
      setSelectedClients([])
    }
  }

  const handleSelectClient = (clientId: string, checked: boolean) => {
    if (checked) {
      setSelectedClients(prev => [...prev, clientId])
    } else {
      setSelectedClients(prev => prev.filter(id => id !== clientId))
    }
  }

  const handleDeleteClick = (clientId: string, clientName: string) => {
    setDeleteModal({
      isOpen: true,
      clientId,
      clientName
    })
    setShowDropdown(null)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/clients/${deleteModal.clientId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante l\'eliminazione')
      }

      router.refresh()
      setDeleteModal({ isOpen: false, clientId: '', clientName: '' })
      
    } catch (error: any) {
      alert(`Errore: ${error.message}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteModal({ isOpen: false, clientId: '', clientName: '' })
    }
  }

  const getPaginationRange = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  return (
    <>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Lista Clienti ({totalCount})
            </h2>
            {selectedClients.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedClients.length} selezionati
                </span>
                <button className="text-sm text-indigo-600 hover:text-indigo-700">
                  Azioni bulk
                </button>
              </div>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Pagina {currentPage} di {totalPages}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedClients.length === clients.length && clients.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contatti
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statistiche
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tags
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ultimo accesso
              </th>
              <th className="w-20 px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedClients.includes(client.id)}
                    onChange={(e) => handleSelectClient(client.id, e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-medium text-sm">
                          {client.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Link 
                        href={`/clients/${client.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                      >
                        {client.full_name}
                      </Link>
                      {client.birth_date && (
                        <div className="text-sm text-gray-500">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {formatDate(client.birth_date)}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-900">
                      <Phone className="w-3 h-3 mr-2 text-gray-400" />
                      <a href={`tel:${client.phone}`} className="hover:text-indigo-600">
                        {formatPhone(client.phone)}
                      </a>
                    </div>
                    {client.email && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="w-3 h-3 mr-2 text-gray-400" />
                        <a href={`mailto:${client.email}`} className="hover:text-indigo-600">
                          {client.email}
                        </a>
                      </div>
                    )}
                    {client.whatsapp_phone && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MessageSquare className="w-3 h-3 mr-2 text-gray-400" />
                        <span>WhatsApp</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-900">
                      <span className="font-medium">{client.visit_count || 0}</span>
                      <span className="text-gray-500 ml-1">visite</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Euro className="w-3 h-3 mr-1" />
                      {client.total_spent ? `€${Number(client.total_spent).toFixed(2)}` : '€0.00'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {client.tags && client.tags.length > 0 ? (
                      client.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">Nessun tag</span>
                    )}
                    {client.tags && client.tags.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{client.tags.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {client.last_visit_at 
                    ? formatDate(client.last_visit_at)
                    : 'Mai'
                  }
                </td>
                <td className="px-6 py-4 relative">
                  <button
                    onClick={() => setShowDropdown(showDropdown === client.id ? null : client.id)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  
                  {showDropdown === client.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                      <div className="py-1">
                        <Link
                          href={`/clients/${client.id}`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Modifica
                        </Link>
                        <Link
                          href={`/clients/${client.id}/bookings`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Storico appuntamenti
                        </Link>
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteClick(client.id, client.full_name)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Elimina
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Mostra{' '}
                <span className="font-medium">{((currentPage - 1) * 20) + 1}</span>
                {' '}-{' '}
                <span className="font-medium">
                  {Math.min(currentPage * 20, totalCount)}
                </span>
                {' '}di{' '}
                <span className="font-medium">{totalCount}</span>
                {' '}risultati
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <Link
                href={`/clients?page=${currentPage - 1}`}
                className={`p-2 rounded-md ${
                  currentPage === 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              
              {getPaginationRange().map((page, index) => (
                page === '...' ? (
                  <span key={index} className="px-3 py-1 text-gray-500">...</span>
                ) : (
                  <Link
                    key={index}
                    href={`/clients?page=${page}`}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </Link>
                )
              ))}
              
              <Link
                href={`/clients?page=${currentPage + 1}`}
                className={`p-2 rounded-md ${
                  currentPage === totalPages 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
      
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Elimina Cliente"
        message={`Sei sicuro di voler eliminare ${deleteModal.clientName}? Il cliente verrà rimosso dalla lista ma i dati storici saranno preservati per la contabilità.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={isDeleting}
      />
    </>
  )
}