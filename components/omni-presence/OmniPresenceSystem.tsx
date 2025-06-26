"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Settings, 
  Plus,
  Smartphone,
  Mail,
  MessageCircle,
  Globe,
  Instagram,
  Facebook,
  Search
} from 'lucide-react'

interface Channel {
  id: string
  name: string
  type: string
  sent: number
  status: string
}

interface Campaign {
  id: string
  name: string
  type: string
  channels: string[]
  sent: number
  conversions: number
  status: string
}

interface AIPersona {
  id: string
  name: string
  type: string
  personality: string
  expertise: string[]
}

interface Activity {
  id: string
  type: string
  client?: string
  campaign?: string
  persona?: string
  channel?: string
  time: string
  status: string
}

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
  channels: Channel[]
  campaigns: Campaign[]
  aiPersonas: AIPersona[]
  recentActivity: Activity[]
}

export default function OmniPresenceSystem() {
  const [data, setData] = useState<OmniPresenceData | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock data for demonstration
  useEffect(() => {
    const mockData: OmniPresenceData = {
      overview: {
        channels: 6,
        activeChannels: 4,
        activeCampaigns: 3,
        aiPersonas: 2,
        totalStats: {
          sent: 1247,
          delivered: 1189,
          opened: 892,
          clicked: 234,
          conversions: 67
        },
        totalRevenue: 12470,
        aiSatisfaction: 94
      },
      channels: [
        { id: "1", name: 'WhatsApp Business', type: 'whatsapp', status: 'active', sent: 456 },
        { id: "2", name: 'Email Marketing', type: 'email', status: 'active', sent: 234 },
        { id: "3", name: 'SMS Promozionali', type: 'sms', status: 'active', sent: 189 },
        { id: "4", name: 'Instagram DM', type: 'instagram', status: 'active', sent: 123 },
        { id: "5", name: 'Facebook Messenger', type: 'facebook', status: 'inactive', sent: 0 },
        { id: "6", name: 'Google Business', type: 'google', status: 'inactive', sent: 0 }
      ],
      campaigns: [
        { id: "1", name: 'Benvenuto Nuovi Clienti', type: 'welcome', status: 'active', channels: ['whatsapp', 'email'], sent: 234, conversions: 45 },
        { id: "2", name: 'Promozione Estate 2024', type: 'promotional', status: 'active', channels: ['whatsapp', 'email', 'instagram'], sent: 567, conversions: 89 },
        { id: "3", name: 'Promemoria Appuntamenti', type: 'reminder', status: 'active', channels: ['whatsapp', 'sms'], sent: 446, conversions: 123 }
      ],
      aiPersonas: [
        { id: "1", name: 'Beauty Assistant', type: 'assistant', personality: 'Amichevole e professionale', expertise: ['trattamenti viso', 'prenotazioni'] },
        { id: "2", name: 'Sales Expert', type: 'salesperson', personality: 'Persuasivo e informativo', expertise: ['vendite', 'promozioni'] }
      ],
      recentActivity: [
        { id: "1", type: 'message_sent', channel: 'whatsapp', client: 'Maria Rossi', time: '2 min fa', status: 'delivered' },
        { id: "2", type: 'campaign_started', campaign: 'Promozione Estate 2024', time: '1 ora fa', status: 'active' },
        { id: "3", type: 'ai_interaction', persona: 'Beauty Assistant', client: 'Giulia Bianchi', time: '3 ore fa', status: 'completed' }
      ]
    }

    setTimeout(() => {
      setData(mockData)
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'whatsapp': return <MessageCircle className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'sms': return <Smartphone className="h-4 w-4" />
      case 'instagram': return <Instagram className="h-4 w-4" />
      case 'facebook': return <Facebook className="h-4 w-4" />
      case 'google': return <Globe className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Omni Presence</h1>
          <p className="text-gray-600">Gestisci la tua presenza multi-canale con AI</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuova Campagna
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Canali Attivi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{data.overview.activeChannels}</div>
            <p className="text-xs text-blue-600">di {data.overview.channels} totali</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Messaggi Inviati</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{data.overview.totalStats.sent.toLocaleString()}</div>
            <p className="text-xs text-green-600">+12% vs mese scorso</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Conversioni</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{data.overview.totalStats.conversions}</div>
            <p className="text-xs text-purple-600">Tasso: {((data.overview.totalStats.conversions / data.overview.totalStats.sent) * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-pink-700">Revenue Generato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-900">€{data.overview.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-pink-600">+8% vs mese scorso</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campagne</TabsTrigger>
          <TabsTrigger value="channels">Canali</TabsTrigger>
          <TabsTrigger value="ai">AI Personas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Attività Recenti</CardTitle>
                <CardDescription>Ultime interazioni e messaggi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {activity.type === 'message_sent' && `Messaggio inviato a ${activity.client}`}
                          {activity.type === 'campaign_started' && `Campagna "${activity.campaign}" avviata`}
                          {activity.type === 'ai_interaction' && `AI ${activity.persona} ha interagito con ${activity.client}`}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Metriche Performance</CardTitle>
                <CardDescription>Statistiche dettagliate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Messaggi Inviati</span>
                    <span className="font-medium">{data.overview.totalStats.sent}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Consegnati</span>
                    <span className="font-medium">{data.overview.totalStats.delivered}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Aperti</span>
                    <span className="font-medium">{data.overview.totalStats.opened}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Click</span>
                    <span className="font-medium">{data.overview.totalStats.clicked}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Conversioni</span>
                    <span className="font-medium">{data.overview.totalStats.conversions}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campagne Attive</CardTitle>
              <CardDescription>Gestisci le tue campagne marketing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.campaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{campaign.name}</h3>
                      <p className="text-sm text-gray-500">Tipo: {campaign.type}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        {campaign.channels.map((channel) => (
                          <Badge key={channel} variant="outline" className="text-xs">
                            {getChannelIcon(channel)}
                            <span className="ml-1">{channel}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{campaign.sent} inviati</div>
                      <div className="text-sm text-gray-500">{campaign.conversions} conversioni</div>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Canali Configurati</CardTitle>
              <CardDescription>Gestisci i tuoi canali di comunicazione</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.channels.map((channel) => (
                  <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getChannelIcon(channel.type)}
                      <div>
                        <h3 className="font-medium">{channel.name}</h3>
                        <p className="text-sm text-gray-500">{channel.sent} messaggi inviati</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(channel.status)}>
                      {channel.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Personas</CardTitle>
              <CardDescription>Gestisci le tue AI per l'automazione</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.aiPersonas.map((persona) => (
                  <div key={persona.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{persona.name}</h3>
                      <Badge variant="outline">{persona.type}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{persona.personality}</p>
                    <div className="flex flex-wrap gap-1">
                      {persona.expertise.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 