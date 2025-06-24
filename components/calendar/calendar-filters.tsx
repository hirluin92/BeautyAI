import { useState } from 'react'
import { Filter, X, Calendar, User, Package, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface CalendarFiltersProps {
  services: { id: string; name: string }[]
  staff: { id: string; full_name: string }[]
  filters: {
    selectedService: string
    selectedStaff: string
    selectedStatus: string
    selectedDateRange: {
      start: Date | null
      end: Date | null
    }
  }
  onFilterChange: (key: string, value: unknown) => void
  onResetFilters: () => void
  activeFiltersCount: number
  currentUser?: { id: string; full_name: string }
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tutti gli stati' },
  { value: 'confirmed', label: 'Confermato' },
  { value: 'pending', label: 'In attesa' },
  { value: 'cancelled', label: 'Cancellato' },
  { value: 'completed', label: 'Completato' },
  { value: 'no_show', label: 'No show' }
]

export default function CalendarFilters({
  services,
  staff,
  filters,
  onFilterChange,
  onResetFilters,
  activeFiltersCount,
  currentUser
}: CalendarFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Ordina lo staff: utente corrente in cima, poi gli altri (escludendo duplicati per id o nome)
  const orderedStaff = currentUser
    ? [
        { id: currentUser.id, full_name: currentUser.full_name },
        ...staff.filter(
          member =>
            member.id &&
            member.id !== currentUser.id &&
            member.full_name !== currentUser.full_name
        )
      ]
    : staff.filter(member => !!member.id);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      {/* Header filtri */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filtri</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount} attivo{activeFiltersCount !== 1 ? 'i' : ''}
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="text-gray-600 hover:text-gray-900"
            >
              <X className="w-4 h-4 mr-1" />
              Reset
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Nascondi' : 'Mostra'} filtri
          </Button>
        </div>
      </div>

      {/* Filtri base sempre visibili */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Filtro staff */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Staff
          </Label>
          <Select
            value={filters.selectedStaff || "all"}
            onValueChange={(value) => onFilterChange('selectedStaff', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tutto lo staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutto lo staff</SelectItem>
              {orderedStaff.filter(member => member.id && member.id.trim() !== '').map(member => (
                <SelectItem key={member.id} value={member.id}>
                  {member.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro servizio */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Servizio
          </Label>
          <Select
            value={filters.selectedService}
            onValueChange={(value) => onFilterChange('selectedService', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tutti i servizi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i servizi</SelectItem>
              {services.map(service => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro status */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Stato prenotazione
          </Label>
          <Select
            value={filters.selectedStatus || "all"}
            onValueChange={(value) => onFilterChange('selectedStatus', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tutti gli stati" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtri avanzati */}
      {isExpanded && (
        <div className="border-t pt-4 space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Filtri Avanzati</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro range date */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Range date
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={filters.selectedDateRange.start?.toISOString().split('T')[0] || ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null
                    onFilterChange('selectedDateRange', {
                      ...filters.selectedDateRange,
                      start: date
                    })
                  }}
                  placeholder="Data inizio"
                />
                <Input
                  type="date"
                  value={filters.selectedDateRange.end?.toISOString().split('T')[0] || ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null
                    onFilterChange('selectedDateRange', {
                      ...filters.selectedDateRange,
                      end: date
                    })
                  }}
                  placeholder="Data fine"
                />
              </div>
            </div>
          </div>

          {/* Filtri rapidi */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Filtri rapidi
            </Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date()
                  onFilterChange('selectedDateRange', {
                    start: today,
                    end: today
                  })
                }}
              >
                Oggi
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date()
                  const endOfWeek = new Date(today)
                  endOfWeek.setDate(today.getDate() + 7)
                  onFilterChange('selectedDateRange', {
                    start: today,
                    end: endOfWeek
                  })
                }}
              >
                Questa settimana
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onFilterChange('selectedStatus', 'confirmed')
                }}
              >
                Solo confermati
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onFilterChange('selectedStatus', 'pending')
                }}
              >
                Solo in attesa
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 