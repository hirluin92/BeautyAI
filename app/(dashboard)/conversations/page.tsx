import { requireAuth } from '@/lib/supabase/requireAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MessageSquare, 
  Phone, 
  Clock, 
  User, 
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react'

interface Conversation {
  id: string
  session_id: string
  from_number: string
  last_message: string
  last_activity: string
  message_count: number
  created_at: string
  updated_at: string
}

interface ConversationStats {
  totalConversations: number
  activeToday: number
  averageMessages: number
  topContacts: Array<{
    phone: string
    messageCount: number
  }>
}

export default async function ConversationsPage() {
  const { userData, supabase } = await requireAuth()

  // Fetch conversations data
  const { data: conversations, error } = await supabase
    .from('conversation_contexts')
    .select('*')
    .eq('organization_id', userData.organization_id)
    .order('last_activity', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching conversations:', error)
    throw new Error('Errore nel caricamento delle conversazioni')
  }

  const conversationsList = conversations || []

  // Calculate stats
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const stats: ConversationStats = {
    totalConversations: conversationsList.length,
    activeToday: conversationsList.filter((conv: Conversation) => 
      new Date(conv.last_activity) >= today
    ).length,
    averageMessages: conversationsList.length > 0 
      ? Math.round(conversationsList.reduce((sum: number, conv: Conversation) => sum + conv.message_count, 0) / conversationsList.length)
      : 0,
    topContacts: []
  }

  // Calculate top contacts
  const contactMap = new Map<string, number>()
  conversationsList.forEach((conv: Conversation) => {
    const count = contactMap.get(conv.from_number) || 0
    contactMap.set(conv.from_number, count + conv.message_count)
  })

  stats.topContacts = Array.from(contactMap.entries())
    .map(([phone, count]) => ({ phone, messageCount: count }))
    .sort((a, b) => b.messageCount - a.messageCount)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conversazioni WhatsApp</h1>
          <p className="text-muted-foreground">
            Monitora e gestisci le conversazioni con i tuoi clienti
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Aggiorna
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtri
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversazioni Totali</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversations}</div>
            <p className="text-xs text-muted-foreground">
              Sessioni attive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attive Oggi</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeToday}</div>
            <p className="text-xs text-muted-foreground">
              Conversazioni recenti
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Media Messaggi</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageMessages}</div>
            <p className="text-xs text-muted-foreground">
              Per conversazione
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contatti Attivi</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactMap.size}</div>
            <p className="text-xs text-muted-foreground">
              Numeri unici
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>Contatti Più Attivi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topContacts.map((contact, index) => (
              <div key={contact.phone} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Phone className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{contact.phone}</p>
                    <p className="text-sm text-gray-500">
                      {contact.messageCount} messaggi
                    </p>
                  </div>
                </div>
                <Badge variant={index < 3 ? "default" : "secondary"}>
                  #{index + 1}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Conversations */}
      <Card>
        <CardHeader>
          <CardTitle>Conversazioni Recenti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conversationsList.slice(0, 10).map((conversation: Conversation) => (
              <div key={conversation.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{conversation.from_number}</p>
                    <p className="text-sm text-gray-500">
                      {conversation.last_message?.substring(0, 50)}...
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {new Date(conversation.last_activity).toLocaleDateString('it-IT')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {conversation.message_count} messaggi
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 