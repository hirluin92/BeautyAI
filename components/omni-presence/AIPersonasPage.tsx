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
  Bot, 
  MessageSquare, 
  Settings, 
  Edit, 
  Trash2,
  Brain,
  User,
  Zap
} from 'lucide-react'

interface AIPersona {
  id: string
  name: string
  type: 'assistant' | 'salesperson' | 'support' | 'expert'
  personality: string
  expertise: string[]
  channels: string[]
  status: 'active' | 'inactive'
  interactions_count: number
  satisfaction_score: number
  created_at: string
}

export default function AIPersonasPage() {
  const [aiPersonas, setAiPersonas] = useState<AIPersona[]>([
    {
      id: '1',
      name: 'Beauty Assistant',
      type: 'assistant',
      personality: 'Amichevole, professionale e sempre pronta ad aiutare. Usa un tono caloroso e rassicurante.',
      expertise: ['trattamenti viso', 'prenotazioni', 'consigli beauty'],
      channels: ['whatsapp', 'email'],
      status: 'active',
      interactions_count: 1247,
      satisfaction_score: 94,
      created_at: '2024-01-10'
    },
    {
      id: '2',
      name: 'Sales Expert',
      type: 'salesperson',
      personality: 'Persuasivo, informativo e orientato ai risultati. Sa presentare le offerte in modo accattivante.',
      expertise: ['vendite', 'promozioni', 'pacchetti servizi'],
      channels: ['whatsapp', 'email', 'instagram'],
      status: 'active',
      interactions_count: 892,
      satisfaction_score: 87,
      created_at: '2024-01-05'
    },
    {
      id: '3',
      name: 'Support Specialist',
      type: 'support',
      personality: 'Paziente, tecnico e risolutivo. Si concentra sulla risoluzione rapida dei problemi.',
      expertise: ['supporto tecnico', 'risoluzione problemi', 'FAQ'],
      channels: ['whatsapp', 'email', 'sms'],
      status: 'inactive',
      interactions_count: 234,
      satisfaction_score: 91,
      created_at: '2024-01-15'
    }
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'assistant': return <Bot className="h-4 w-4" />
      case 'salesperson': return <User className="h-4 w-4" />
      case 'support': return <MessageSquare className="h-4 w-4" />
      case 'expert': return <Brain className="h-4 w-4" />
      default: return <Bot className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'assistant': return 'bg-blue-100 text-blue-800'
      case 'salesperson': return 'bg-green-100 text-green-800'
      case 'support': return 'bg-purple-100 text-purple-800'
      case 'expert': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  const getSatisfactionColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Personas</h1>
          <p className="text-gray-600">Gestisci le tue AI per l'automazione delle conversazioni</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuova AI Persona
        </Button>
      </div>

      {/* AI Personas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aiPersonas.map((persona) => (
          <Card key={persona.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(persona.type)}
                  <CardTitle className="text-lg">{persona.name}</CardTitle>
                </div>
                <Badge className={getStatusColor(persona.status)}>
                  {persona.status}
                </Badge>
              </div>
              <div className="mt-2">
                <Badge className={getTypeColor(persona.type)}>
                  {persona.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-1">Personalità</h4>
                <p className="text-sm text-gray-600 line-clamp-2">{persona.personality}</p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Competenze</h4>
                <div className="flex flex-wrap gap-1">
                  {persona.expertise.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Canali</h4>
                <div className="flex flex-wrap gap-1">
                  {persona.channels.map((channel) => (
                    <Badge key={channel} variant="secondary" className="text-xs">
                      {channel}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <div className="text-sm text-gray-500">Interazioni</div>
                  <div className="font-medium">{persona.interactions_count.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Soddisfazione</div>
                  <div className={`font-medium ${getSatisfactionColor(persona.satisfaction_score)}`}>
                    {persona.satisfaction_score}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-gray-500">
                  Creata il {new Date(persona.created_at).toLocaleDateString('it-IT')}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
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

      {/* Create AI Persona Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Nuova AI Persona</CardTitle>
              <CardDescription>Crea una nuova AI per l'automazione</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nome AI Persona</Label>
                <Input id="name" placeholder="Es. Beauty Assistant" />
              </div>
              
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assistant">Assistant</SelectItem>
                    <SelectItem value="salesperson">Salesperson</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="personality">Personalità</Label>
                <Textarea 
                  id="personality" 
                  placeholder="Descrivi la personalità dell'AI..." 
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="expertise">Competenze</Label>
                <Input id="expertise" placeholder="Es. trattamenti viso, prenotazioni, consigli beauty" />
                <p className="text-xs text-gray-500 mt-1">Separate da virgole</p>
              </div>

              <div>
                <Label htmlFor="channels">Canali</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['whatsapp', 'email', 'sms', 'instagram', 'facebook', 'website'].map((channel) => (
                    <label key={channel} className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm capitalize">{channel}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Annulla
                </Button>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Zap className="h-4 w-4 mr-2" />
                  Crea AI Persona
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 