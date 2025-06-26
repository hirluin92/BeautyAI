import { useState, useEffect } from 'react'

interface OmniPresenceData {
  overview: {
    channels: number
    activeChannels: number
    activeCampaigns: number
    aiPersonas: number
    totalStats: {
      sent: number
      delivered: number
      opened: number
      clicked: number
      conversions: number
    }
    totalRevenue: number
    aiSatisfaction: number
  }
  channels: any[]
  campaigns: any[]
  aiPersonas: any[]
  recentActivity: any[]
}

export function useOmniPresence() {
  const [data, setData] = useState<OmniPresenceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/omni-presence')
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

  useEffect(() => {
    fetchData()
  }, [])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
} 