import { useState, useEffect } from 'react'

export function useCampaigns(filters?: { status?: string; page?: number; limit?: number }) {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<any>(null)

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())
      
      const response = await fetch(`/api/omni-presence/campaigns?${params}`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      setCampaigns(result.data)
      setMeta(result.meta)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [filters?.status, filters?.page, filters?.limit])

  const createCampaign = async (campaignData: any) => {
    const response = await fetch('/api/omni-presence/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignData)
    })
    
    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error)
    }
    
    await fetchCampaigns() // Refresh list
    return result.data
  }

  const updateCampaign = async (id: string, campaignData: any) => {
    const response = await fetch(`/api/omni-presence/campaigns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignData)
    })
    
    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error)
    }
    
    await fetchCampaigns() // Refresh list
    return result.data
  }

  const deleteCampaign = async (id: string) => {
    const response = await fetch(`/api/omni-presence/campaigns/${id}`, {
      method: 'DELETE'
    })
    
    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error)
    }
    
    await fetchCampaigns() // Refresh list
  }

  return {
    campaigns,
    loading,
    error,
    meta,
    refetch: fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign
  }
} 