import { useState, useEffect } from 'react'

interface TimeSingularityData {
  timeSlots: any[]
  analytics: any
  staff: any[]
  date: string
}

export function useTimeSingularity(date?: string) {
  const [data, setData] = useState<TimeSingularityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentDate = date || new Date().toISOString().split('T')[0]

  const fetchData = async (staffId?: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ date: currentDate })
      if (staffId) params.append('staff_id', staffId)
      
      const response = await fetch(`/api/time-singularity?${params}`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      setData(result.data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const runQuantumOptimization = async (optimizationType: string = 'balance') => {
    try {
      const response = await fetch('/api/time-singularity/quantum-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: currentDate,
          optimizationType
        })
      })
      
      const result = await response.json()
      if (!result.success) throw new Error(result.error)
      
      // Refresh data after optimization
      await fetchData()
      
      return result.data
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const syncStaffQuantum = async (staffId: string, enabled: boolean, preferences: any = {}) => {
    try {
      const response = await fetch('/api/time-singularity/staff-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId,
          quantumEnabled: enabled,
          preferences
        })
      })
      
      const result = await response.json()
      if (!result.success) throw new Error(result.error)
      
      // Refresh data after sync
      await fetchData()
      
      return result.data
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentDate])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    runQuantumOptimization,
    syncStaffQuantum
  }
} 