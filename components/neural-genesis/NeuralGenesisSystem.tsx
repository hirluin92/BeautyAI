'use client'
import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, MessageCircle, Zap, Settings, Users, TrendingUp, BarChart3, RefreshCw, Send, Mic, MicOff, Bot, User, Star, Heart, ThumbsUp, ThumbsDown, Copy, Download, Upload, Plus, Edit, Trash2, Eye, EyeOff, Play, Pause, Square, Volume2, VolumeX, Sparkles, Cpu, Activity, Target, Globe, Smartphone, Mail, Phone, Clock, Calendar, Award, CheckCircle, AlertCircle, Info, ArrowRight, ArrowUp, ArrowDown, MoreVertical, Filter, Search, Sliders, Database, FileText
} from 'lucide-react';
// ... (segue tutto il codice fornito nel tuo mockup, con mock data e UI) ... 

interface AIPersona {
  id: string
  name: string
  avatar: string
  role: 'assistant' | 'salesperson' | 'expert' | 'support'
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
    tone: 'professional' | 'friendly' | 'casual' | 'enthusiastic'
    verbosity: 'concise' | 'balanced' | 'detailed'
    creativity: number
    empathy: number
    sales_focus: number
  }
}

interface Conversation {
  id: string
  client_name: string
  client_avatar?: string
  channel: 'whatsapp' | 'website' | 'email' | 'phone'
  status: 'active' | 'waiting' | 'completed' | 'escalated'
  ai_persona_id: string
  started_at: string
  last_message_at: string
  message_count: number
  satisfaction_rating?: number
  conversion_completed: boolean
  conversion_value?: number
  tags: string[]
}

interface Message {
  id: string
  conversation_id: string
  sender: 'ai' | 'client' | 'human'
  content: string
  timestamp: string
  type: 'text' | 'image' | 'audio' | 'file'
  metadata?: {
    confidence: number
    intent: string
    entities: Record<string, any>
    suggestions?: string[]
  }
}

interface AIMetrics {
  total_conversations: number
  active_conversations: number
  avg_satisfaction: number
  conversion_rate: number
  avg_response_time: number
  revenue_generated: number
  languages_detected: string[]
  top_intents: Array<{ intent: string; count: number }>
}

