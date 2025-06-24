'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

interface Message {
  id: string
  content: string
  isFromClient: boolean
  timestamp: Date
}

interface Service {
  id: string
  name: string
  category: string
  price: number
  duration_minutes: number
}

interface Organization {
  id: string
  name: string
  address: string
  working_hours: Record<string, unknown>
}

export default function TestAIPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<string>('')
  const [phoneNumber, setPhoneNumber] = useState<string>('+393331234567')
  const [message, setMessage] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const supabase = useMemo(() => createClient(), [])

  const loadOrganizations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, address, working_hours')
        .limit(10)

      if (error) throw error
      setOrganizations((data as Organization[]) || [])
    } catch (error) {
      console.error('Error loading organizations:', error)
    }
  }, [supabase])

  const loadServices = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, category, price, duration_minutes')
        .eq('organization_id', selectedOrg)
        .eq('is_active', true)

      if (error) throw error
      setServices((data as Service[]) || [])
    } catch (error) {
      console.error('Error loading services:', error)
    }
  }, [supabase, selectedOrg])

  const loadChatHistory = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/whatsapp/test?organizationId=${selectedOrg}&phoneNumber=${phoneNumber}`
      )
      const data = await response.json()

      if (data.recentMessages) {
        const formattedMessages = data.recentMessages.map((msg: Record<string, unknown>) => ({
          id: Math.random().toString(),
          content: msg.content as string,
          isFromClient: msg.is_from_client as boolean,
          timestamp: new Date(msg.created_at as string)
        }))
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
  }, [selectedOrg, phoneNumber])

  useEffect(() => {
    loadOrganizations()
  }, [loadOrganizations, supabase])

  useEffect(() => {
    if (selectedOrg) {
      loadServices()
      loadChatHistory()
    }
  }, [selectedOrg, loadServices, loadChatHistory])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!message.trim() || !selectedOrg) return

    const userMessage: Message = {
      id: Math.random().toString(),
      content: message,
      isFromClient: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          organizationId: selectedOrg,
          phoneNumber
        })
      })

      const data = await response.json()

      if (data.success) {
        const aiMessage: Message = {
          id: Math.random().toString(),
          content: data.response.text,
          isFromClient: false,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        const errorMessage: Message = {
          id: Math.random().toString(),
          content: `❌ Errore: ${data.error}`,
          isFromClient: false,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch {
      const errorMessage: Message = {
        id: Math.random().toString(),
        content: '❌ Errore di connessione',
        isFromClient: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const sendQuickMessage = (quickMessage: string) => {
    setMessage(quickMessage)
  }

  const clearChat = () => {
    setMessages([])
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🧪 Test AI WhatsApp</h1>
        <p className="text-gray-600">
          Simula conversazioni WhatsApp con l&apos;AI per testare le funzionalità
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurazione */}
        <Card>
          <CardHeader>
            <CardTitle>⚙️ Configurazione</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Organizzazione
              </label>
              <select
                value={selectedOrg}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedOrg(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Seleziona organizzazione</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Numero Telefono
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
                placeholder="+393331234567"
                className="w-full p-2 border rounded-md"
              />
            </div>

            <Button onClick={clearChat} variant="outline" className="w-full">
              🗑️ Cancella Chat
            </Button>
          </CardContent>
        </Card>

        {/* Chat */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>💬 Chat AI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 border rounded-lg p-4 mb-4 overflow-y-auto bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-20">
                  <p>Inizia una conversazione con l&apos;AI</p>
                  <p className="text-sm mt-2">
                    Prova: &quot;Ciao&quot;, &quot;Prenota appuntamento&quot;, &quot;Info servizi&quot;
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isFromClient ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                          msg.isFromClient
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          msg.isFromClient ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {msg.timestamp.toLocaleTimeString('it-IT')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  value={message}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && sendMessage()}
                  placeholder="Scrivi un messaggio..."
                  disabled={!selectedOrg || isLoading}
                  className="flex-1 p-2 border rounded-md"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!message.trim() || !selectedOrg || isLoading}
                >
                  {isLoading ? '⏳' : '📤'}
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendQuickMessage('Ciao')}
                  disabled={!selectedOrg}
                >
                  👋 Ciao
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendQuickMessage('Prenota appuntamento')}
                  disabled={!selectedOrg}
                >
                  📅 Prenota
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendQuickMessage('Info servizi')}
                  disabled={!selectedOrg}
                >
                  ❓ Servizi
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendQuickMessage('Le mie prenotazioni')}
                  disabled={!selectedOrg}
                >
                  📋 Prenotazioni
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Servizi disponibili */}
      {services.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>💆 Servizi Disponibili</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(service => (
                <div key={service.id} className="border rounded-lg p-3">
                  <h3 className="font-medium">{service.name}</h3>
                  <p className="text-sm text-gray-600">{service.category}</p>
                  <div className="flex justify-between items-center mt-2">
                    <Badge variant="secondary">
                      {service.duration_minutes} min
                    </Badge>
                    <span className="font-medium">€{service.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 