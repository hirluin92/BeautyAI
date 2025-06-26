import { useState, useEffect } from 'react'

interface Message {
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

export function useAIConversation(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  const sendMessage = async (content: string, senderType: 'client' | 'human' = 'client') => {
    try {
      const response = await fetch(`/api/neural-genesis/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          senderType,
          messageType: 'text'
        })
      })
      const result = await response.json()
      if (!result.success) throw new Error(result.error)
      setMessages(prev => [
        ...prev, 
        result.data.message,
        ...(result.data.aiResponse ? [result.data.aiResponse] : [])
      ])
      return result.data
    } catch (error) {
      throw error
    }
  }

  useEffect(() => {
    if (conversationId) {
      fetchMessages()
    }
  }, [conversationId])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/neural-genesis/conversations/${conversationId}/messages`)
      const result = await response.json()
      if (result.success) {
        setMessages(result.data)
      }
    } finally {
      setLoading(false)
    }
  }

  return { messages, loading, sendMessage, refetch: fetchMessages }
} 