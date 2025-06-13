'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, X } from 'lucide-react'

interface ServicesSearchProps {
  categories: string[]
  defaultSearch?: string
  defaultCategory?: string
  defaultStatus?: 'active' | 'inactive' | 'all'
}

export default function ServicesSearch({ 
  categories, 
  defaultSearch = '', 
  defaultCategory = '',
  defaultStatus = 'all'
}: ServicesSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(defaultSearch)
  const [category, setCategory] = useState(defaultCategory)
  const [status, setStatus] = useState(defaultStatus)
  const [showFilters, setShowFilters] = useState(false)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      
      if (search) {
        params.set('search', search)
      } else {
        params.delete('search')
      }
      
      if (category) {
        params.set('category', category)
      } else {
        params.delete('category')
      }
      
      if (status && status !== 'all') {
        params.set('status', status)
      } else {
        params.delete('status')
      }
      
      params.delete('page') // Reset to page 1
      
      router.push(`/services?${params.toString()}`)
    }, 300)

    return () => clearTimeout(timer)
  }, [search, category, status, router, searchParams])

  const clearFilters = () => {
    setSearch('')
    setCategory('')
    setStatus('all')
  }

  const hasActiveFilters = search || category || (status && status !== 'all')

  return (
    <div className="mb-6 space-y-4">
      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cerca per nome o descrizione..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center px-4 py-2 border rounded-md ${
            hasActiveFilters 
              ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-5 h-5 mr-2" />
          Filtri
          {hasActiveFilters && (
            <span className="ml-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
              {[search, category, status !== 'all' ? status : ''].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Tutte le categorie</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stato
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive' | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Tutti</option>
                <option value="active">Attivi</option>
                <option value="inactive">Inattivi</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  <X className="w-4 h-4 mr-2" />
                  Pulisci filtri
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}