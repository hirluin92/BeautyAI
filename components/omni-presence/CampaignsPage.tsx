"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Play, 
  Pause,
  MessageSquare,
  Mail,
  Smartphone,
  Instagram,
  Facebook,
  Globe
} from 'lucide-react'

interface Campaign {
  id: string
  name: string
  type: 'promotional' | 'reminder' | 'welcome' | 'retention' | 'reactivation'
  channels: string[]
  status: 'draft' | 'active' | 'paused' | 'completed'
  audience_total: number
  sent_count: number
  conversion_count: number
  created_at: string
  schedule_type: 'immediate' | 'scheduled' | 'recurring'
  schedule_date?: string
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Benvenuto Nuovi Clienti',
      type: 'welcome',
      channels: ['whatsapp', 'email'],
      status: 'active',
      audience_total: 150,
      sent_count: 120,
      conversion_count: 45,
      created_at: '2024-01-15',
      schedule_type: 'immediate'
    },
    {
      id: '2',
      name: 'Promozione Estate 2024',
      type: 'promotional',
      channels: ['whatsapp', 'email', 'instagram'],
      status: 'active',
      audience_total: 300,
      sent_count: 280,
      conversion_count: 89,
      created_at: '2024-01-10',
      schedule_type: 'scheduled',
      schedule_date: '2024-06-01'
    },
    {
      id: '3',
      name: 'Promemoria Appuntamenti',
      type: 'reminder',
      channels: ['whatsapp', 'sms'],
      status: 'active',
      audience_total: 200,
      sent_count: 180,
      conversion_count: 123,
      created_at: '2024-01-05',
      schedule_type: 'recurring'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />
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
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'promotional': return 'bg-purple-100 text-purple-800'
      case 'reminder': return 'bg-blue-100 text-blue-800'
      case 'welcome': return 'bg-green-100 text-green-800'
      case 'retention': return 'bg-orange-100 text-orange-800'
      case 'reactivation': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT')
  }

  const getConversionRate = (sent: number, conversions: number) => {
    return sent > 0 ? ((conversions / sent) * 100).toFixed(1) : '0'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campagne</h1>
          <p className="text-gray-600">Gestisci le tue campagne marketing multi-canale</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuova Campagna
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cerca campagne..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtra per status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli status</SelectItem>
                  <SelectItem value="active">Attive</SelectItem>
                  <SelectItem value="draft">Bozze</SelectItem>
                  <SelectItem value="paused">In pausa</SelectItem>
                  <SelectItem value="completed">Completate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <div className="space-y-4">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{campaign.name}</h3>
                    <Badge className={getTypeColor(campaign.type)}>
                      {campaign.type}
                    </Badge>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    {campaign.channels.map((channel) => (
                      <Badge key={channel} variant="outline" className="text-xs">
                        {getChannelIcon(channel)}
                        <span className="ml-1">{channel}</span>
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Audience:</span>
                      <span className="ml-1 font-medium">{campaign.audience_total}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Inviati:</span>
                      <span className="ml-1 font-medium">{campaign.sent_count}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Conversioni:</span>
                      <span className="ml-1 font-medium">{campaign.conversion_count}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Tasso:</span>
                      <span className="ml-1 font-medium">{getConversionRate(campaign.sent_count, campaign.conversion_count)}%</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mt-2">
                    Creata il {formatDate(campaign.created_at)}
                    {campaign.schedule_type === 'scheduled' && campaign.schedule_date && (
                      <span className="ml-4">Programmata per {formatDate(campaign.schedule_date)}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {campaign.status === 'active' && (
                    <Button variant="outline" size="sm">
                      <Pause className="h-4 w-4" />
                    </Button>
                  )}
                  {campaign.status === 'paused' && (
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Nuova Campagna</CardTitle>
              <CardDescription>Crea una nuova campagna marketing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Campagna</Label>
                <Input id="name" placeholder="Es. Benvenuto Nuovi Clienti" />
              </div>
              
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Benvenuto</SelectItem>
                    <SelectItem value="promotional">Promozionale</SelectItem>
                    <SelectItem value="reminder">Promemoria</SelectItem>
                    <SelectItem value="retention">Fidelizzazione</SelectItem>
                    <SelectItem value="reactivation">Riattivazione</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="channels">Canali</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['whatsapp', 'email', 'sms', 'instagram', 'facebook', 'google'].map((channel) => (
                    <label key={channel} className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm capitalize">{channel}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="schedule">Programmazione</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona programmazione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediata</SelectItem>
                    <SelectItem value="scheduled">Programmata</SelectItem>
                    <SelectItem value="recurring">Ricorrente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content">Contenuto</Label>
                <Textarea id="content" placeholder="Inserisci il contenuto del messaggio..." rows={4} />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Annulla
                </Button>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Crea Campagna
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 