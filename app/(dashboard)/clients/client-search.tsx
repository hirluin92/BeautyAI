'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, X } from 'lucide-react'

interface ClientsSearchProps {
  initialSearch: string
  initialTags: string[]
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

export default function ClientsSearch({ 
  initialSearch, 
  initialTags 
}: ClientsSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(initialSearch)
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags)
  const [showFilters, setShowFilters] = useState(false)

  // Update URL when search or tags change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (search) {
      params.set('search', search)
    } else {
      params.delete('search')
    }
    
    if (selectedTags.length > 0) {
      params.set('tags', selectedTags.join(','))
    } else {
      params.delete('tags')
    }
    
    // Reset to page 1 when searching
    params.delete('page')
    
    router.push(`/clients?${params.toString()}`)
  }, [search, selectedTags, router, searchParams])

  const handleSearch = (value: string) => {
    setSearch(value)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedTags([])
  }

  const hasActiveFilters = search || selectedTags.length > 0

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      {/* Search Bar */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cerca per nome, telefono o email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center px-4 py-2 border rounded-md transition-colors ${
            showFilters || selectedTags.length > 0
              ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtri
          {selectedTags.length > 0 && (
            <span className="ml-2 bg-indigo-600 text-white text-xs rounded-full px-2 py-0.5">
              {selectedTags.length}
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4 mr-1" />
            Pulisci
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border-t pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Filtra per tag:
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Filtri attivi:</span>
            {search && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded">
                Ricerca: "{search}"
                <button 
                  onClick={() => setSearch('')}
                  className="ml-1 hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedTags.map(tag => (
              <span key={tag} className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 rounded">
                {tag}
                <button 
                  onClick={() => toggleTag(tag)}
                  className="ml-1 hover:text-indigo-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}