function NeuralGenesisSystem() {
  const [activeTab, setActiveTab] = useState('conversations')
  const [selectedPersona, setSelectedPersona] = useState<string>('all')
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [trainingMode, setTrainingMode] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const [aiPersonas, setAiPersonas] = useState<AIPersona[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [metrics, setMetrics] = useState<AIMetrics | null>(null)
  const [newMessage, setNewMessage] = useState('')

  // Mock data initialization
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true)
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockPersonas: AIPersona[] = [
        {
          id: '1',
          name: 'Sofia',
          avatar: '👩‍💼',
          role: 'assistant',
          personality: 'Professionale, empatica, efficiente',
          expertise: ['Prenotazioni', 'Informazioni servizi', 'Customer service'],
          languages: ['it', 'en', 'es'],
          voice_enabled: true,
          active: true,
          stats: {
            conversations: 2847,
            satisfaction: 4.8,
            conversions: 487,
            response_time: 1.2
          },
          settings: {
            tone: 'professional',
            verbosity: 'balanced',
            creativity: 70,
            empathy: 85,
            sales_focus: 60
          }
        },
        {
          id: '2',
          name: 'Marco',
          avatar: '👨‍💻',
          role: 'salesperson',
          personality: 'Carismatico, persuasivo, orientato ai risultati',
          expertise: ['Vendite', 'Cross-selling', 'Pacchetti premium'],
          languages: ['it', 'en'],
          voice_enabled: true,
          active: true,
          stats: {
            conversations: 1567,
            satisfaction: 4.6,
            conversions: 723,
            response_time: 0.9
          },
          settings: {
            tone: 'enthusiastic',
            verbosity: 'detailed',
            creativity: 80,
            empathy: 75,
            sales_focus: 95
          }
        },
        {
          id: '3',
          name: 'Luna',
          avatar: '🧠',
          role: 'expert',
          personality: 'Esperta, precisa, scientifica',
          expertise: ['Consulenza beauty', 'Problemi pelle', 'Ingredienti'],
          languages: ['it', 'en', 'fr'],
          voice_enabled: false,
          active: true,
          stats: {
            conversations: 892,
            satisfaction: 4.9,
            conversions: 234,
            response_time: 2.1
          },
          settings: {
            tone: 'professional',
            verbosity: 'detailed',
            creativity: 60,
            empathy: 90,
            sales_focus: 40
          }
        }
      ]

      const mockConversations: Conversation[] = [
        {
          id: '1',
          client_name: 'Maria Rossi',
          channel: 'whatsapp',
          status: 'active',
          ai_persona_id: '1',
          started_at: new Date(Date.now() - 300000).toISOString(),
          last_message_at: new Date(Date.now() - 30000).toISOString(),
          message_count: 8,
          conversion_completed: false,
          tags: ['new_client', 'facial_treatment']
        },
        {
          id: '2',
          client_name: 'Franco Bianchi',
          channel: 'website',
          status: 'waiting',
          ai_persona_id: '2',
          started_at: new Date(Date.now() - 1800000).toISOString(),
          last_message_at: new Date(Date.now() - 600000).toISOString(),
          message_count: 12,
          satisfaction_rating: 5,
          conversion_completed: true,
          conversion_value: 150,
          tags: ['vip_client', 'massage_package']
        },
        {
          id: '3',
          client_name: 'Anna Verdi',
          channel: 'whatsapp',
          status: 'active',
          ai_persona_id: '3',
          started_at: new Date(Date.now() - 900000).toISOString(),
          last_message_at: new Date(Date.now() - 120000).toISOString(),
          message_count: 6,
          conversion_completed: false,
          tags: ['skin_consultation', 'expert_advice']
        }
      ]

      const mockMessages: Message[] = [
        {
          id: '1',
          conversation_id: '1',
          sender: 'client',
          content: 'Ciao! Vorrei prenotare un trattamento viso per domani',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          type: 'text'
        },
        {
          id: '2',
          conversation_id: '1',
          sender: 'ai',
          content: 'Ciao Maria! 😊 Sarò felice di aiutarti a prenotare un trattamento viso. Che tipo di trattamento preferiresti? Abbiamo diverse opzioni disponibili come pulizia profonda, anti-age, o idratante.',
          timestamp: new Date(Date.now() - 280000).toISOString(),
          type: 'text',
          metadata: {
            confidence: 0.95,
            intent: 'booking_request',
            entities: { service_type: 'facial_treatment', timeframe: 'tomorrow' }
          }
        },
        {
          id: '3',
          conversation_id: '1',
          sender: 'client',
          content: 'Mi interesserebbe un trattamento anti-age. Quanto costa?',
          timestamp: new Date(Date.now() - 240000).toISOString(),
          type: 'text'
        },
        {
          id: '4',
          conversation_id: '1',
          sender: 'ai',
          content: 'Perfetta scelta! 🌟 Il nostro trattamento anti-age include pulizia profonda, peeling enzimatico e maschera rigenerante. Il costo è di €85 e dura circa 90 minuti. Per domani abbiamo disponibilità alle 10:00, 14:30 e 16:00. Quale orario preferisci?',
          timestamp: new Date(Date.now() - 220000).toISOString(),
          type: 'text',
          metadata: {
            confidence: 0.92,
            intent: 'price_inquiry',
            entities: { service: 'anti_age_facial', price: 85, duration: 90 }
          }
        }
      ]

      const mockMetrics: AIMetrics = {
        total_conversations: 5306,
        active_conversations: 23,
        avg_satisfaction: 4.7,
        conversion_rate: 34.2,
        avg_response_time: 1.4,
        revenue_generated: 89760,
        languages_detected: ['it', 'en', 'es', 'fr'],
        top_intents: [
          { intent: 'booking_request', count: 1847 },
          { intent: 'service_inquiry', count: 1234 },
          { intent: 'price_check', count: 892 },
          { intent: 'modification_request', count: 567 },
          { intent: 'complaint', count: 234 }
        ]
      }

      setAiPersonas(mockPersonas)
      setConversations(mockConversations)
      setMessages(mockMessages.filter(m => m.conversation_id === '1'))
      setMetrics(mockMetrics)
      setSelectedConversation('1')
      setLoading(false)
    }

    initializeData()
  }, [])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    const userMessage: Message = {
      id: Date.now().toString(),
      conversation_id: selectedConversation,
      sender: 'client',
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage('')

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        conversation_id: selectedConversation,
        sender: 'ai',
        content: generateAIResponse(newMessage),
        timestamp: new Date().toISOString(),
        type: 'text',
        metadata: {
          confidence: 0.89,
          intent: 'general_response',
          entities: {}
        }
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1500)
  }

  const generateAIResponse = (input: string): string => {
    const responses = [
      'Perfetto! Ti aiuto subito con la tua richiesta. 😊',
      'Capisco perfettamente. Lascia che ti fornisca tutte le informazioni.',
      'Ottima domanda! Ecco cosa posso consigliarti...',
      'Sarò felice di assisterti. Vediamo le opzioni disponibili.',
      'Grazie per avermi contattato! Posso aiutarti con questo.'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return <MessageCircle className="w-4 h-4 text-green-500" />
      case 'website': return <Globe className="w-4 h-4 text-blue-500" />
      case 'email': return <Mail className="w-4 h-4 text-purple-500" />
      case 'phone': return <Phone className="w-4 h-4 text-orange-500" />
      default: return <MessageCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'escalated': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-pink-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-32 h-32 border-4 border-pink-500/30 rounded-full animate-spin border-t-pink-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="w-12 h-12 text-pink-400 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Risveglio Neural Genesis</h3>
            <p className="text-pink-300">Inizializzazione super-intelligenza...</p>
            <div className="w-64 mx-auto bg-pink-900/50 rounded-full h-2">
              <div className="bg-gradient-to-r from-pink-500 to-orange-400 h-2 rounded-full w-3/4 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-pink-900 to-slate-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-orange-600/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        
        <div className="relative px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-400 rounded-2xl flex items-center justify-center shadow-2xl mr-4">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white">NEURAL GENESIS</h1>
                    <p className="text-pink-300">Super-Intelligenza Conversazionale</p>
                  </div>
                </div>
                <p className="text-xl text-gray-300 max-w-2xl">
                  AI che gestisce conversazioni umane perfette, vende automaticamente e conquista clienti
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setTrainingMode(!trainingMode)}
                  className={`flex items-center px-6 py-3 rounded-xl transition-all ${
                    trainingMode 
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Cpu className="w-5 h-5 mr-2" />
                  {trainingMode ? 'Training Attivo' : 'Modalità Training'}
                </button>
                
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl p-1">
                  {['conversations', 'personas', 'analytics', 'training'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                        activeTab === tab 
                          ? 'bg-white text-pink-600 shadow-lg' 
                          : 'text-white hover:bg-white/20'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <MessageCircle className="w-8 h-8 text-pink-400" />
                  <span className="text-2xl font-bold text-white">{metrics?.active_conversations}</span>
                </div>
                <p className="text-pink-300 font-medium">Chat Attive</p>
                <p className="text-gray-400 text-sm">+{metrics?.total_conversations} totali</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <Star className="w-8 h-8 text-yellow-400" />
                  <span className="text-2xl font-bold text-white">{metrics?.avg_satisfaction}⭐</span>
                </div>
                <p className="text-yellow-300 font-medium">Satisfaction</p>
                <p className="text-gray-400 text-sm">Media AI Personas</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-8 h-8 text-green-400" />
                  <span className="text-2xl font-bold text-white">{metrics?.conversion_rate}%</span>
                </div>
                <p className="text-green-300 font-medium">Conversioni</p>
                <p className="text-gray-400 text-sm">Tasso conversione AI</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-8 h-8 text-blue-400" />
                  <span className="text-2xl font-bold text-white">{metrics?.avg_response_time}s</span>
                </div>
                <p className="text-blue-300 font-medium">Tempo Risposta</p>
                <p className="text-gray-400 text-sm">Media AI</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                  <span className="text-2xl font-bold text-white">€{(metrics?.revenue_generated || 0).toLocaleString()}</span>
                </div>
                <p className="text-purple-300 font-medium">Revenue AI</p>
                <p className="text-gray-400 text-sm">Generato questo mese</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content will be added in next step */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {activeTab === 'conversations' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
            {/* Conversations List */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">Conversazioni Attive</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedPersona('all')}
                    className={`px-3 py-1 text-sm rounded-lg transition-all ${
                      selectedPersona === 'all' 
                        ? 'bg-pink-500 text-white' 
                        : 'bg-white/20 text-gray-300'
                    }`}
                  >
                    Tutte
                  </button>
                  {aiPersonas.map(persona => (
                    <button
                      key={persona.id}
                      onClick={() => setSelectedPersona(persona.id)}
                      className={`px-3 py-1 text-sm rounded-lg transition-all ${
                        selectedPersona === persona.id 
                          ? 'bg-pink-500 text-white' 
                          : 'bg-white/20 text-gray-300'
                      }`}
                    >
                      {persona.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="overflow-y-auto max-h-96">
                {conversations
                  .filter(conv => selectedPersona === 'all' || conv.ai_persona_id === selectedPersona)
                  .map(conversation => {
                    const persona = aiPersonas.find(p => p.id === conversation.ai_persona_id)
                    return (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation.id)}
                        className={`p-4 border-b border-white/10 cursor-pointer transition-all hover:bg-white/5 ${
                          selectedConversation === conversation.id ? 'bg-white/10' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                              <User className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{conversation.client_name}</h4>
                              <div className="flex items-center space-x-2">
                                {getChannelIcon(conversation.channel)}
                                <span className="text-gray-400 text-sm">{persona?.name}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(conversation.status)}`}>
                              {conversation.status}
                            </span>
                            <p className="text-gray-400 text-xs mt-1">
                              {new Date(conversation.last_message_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span>{conversation.message_count} messaggi</span>
                          {conversation.conversion_completed && (
                            <span className="text-green-400 flex items-center">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              €{conversation.conversion_value}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-2 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex flex-col">
              {selectedConversation ? (
                <>
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                          <User className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            {conversations.find(c => c.id === selectedConversation)?.client_name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-gray-400 text-sm">Online</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-white/20 rounded-lg transition-all">
                          <Phone className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-white/20 rounded-lg transition-all">
                          <Settings className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'ai' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            message.sender === 'ai'
                              ? 'bg-white/20 text-white'
                              : 'bg-gradient-to-r from-pink-500 to-orange-400 text-white'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs opacity-70">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                            {message.metadata && (
                              <span className="text-xs opacity-70">
                                {Math.round(message.metadata.confidence * 100)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  
                  <div className="p-6 border-t border-white/10">
                    <div className="flex items-center space-x-4">
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-white/20 rounded-lg transition-all">
                        <Plus className="w-5 h-5" />
                      </button>
                      
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Scrivi un messaggio..."
                          className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>
                      
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="p-3 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                      
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-white/20 rounded-lg transition-all">
                        <Mic className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Seleziona una conversazione</h3>
                    <p className="text-gray-400">Scegli una chat per iniziare a monitorare l'AI</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'personas' && (
          <div className="space-y-8">
            {/* AI Personas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiPersonas.map(persona => (
                <div key={persona.id} className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="text-4xl mr-4">{persona.avatar}</div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{persona.name}</h3>
                        <p className="text-pink-300 capitalize">{persona.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-white/20 rounded-lg transition-all">
                        <Settings className="w-4 h-4" />
                      </button>
                      <div className={`w-3 h-3 rounded-full ${persona.active ? 'bg-green-400' : 'bg-gray-400'}`} />
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-4">{persona.personality}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Esperienze</p>
                      <div className="flex flex-wrap gap-1">
                        {persona.expertise.map(exp => (
                          <span key={exp} className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full">
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Lingue</p>
                      <div className="flex space-x-1">
                        {persona.languages.map(lang => (
                          <span key={lang} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                            {lang.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{persona.stats.conversations}</p>
                      <p className="text-gray-400 text-xs">Conversazioni</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{persona.stats.satisfaction}⭐</p>
                      <p className="text-gray-400 text-xs">Satisfaction</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{persona.stats.conversions}</p>
                      <p className="text-gray-400 text-xs">Conversioni</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{persona.stats.response_time}s</p>
                      <p className="text-gray-400 text-xs">Tempo risposta</p>
                    </div>
                  </div>
                  
                  {/* Settings Sliders */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Creatività</span>
                        <span>{persona.settings.creativity}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-pink-500 to-orange-400 h-2 rounded-full" 
                          style={{ width: `${persona.settings.creativity}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Empatia</span>
                        <span>{persona.settings.empathy}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-400 h-2 rounded-full" 
                          style={{ width: `${persona.settings.empathy}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Focus Vendite</span>
                        <span>{persona.settings.sales_focus}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full" 
                          style={{ width: `${persona.settings.sales_focus}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex space-x-2">
                    <button className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all">
                      Testa AI
                    </button>
                    <button className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-all">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Add New Persona */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border-2 border-dashed border-white/20 p-6 flex items-center justify-center hover:border-white/40 transition-all cursor-pointer">
                <div className="text-center">
                  <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Nuova AI Persona</h3>
                  <p className="text-gray-400 text-sm">Crea una nuova personalità AI</p>
                </div>
              </div>
            </div>
            
            {/* Persona Performance Chart */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Performance AI Personas</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {aiPersonas.map(persona => (
                  <div key={persona.id} className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 relative">
                      <div className="w-full h-full rounded-full bg-gradient-to-r from-pink-500 to-orange-400 flex items-center justify-center text-2xl">
                        {persona.avatar}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <h4 className="font-semibold text-white mb-2">{persona.name}</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Conversazioni</span>
                        <span className="text-white">{persona.stats.conversations}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Satisfaction</span>
                        <span className="text-white">{persona.stats.satisfaction}⭐</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Conversioni</span>
                        <span className="text-white">{persona.stats.conversions}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Top Intents Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <h3 className="text-xl font-bold text-white mb-6">Top Intents Rilevati</h3>
                <div className="space-y-4">
                  {metrics?.top_intents.map((intent, index) => (
                    <div key={intent.intent} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-orange-400 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-white font-medium capitalize">
                            {intent.intent.replace('_', ' ')}
                          </p>
                          <p className="text-gray-400 text-sm">{intent.count} richieste</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">
                          {Math.round((intent.count / (metrics?.total_conversations || 1)) * 100)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <h3 className="text-xl font-bold text-white mb-6">Lingue Rilevate</h3>
                <div className="space-y-4">
                  {metrics?.languages_detected.map((lang, index) => (
                    <div key={lang} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-400 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                          {lang.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {lang === 'it' ? 'Italiano' : 
                             lang === 'en' ? 'Inglese' : 
                             lang === 'es' ? 'Spagnolo' : 
                             lang === 'fr' ? 'Francese' : lang}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {Math.floor(Math.random() * 1000) + 200} conversazioni
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">
                          {Math.floor(Math.random() * 30) + 10}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">+12.5%</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Tasso Conversione</h3>
                <p className="text-gray-400 text-sm">Rispetto al mese scorso</p>
                <div className="mt-4 w-full bg-white/20 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full" style={{ width: '34.2%' }} />
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-8 h-8 text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">-0.3s</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Tempo Risposta</h3>
                <p className="text-gray-400 text-sm">Miglioramento medio</p>
                <div className="mt-4 w-full bg-white/20 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-400 h-2 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <Star className="w-8 h-8 text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-medium">+0.2</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Satisfaction Score</h3>
                <p className="text-gray-400 text-sm">Miglioramento rating</p>
                <div className="mt-4 w-full bg-white/20 rounded-full h-2">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-400 h-2 rounded-full" style={{ width: '94%' }} />
                </div>
              </div>
            </div>
            
            {/* Revenue Analysis */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Analisi Revenue AI</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">€{metrics?.revenue_generated.toLocaleString()}</h4>
                  <p className="text-green-400 text-sm font-medium">Revenue Totale</p>
                  <p className="text-gray-400 text-xs">Questo mese</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">{metrics?.conversion_rate}%</h4>
                  <p className="text-blue-400 text-sm font-medium">Tasso Conversione</p>
                  <p className="text-gray-400 text-xs">Media AI</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">{Math.floor((metrics?.revenue_generated || 0) / 150)}</h4>
                  <p className="text-pink-400 text-sm font-medium">Clienti Convertiti</p>
                  <p className="text-gray-400 text-xs">Media €150/ordine</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">{metrics?.avg_satisfaction}⭐</h4>
                  <p className="text-yellow-400 text-sm font-medium">Satisfaction</p>
                  <p className="text-gray-400 text-xs">Media clienti</p>
                </div>
              </div>
            </div>
            
            {/* AI Performance Timeline */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Timeline Performance AI</h3>
              <div className="space-y-4">
                {[
                  { date: 'Oggi', conversations: 23, conversions: 8, satisfaction: 4.8 },
                  { date: 'Ieri', conversations: 45, conversions: 12, satisfaction: 4.6 },
                  { date: '2 giorni fa', conversations: 38, conversions: 11, satisfaction: 4.7 },
                  { date: '3 giorni fa', conversations: 52, conversions: 15, satisfaction: 4.9 },
                  { date: '4 giorni fa', conversations: 41, conversions: 13, satisfaction: 4.5 }
                ].map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-400 rounded-xl flex items-center justify-center mr-4">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{day.date}</h4>
                        <p className="text-gray-400 text-sm">{day.conversations} conversazioni</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-green-400 font-bold">{day.conversions}</p>
                        <p className="text-gray-400 text-xs">Conversioni</p>
                      </div>
                      <div className="text-center">
                        <p className="text-yellow-400 font-bold">{day.satisfaction}⭐</p>
                        <p className="text-gray-400 text-xs">Satisfaction</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'training' && (
          <div className="space-y-8">
            {/* Training Status */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Status Training AI</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setTrainingMode(!trainingMode)}
                    className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                      trainingMode 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <Cpu className="w-4 h-4 mr-2" />
                    {trainingMode ? 'Training Attivo' : 'Avvia Training'}
                  </button>
                  <button className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Database className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">2,847</h4>
                  <p className="text-green-400 text-sm font-medium">Dataset Size</p>
                  <p className="text-gray-400 text-xs">Conversazioni</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">98.7%</h4>
                  <p className="text-blue-400 text-sm font-medium">Accuracy</p>
                  <p className="text-gray-400 text-xs">Ultimo training</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">2h 34m</h4>
                  <p className="text-pink-400 text-sm font-medium">Tempo Training</p>
                  <p className="text-gray-400 text-xs">Ultima sessione</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">+15.3%</h4>
                  <p className="text-yellow-400 text-sm font-medium">Miglioramento</p>
                  <p className="text-gray-400 text-xs">Performance</p>
                </div>
              </div>
            </div>
            
            {/* Training Configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <h3 className="text-xl font-bold text-white mb-6">Configurazione Training</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Learning Rate</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="0.001"
                        max="0.1"
                        step="0.001"
                        defaultValue="0.01"
                        className="flex-1"
                      />
                      <span className="text-white font-mono">0.01</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Batch Size</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="16"
                        max="128"
                        step="16"
                        defaultValue="32"
                        className="flex-1"
                      />
                      <span className="text-white font-mono">32</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Epochs</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        defaultValue="50"
                        className="flex-1"
                      />
                      <span className="text-white font-mono">50</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Validation Split</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="0.1"
                        max="0.3"
                        step="0.05"
                        defaultValue="0.2"
                        className="flex-1"
                      />
                      <span className="text-white font-mono">20%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <h3 className="text-xl font-bold text-white mb-6">Dataset Management</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center">
                      <FileText className="w-8 h-8 text-blue-400 mr-3" />
                      <div>
                        <h4 className="text-white font-semibold">Conversazioni Beauty</h4>
                        <p className="text-gray-400 text-sm">1,847 conversazioni</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400 text-sm">✓ Validato</span>
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-white/20 rounded-lg transition-all">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center">
                      <FileText className="w-8 h-8 text-green-400 mr-3" />
                      <div>
                        <h4 className="text-white font-semibold">FAQ Beauty</h4>
                        <p className="text-gray-400 text-sm">523 domande/risposte</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400 text-sm">✓ Validato</span>
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-white/20 rounded-lg transition-all">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center">
                      <FileText className="w-8 h-8 text-yellow-400 mr-3" />
                      <div>
                        <h4 className="text-white font-semibold">Recensioni Clienti</h4>
                        <p className="text-gray-400 text-sm">477 recensioni</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-400 text-sm">In validazione</span>
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-white/20 rounded-lg transition-all">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <button className="w-full p-4 border-2 border-dashed border-white/20 rounded-xl text-white hover:border-white/40 transition-all">
                    <div className="flex items-center justify-center">
                      <Plus className="w-5 h-5 mr-2" />
                      Aggiungi Dataset
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Training History */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Cronologia Training</h3>
              <div className="space-y-4">
                {[
                  { date: 'Oggi 14:30', accuracy: '98.7%', duration: '2h 34m', status: 'completed' },
                  { date: 'Ieri 09:15', accuracy: '97.2%', duration: '1h 45m', status: 'completed' },
                  { date: '3 giorni fa', accuracy: '96.8%', duration: '2h 12m', status: 'completed' },
                  { date: '1 settimana fa', accuracy: '95.1%', duration: '3h 08m', status: 'completed' }
                ].map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-400 rounded-xl flex items-center justify-center mr-4">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">Training Session #{index + 1}</h4>
                        <p className="text-gray-400 text-sm">{session.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-green-400 font-bold">{session.accuracy}</p>
                        <p className="text-gray-400 text-xs">Accuracy</p>
                      </div>
                      <div className="text-center">
                        <p className="text-blue-400 font-bold">{session.duration}</p>
                        <p className="text-gray-400 text-xs">Durata</p>
                      </div>
                      <button className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm hover:bg-white/30 transition-all">
                        Dettagli
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NeuralGenesisSystem; 