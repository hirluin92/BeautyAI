"use client"

import React, { useState, useEffect } from 'react';
import { 
  Settings,
  MessageCircle,
  Mail,
  Phone,
  Instagram,
  Facebook,
  Chrome,
  Bot,
  Zap,
  Globe,
  Shield,
  Clock,
  Users,
  Bell,
  Key,
  Database,
  RefreshCw,
  Save,
  TestTube,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit,
  Copy,
  Download,
  Upload,
  Smartphone,
  MonitorSpeaker,
  Palette,
  Sliders,
  Target,
  BarChart3,
  Activity
} from 'lucide-react';

// --- INTERFACCE ---
interface ChannelConfig {
  id: string
  type: 'whatsapp' | 'email' | 'sms' | 'instagram' | 'facebook' | 'website' | 'google'
  name: string
  status: 'active' | 'inactive' | 'error' | 'testing'
  config: Record<string, any>
  automation_enabled: boolean
  ai_enabled: boolean
  last_test?: string
  error_message?: string
}

interface GlobalSettings {
  general: {
    timezone: string
    language: string
    dateFormat: string
    currency: string
    workingHours: {
      enabled: boolean
      start: string
      end: string
      days: string[]
    }
  }
  messaging: {
    dailyLimit: number
    messageInterval: number
    retryAttempts: number
    enableDeliveryReports: boolean
    enableReadReceipts: boolean
  }
  ai: {
    responseMode: 'automatic' | 'working_hours' | 'offline_only' | 'supervised'
    autonomyLevel: 'full' | 'moderate' | 'conservative'
    personality: 'professional' | 'friendly' | 'energetic' | 'relaxed'
    maxResponseTime: number
    escalationRules: {
      enabled: boolean
      keywords: string[]
      humanHandoff: boolean
    }
  }
  automation: {
    enableWorkflows: boolean
    enableSmartScheduling: boolean
    enableA_BTesting: boolean
    enableSegmentation: boolean
  }
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    webhook: boolean
    webhookUrl?: string
  }
}

