import { useState, useEffect } from 'react'

// Types
export interface AIPersona {
  id: string
  name: string
  avatar: string
  role: 'assistant' | 'salesperson' | 'expert'
  personality: string
  expertise: string[]
  languages: string[]
  voice_enabled: boolean
  active: boolean
  stats: {
    conversations: number
    satisfaction: number
    conversions: number
    response_time: number
  }
  settings: {
    tone: string
    verbosity: string
    creativity: number
    empathy: number
    sales_focus: number
  }
}

export interface Conversation {
  id: string
  client_name: string
  channel: 'whatsapp' | 'website' | 'email' | 'phone'
  status: 'active' | 'waiting' | 'completed' | 'escalated'
  ai_persona_id: string
  started_at: string
  last_message_at: string
  message_count: number
  satisfaction_rating?: number
  conversion_completed?: boolean
  conversion_value?: number
  tags: string[]
}

export interface Message {
  id: string
  conversation_id: string
  sender: 'client' | 'ai'
  content: string
  timestamp: string
  type: 'text' | 'image' | 'voice'
  metadata?: {
    confidence: number
    intent: string
    entities: Record<string, any>
  }
}

export interface AIMetrics {
  total_conversations: number
  active_conversations: number
  avg_satisfaction: number
  conversion_rate: number
  avg_response_time: number
  revenue_generated: number
  languages_detected: string[]
  top_intents: Array<{
    intent: string
    count: number
  }>
}

export interface TrainingSession {
  id: string
  start_time: string
  end_time?: string
  status: 'running' | 'completed' | 'failed'
  accuracy?: number
  duration?: number
  dataset_size: number
  config: {
    learning_rate: number
    batch_size: number
    epochs: number
    validation_split: number
  }
}

export const useNeuralGenesis = () => {
  const [aiPersonas, setAiPersonas] = useState<AIPersona[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [metrics, setMetrics] = useState<AIMetrics | null>(null)
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch AI Personas
  const fetchAIPersonas = async () => {
    try {
      setLoading(true)
      // TODO: Implement API call
      const response = await fetch('/api/neural-genesis/personas')
      if (!response.ok) throw new Error('Failed to fetch AI personas')
      const data = await response.json()
      setAiPersonas(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Fetch Conversations
  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/neural-genesis/conversations')
      if (!response.ok) throw new Error('Failed to fetch conversations')
      const data = await response.json()
      setConversations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  // Fetch Messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/neural-genesis/conversations/${conversationId}/messages`)
      if (!response.ok) throw new Error('Failed to fetch messages')
      const data = await response.json()
      setMessages(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  // Send Message
  const sendMessage = async (conversationId: string, content: string) => {
    try {
      const response = await fetch(`/api/neural-genesis/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      if (!response.ok) throw new Error('Failed to send message')
      const newMessage = await response.json()
      setMessages(prev => [...prev, newMessage])
      return newMessage
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  // Create AI Persona
  const createAIPersona = async (persona: Omit<AIPersona, 'id'>) => {
    try {
      const response = await fetch('/api/neural-genesis/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(persona)
      })
      if (!response.ok) throw new Error('Failed to create AI persona')
      const newPersona = await response.json()
      setAiPersonas(prev => [...prev, newPersona])
      return newPersona
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  // Update AI Persona
  const updateAIPersona = async (id: string, updates: Partial<AIPersona>) => {
    try {
      const response = await fetch(`/api/neural-genesis/personas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!response.ok) throw new Error('Failed to update AI persona')
      const updatedPersona = await response.json()
      setAiPersonas(prev => prev.map(p => p.id === id ? updatedPersona : p))
      return updatedPersona
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  // Start Training Session
  const startTraining = async (config: TrainingSession['config']) => {
    try {
      const response = await fetch('/api/neural-genesis/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      if (!response.ok) throw new Error('Failed to start training')
      const session = await response.json()
      setTrainingSessions(prev => [...prev, session])
      return session
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  // Get Training Status
  const getTrainingStatus = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/neural-genesis/training/${sessionId}`)
      if (!response.ok) throw new Error('Failed to get training status')
      const status = await response.json()
      setTrainingSessions(prev => prev.map(s => s.id === sessionId ? { ...s, ...status } : s))
      return status
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  // Fetch Metrics
  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/neural-genesis/metrics')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      const data = await response.json()
      setMetrics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  // Initialize data
  useEffect(() => {
    fetchAIPersonas()
    fetchConversations()
    fetchMetrics()
  }, [])

  return {
    // State
    aiPersonas,
    conversations,
    messages,
    metrics,
    trainingSessions,
    loading,
    error,
    
    // Actions
    fetchAIPersonas,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createAIPersona,
    updateAIPersona,
    startTraining,
    getTrainingStatus,
    fetchMetrics,
    
    // Utilities
    clearError: () => setError(null)
  }
} 