// --- COMPONENTE PRINCIPALE ---
function OmniSettingsPage() {
  const [activeTab, setActiveTab] = useState('channels')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [now, setNow] = useState('');
  
  const [channels, setChannels] = useState<ChannelConfig[]>([
    {
      id: '1',
      type: 'whatsapp',
      name: 'WhatsApp Business',
      status: 'active',
      config: {
        accessToken: 'EAAxxxxxxxxxxxxxxx',
        phoneNumberId: '123456789',
        webhookVerifyToken: 'verify_token_123'
      },
      automation_enabled: true,
      ai_enabled: true,
      last_test: '2024-12-27T10:30:00Z'
    },
    {
      id: '2',
      type: 'email',
      name: 'Email Marketing',
      status: 'active',
      config: {
        serviceId: 'service_abc123',
        templateId: 'template_def456',
        publicKey: 'pub_key_789',
        fromName: 'Beauty Salon',
        fromEmail: 'info@beautysalon.com'
      },
      automation_enabled: true,
      ai_enabled: false,
      last_test: '2024-12-27T09:15:00Z'
    },
    {
      id: '3',
      type: 'sms',
      name: 'SMS Notifications',
      status: 'inactive',
      config: {
        accountSid: 'AC123456789',
        authToken: 'auth_token_123',
        fromNumber: '+1234567890'
      },
      automation_enabled: false,
      ai_enabled: false,
      error_message: 'Invalid credentials'
    },
    {
      id: '4',
      type: 'instagram',
      name: 'Instagram Business',
      status: 'testing',
      config: {
        accessToken: 'IGQVxxxxxxxxxxxxxxx',
        accountId: 'ig_account_123',
        webhookUrl: 'https://your-app.com/webhook'
      },
      automation_enabled: true,
      ai_enabled: true
    }
  ])

  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    general: {
      timezone: 'Europe/Rome',
      language: 'it',
      dateFormat: 'DD/MM/YYYY',
      currency: 'EUR',
      workingHours: {
        enabled: true,
        start: '09:00',
        end: '19:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      }
    },
    messaging: {
      dailyLimit: 1000,
      messageInterval: 60,
      retryAttempts: 3,
      enableDeliveryReports: true,
      enableReadReceipts: true
    },
    ai: {
      responseMode: 'automatic',
      autonomyLevel: 'moderate',
      personality: 'professional',
      maxResponseTime: 300,
      escalationRules: {
        enabled: true,
        keywords: ['problema', 'aiuto', 'manager', 'reclamo'],
        humanHandoff: true
      }
    },
    automation: {
      enableWorkflows: true,
      enableSmartScheduling: true,
      enableA_BTesting: false,
      enableSegmentation: true
    },
    notifications: {
      email: true,
      push: true,
      sms: false,
      webhook: false,
      webhookUrl: ''
    }
  })

  useEffect(() => {
    setNow(new Date().toLocaleTimeString());
    const interval = setInterval(() => {
      setNow(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Funzioni di utilità e rendering tab ---
  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'whatsapp': return MessageCircle
      case 'email': return Mail
      case 'sms': return Phone
      case 'instagram': return Instagram
      case 'facebook': return Facebook
      case 'website': return Chrome
      default: return Globe
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'error': return 'bg-red-100 text-red-700 border-red-200'
      case 'testing': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'inactive': return <XCircle className="w-4 h-4" />
      case 'error': return <AlertCircle className="w-4 h-4" />
      case 'testing': return <TestTube className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const toggleSecret = (channelId: string, field: string) => {
    const key = `${channelId}_${field}`
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const testChannel = async (channelId: string) => {
    setLoading(true)
    setTimeout(() => {
      setChannels(prev => prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, status: 'active', last_test: new Date().toISOString(), error_message: undefined }
          : channel
      ))
      setLoading(false)
    }, 2000)
  }

  const saveSettings = async () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
    }, 1500)
  }

  // --- Funzioni di rendering tab ---
  const renderChannelsTab = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configurazione Canali</h2>
          <p className="text-gray-600 mt-1">Gestisci le connessioni e configurazioni per tutti i canali</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Aggiungi Canale
        </button>
      </div>
      <div className="grid gap-6">
        {channels.map((channel) => {
          const IconComponent = getChannelIcon(channel.type)
          return (
            <div key={channel.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <IconComponent className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{channel.name}</h3>
                    <div className="flex items-center mt-1">
                      <span className={`flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(channel.status)}`}>
                        {getStatusIcon(channel.status)}
                        <span className="ml-1 capitalize">{channel.status}</span>
                      </span>
                      {channel.last_test && (
                        <span className="ml-3 text-sm text-gray-500">
                          Ultimo test: {new Date(channel.last_test).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => testChannel(channel.id)}
                    disabled={loading}
                    className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4 mr-2" />
                    )}
                    Test
                  </button>
                  <button className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Edit className="w-4 h-4 mr-2" />
                    Modifica
                  </button>
                </div>
              </div>
              {channel.error_message && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-700 font-medium">Errore: {channel.error_message}</span>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {Object.entries(channel.config).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <div className="relative">
                      <input
                        type={key.toLowerCase().includes('token') || key.toLowerCase().includes('key') || key.toLowerCase().includes('secret') ? 
                          (showSecrets[`${channel.id}_${key}`] ? 'text' : 'password') : 'text'}
                        value={value}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => {
                          setChannels(prev => prev.map(c => 
                            c.id === channel.id 
                              ? { ...c, config: { ...c.config, [key]: e.target.value }}
                              : c
                          ))
                        }}
                      />
                      {(key.toLowerCase().includes('token') || key.toLowerCase().includes('key') || key.toLowerCase().includes('secret')) && (
                        <button
                          type="button"
                          onClick={() => toggleSecret(channel.id, key)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showSecrets[`${channel.id}_${key}`] ? 
                            <EyeOff className="w-4 h-4" /> : 
                            <Eye className="w-4 h-4" />
                          }
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={channel.automation_enabled}
                      onChange={(e) => {
                        setChannels(prev => prev.map(c => 
                          c.id === channel.id 
                            ? { ...c, automation_enabled: e.target.checked }
                            : c
                        ))
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Automazione Abilitata</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={channel.ai_enabled}
                      onChange={(e) => {
                        setChannels(prev => prev.map(c => 
                          c.id === channel.id 
                            ? { ...c, ai_enabled: e.target.checked }
                            : c
                        ))
                      }}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">AI Abilitata</span>
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-gray-400 hover:text-gray-600">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );

  const renderGeneralTab = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Impostazioni Generali</h2>
        <p className="text-gray-600 mt-1">Configurazioni base del sistema</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sistema */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sistema</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <select 
                value={globalSettings.general.timezone}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  general: { ...prev.general, timezone: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Europe/Rome">Europe/Rome (UTC+1)</option>
                <option value="Europe/London">Europe/London (UTC+0)</option>
                <option value="America/New_York">America/New_York (UTC-5)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lingua</label>
              <select 
                value={globalSettings.general.language}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  general: { ...prev.general, language: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="it">Italiano</option>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Formato Data</label>
              <select 
                value={globalSettings.general.dateFormat}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  general: { ...prev.general, dateFormat: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valuta</label>
              <select 
                value={globalSettings.general.currency}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  general: { ...prev.general, currency: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="EUR">Euro (€)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>
          </div>
        </div>
        {/* Orari Lavorativi */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Orari Lavorativi</h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={globalSettings.general.workingHours.enabled}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  general: { 
                    ...prev.general, 
                    workingHours: { ...prev.general.workingHours, enabled: e.target.checked }
                  }
                }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Abilita</span>
            </label>
          </div>
          {globalSettings.general.workingHours.enabled && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apertura</label>
                  <input
                    type="time"
                    value={globalSettings.general.workingHours.start}
                    onChange={(e) => setGlobalSettings(prev => ({
                      ...prev,
                      general: { 
                        ...prev.general, 
                        workingHours: { ...prev.general.workingHours, start: e.target.value }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chiusura</label>
                  <input
                    type="time"
                    value={globalSettings.general.workingHours.end}
                    onChange={(e) => setGlobalSettings(prev => ({
                      ...prev,
                      general: { 
                        ...prev.general, 
                        workingHours: { ...prev.general.workingHours, end: e.target.value }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giorni Lavorativi</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'].map((day, index) => {
                    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                    const dayKey = dayKeys[index]
                    return (
                      <label key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={globalSettings.general.workingHours.days.includes(dayKey)}
                          onChange={(e) => {
                            const newDays = e.target.checked
                              ? [...globalSettings.general.workingHours.days, dayKey]
                              : globalSettings.general.workingHours.days.filter(d => d !== dayKey)
                            setGlobalSettings(prev => ({
                              ...prev,
                              general: { 
                                ...prev.general, 
                                workingHours: { ...prev.general.workingHours, days: newDays }
                              }
                            }))
                          }}
                          className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-1 text-xs text-gray-700">{day.slice(0, 3)}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAITab = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configurazione AI</h2>
        <p className="text-gray-600 mt-1">Impostazioni per le AI Personas e automazioni</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Comportamento AI */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Comportamento AI</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Modalità Risposta</label>
              <select 
                value={globalSettings.ai.responseMode}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  ai: { ...prev.ai, responseMode: e.target.value as any }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="automatic">Automatica 24/7</option>
                <option value="working_hours">Solo in orari lavorativi</option>
                <option value="offline_only">Solo quando staff offline</option>
                <option value="supervised">Sempre con supervisione</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Livello Autonomia</label>
              <select 
                value={globalSettings.ai.autonomyLevel}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  ai: { ...prev.ai, autonomyLevel: e.target.value as any }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="full">Completa (può prenotare e vendere)</option>
                <option value="moderate">Moderata (può informare e assistere)</option>
                <option value="conservative">Conservativa (solo risposte base)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Personalità</label>
              <select 
                value={globalSettings.ai.personality}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  ai: { ...prev.ai, personality: e.target.value as any }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="professional">Professionale ed elegante</option>
                <option value="friendly">Amichevole e calorosa</option>
                <option value="energetic">Energica e motivante</option>
                <option value="relaxed">Rilassata e zen</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tempo Massimo Risposta (secondi)
              </label>
              <input
                type="number"
                value={globalSettings.ai.maxResponseTime}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  ai: { ...prev.ai, maxResponseTime: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="30"
                max="600"
              />
            </div>
          </div>
        </div>
        {/* Regole Escalation */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Escalation a Umano</h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={globalSettings.ai.escalationRules.enabled}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  ai: { 
                    ...prev.ai, 
                    escalationRules: { ...prev.ai.escalationRules, enabled: e.target.checked }
                  }
                }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Abilita</span>
            </label>
          </div>
          {globalSettings.ai.escalationRules.enabled && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parole Chiave Trigger
                </label>
                <textarea
                  value={globalSettings.ai.escalationRules.keywords.join(', ')}
                  onChange={(e) => setGlobalSettings(prev => ({
                    ...prev,
                    ai: { 
                      ...prev.ai, 
                      escalationRules: { 
                        ...prev.ai.escalationRules, 
                        keywords: e.target.value.split(', ').filter(k => k.trim())
                      }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="problema, aiuto, manager, reclamo"
                />
                <p className="text-xs text-gray-500 mt-1">Separa le parole con virgole</p>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={globalSettings.ai.escalationRules.humanHandoff}
                  onChange={(e) => setGlobalSettings(prev => ({
                    ...prev,
                    ai: { 
                      ...prev.ai, 
                      escalationRules: { ...prev.ai.escalationRules, humanHandoff: e.target.checked }
                    }
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Trasferimento automatico a operatore umano
                </span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMessagingTab = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Impostazioni Messaggistica</h2>
        <p className="text-gray-600 mt-1">Controlli per invio messaggi e automazioni</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Limiti e Controlli */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Limiti e Controlli</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Limite Messaggi Giornalieri
              </label>
              <input
                type="number"
                value={globalSettings.messaging.dailyLimit}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  messaging: { ...prev.messaging, dailyLimit: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="100"
                max="10000"
              />
              <p className="text-xs text-gray-500 mt-1">Numero massimo di messaggi per giorno</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intervallo tra Messaggi (secondi)
              </label>
              <input
                type="number"
                value={globalSettings.messaging.messageInterval}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  messaging: { ...prev.messaging, messageInterval: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="30"
                max="3600"
              />
              <p className="text-xs text-gray-500 mt-1">Pausa minima tra invii per evitare spam</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tentativi Reinvio
              </label>
              <select 
                value={globalSettings.messaging.retryAttempts}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  messaging: { ...prev.messaging, retryAttempts: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">1 tentativo</option>
                <option value="2">2 tentativi</option>
                <option value="3">3 tentativi</option>
                <option value="5">5 tentativi</option>
              </select>
            </div>
          </div>
        </div>
        {/* Report e Tracking */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Report e Tracking</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Report Consegna</span>
                <p className="text-xs text-gray-500">Ricevi notifiche quando i messaggi vengono consegnati</p>
              </div>
              <input
                type="checkbox"
                checked={globalSettings.messaging.enableDeliveryReports}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  messaging: { ...prev.messaging, enableDeliveryReports: e.target.checked }
                }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Conferme di Lettura</span>
                <p className="text-xs text-gray-500">Traccia quando i messaggi vengono letti</p>
              </div>
              <input
                type="checkbox"
                checked={globalSettings.messaging.enableReadReceipts}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  messaging: { ...prev.messaging, enableReadReceipts: e.target.checked }
                }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAutomationTab = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Automazioni Avanzate</h2>
        <p className="text-gray-600 mt-1">Configurazioni per workflow e automazioni intelligenti</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Funzionalità Automazione */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Funzionalità</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Workflows Automatici</span>
                <p className="text-xs text-gray-500">Sequenze automatiche di messaggi basate su trigger</p>
              </div>
              <input
                type="checkbox"
                checked={globalSettings.automation.enableWorkflows}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  automation: { ...prev.automation, enableWorkflows: e.target.checked }
                }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Schedulazione Intelligente</span>
                <p className="text-xs text-gray-500">Orari ottimali basati su AI per massimizzare aperture</p>
              </div>
              <input
                type="checkbox"
                checked={globalSettings.automation.enableSmartScheduling}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  automation: { ...prev.automation, enableSmartScheduling: e.target.checked }
                }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">A/B Testing</span>
                <p className="text-xs text-gray-500">Test automatici di varianti messaggi per ottimizzare performance</p>
              </div>
              <input
                type="checkbox"
                checked={globalSettings.automation.enableA_BTesting}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  automation: { ...prev.automation, enableA_BTesting: e.target.checked }
                }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Segmentazione Automatica</span>
                <p className="text-xs text-gray-500">Creazione automatica di segmenti clienti basata su comportamento</p>
              </div>
              <input
                type="checkbox"
                checked={globalSettings.automation.enableSegmentation}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  automation: { ...prev.automation, enableSegmentation: e.target.checked }
                }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>
          </div>
        </div>
        {/* Triggers Disponibili */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Triggers Disponibili</h3>
          <div className="space-y-3">
            {[
              { name: 'Nuovo Cliente', description: 'Quando un cliente si registra' },
              { name: 'Prenotazione Confermata', description: 'Quando una prenotazione viene confermata' },
              { name: 'Post Trattamento', description: '24h dopo un trattamento' },
              { name: 'Cliente Inattivo', description: 'Dopo 30 giorni di inattività' },
              { name: 'Compleanno', description: 'Nel giorno del compleanno' },
              { name: 'Carrello Abbandonato', description: 'Prenotazione iniziata ma non completata' },
              { name: 'Review Request', description: '48h dopo un trattamento' },
              { name: 'Win-back', description: 'Dopo 90 giorni di inattività' }
            ].map((trigger, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{trigger.name}</p>
                  <p className="text-xs text-gray-500">{trigger.description}</p>
                </div>
                <Zap className="w-4 h-4 text-blue-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Notifiche Sistema</h2>
        <p className="text-gray-600 mt-1">Configura come ricevere aggiornamenti e alert</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Canali Notifica */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Canali di Notifica</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-blue-500 mr-3" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Email</span>
                  <p className="text-xs text-gray-500">Notifiche via email</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={globalSettings.notifications.email}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, email: e.target.checked }
                }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <div className="flex items-center">
                <Smartphone className="w-5 h-5 text-green-500 mr-3" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Push Notifications</span>
                  <p className="text-xs text-gray-500">Notifiche push sul browser</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={globalSettings.notifications.push}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, push: e.target.checked }
                }))}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-purple-500 mr-3" />
                <div>
                  <span className="text-sm font-medium text-gray-700">SMS</span>
                  <p className="text-xs text-gray-500">Notifiche critiche via SMS</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={globalSettings.notifications.sms}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, sms: e.target.checked }
                }))}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
            </label>
          </div>
        </div>
        {/* Webhook */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Webhook</h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={globalSettings.notifications.webhook}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, webhook: e.target.checked }
                }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Abilita</span>
            </label>
          </div>
          {globalSettings.notifications.webhook && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Webhook
                </label>
                <input
                  type="url"
                  value={globalSettings.notifications.webhookUrl}
                  onChange={(e) => setGlobalSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, webhookUrl: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://your-app.com/webhook"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Riceverai POST requests con eventi del sistema
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Eventi Webhook</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Campagna avviata/completata</li>
                  <li>• Messaggio inviato/fallito</li>
                  <li>• Conversione completata</li>
                  <li>• Errore sistema</li>
                  <li>• Limite giornaliero raggiunto</li>
                </ul>
              </div>
              <button className="w-full px-4 py-2 text-sm border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50">
                Test Webhook
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Avvisi Avanzati */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurazione Avvisi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Soglie di Allerta</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tasso Fallimento Messaggi (%)
              </label>
              <input
                type="number"
                defaultValue="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
                max="50"
              />
              <p className="text-xs text-gray-500 mt-1">Avvisa se supera questa soglia</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Limite Giornaliero Raggiunto (%)
              </label>
              <input
                type="number"
                defaultValue="80"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="50"
                max="100"
              />
              <p className="text-xs text-gray-500 mt-1">Avvisa quando viene raggiunta questa percentuale</p>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Frequenza Notifiche</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Performance
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="daily">Giornaliero</option>
                <option value="weekly">Settimanale</option>
                <option value="monthly">Mensile</option>
                <option value="never">Mai</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Riassunto Campagne
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="immediate">Immediato</option>
                <option value="daily">Fine giornata</option>
                <option value="weekly">Fine settimana</option>
                <option value="never">Mai</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // --- JSX ---
  const tabs = [
    { id: 'channels', label: 'Canali', icon: Globe },
    { id: 'general', label: 'Generale', icon: Settings },
    { id: 'ai', label: 'AI', icon: Bot },
    { id: 'messaging', label: 'Messaging', icon: MessageCircle },
    { id: 'automation', label: 'Automazione', icon: Zap },
    { id: 'notifications', label: 'Notifiche', icon: Bell }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configurazioni Omni Presence</h1>
              <p className="text-gray-600 mt-1">Gestisci tutte le impostazioni del sistema</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Salvando...' : 'Salva Modifiche'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-4 text-sm font-medium transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'channels' && renderChannelsTab()}
        {activeTab === 'general' && renderGeneralTab()}
        {activeTab === 'ai' && renderAITab()}
        {activeTab === 'messaging' && renderMessagingTab()}
        {activeTab === 'automation' && renderAutomationTab()}
        {activeTab === 'notifications' && renderNotificationsTab()}
      </div>

      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              <span className="text-sm text-gray-600">Sistema Online</span>
            </div>
            <div className="text-sm text-gray-500">
              Ultimo salvataggio: {now}
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Versione 2.1.0</span>
            <button className="hover:text-gray-700 transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OmniSettingsPage; 