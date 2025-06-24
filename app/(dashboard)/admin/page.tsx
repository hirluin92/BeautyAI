import { requireAdminAuth } from '@/lib/supabase/requireAuth'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Activity, 
  Users, 
  Settings, 
  Database, 
  BarChart3,
  CheckCircle,
  Key,
  Eye
} from 'lucide-react'
import { Database as DatabaseType } from '@/types/database'

type User = DatabaseType['public']['Tables']['users']['Row']

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalOrganizations: number
  systemHealth: 'healthy' | 'warning' | 'critical'
  lastBackup: string
  uptime: string
  apiRequests: number
  errorRate: number
}

export default async function AdminPanelPage() {
  const { userData, supabase } = await requireAdminAuth()

  // Carica statistiche utenti e organizzazioni
  const [usersResponse, orgsResponse] = await Promise.all([
    supabase.from('users').select('id, is_active'),
    supabase.from('organizations').select('id')
  ])

  const stats: AdminStats = {
    totalUsers: 0,
    activeUsers: 0,
    totalOrganizations: 0,
    systemHealth: 'healthy',
    lastBackup: '2024-01-15',
    uptime: '99.9%',
    apiRequests: 0,
    errorRate: 0
  }

  if (usersResponse.data && orgsResponse.data) {
    stats.totalUsers = usersResponse.data.length
    stats.activeUsers = usersResponse.data.filter((user: User) => user.is_active).length
    stats.totalOrganizations = orgsResponse.data.length
  }

  const adminModules = [
    {
      title: 'Rate Limiting',
      description: 'Monitora e gestisci le limitazioni di richieste API',
      icon: Shield,
      href: '/admin/rate-limit',
      status: 'active',
      color: 'blue'
    },
    {
      title: 'Gestione Utenti',
      description: 'Amministra utenti, ruoli e permessi',
      icon: Users,
      href: '/admin/users',
      status: 'active',
      color: 'green'
    },
    {
      title: 'Monitoraggio Sistema',
      description: 'Metriche di performance e salute del sistema',
      icon: Activity,
      href: '/admin/monitoring',
      status: 'coming-soon',
      color: 'purple'
    },
    {
      title: 'Backup & Restore',
      description: 'Gestisci backup automatici e manuali',
      icon: Database,
      href: '/admin/backup',
      status: 'coming-soon',
      color: 'orange'
    },
    {
      title: 'Logs & Audit',
      description: 'Visualizza log di sistema e audit trail',
      icon: Eye,
      href: '/admin/logs',
      status: 'coming-soon',
      color: 'gray'
    },
    {
      title: 'Configurazione Avanzata',
      description: 'Impostazioni di sistema e configurazioni',
      icon: Settings,
      href: '/admin/config',
      status: 'coming-soon',
      color: 'indigo'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'coming-soon': return 'bg-yellow-100 text-yellow-800'
      case 'maintenance': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">
            Gestione sistema e monitoraggio sicurezza
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          {userData.role === 'owner' ? 'Proprietario' : 'Amministratore'}
        </Badge>
      </div>

      {/* System Health */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utenti Totali</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} attivi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizzazioni</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrganizations}</div>
            <p className="text-xs text-muted-foreground">
              Centri registrati
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uptime}</div>
            <p className="text-xs text-muted-foreground">
              Ultimo backup: {stats.lastBackup}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stato Sistema</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Operativo</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Tutti i servizi attivi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/users">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-blue-600" />
                <span className="font-medium">Gestione Utenti</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/rate-limit">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-6 w-6 text-orange-600" />
                <span className="font-medium">Rate Limiting</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/settings">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Settings className="h-6 w-6 text-purple-600" />
                <span className="font-medium">Configurazioni</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Moduli Amministrativi */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminModules.map((module) => {
          const IconComponent = module.icon
          return (
            <Card key={module.title} className="cursor-pointer hover:shadow-md transition-shadow">
              <Link href={module.href}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <IconComponent className={`h-8 w-8 text-${module.color}-600`} />
                    <Badge className={getStatusColor(module.status)}>
                      {module.status === 'active' ? 'Attivo' : 
                       module.status === 'coming-soon' ? 'Prossimamente' : 
                       module.status === 'maintenance' ? 'Manutenzione' : module.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {module.description}
                  </p>
                </CardContent>
              </Link>
            </Card>
          )
        })}
      </div>

      {/* Accesso & Permessi */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Accesso & Permessi</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Ruolo corrente:</span>
              <Badge variant="outline">Administrator</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Permessi:</span>
              <span className="text-sm font-medium">Completi</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Sessione attiva:</span>
              <span className="text-sm font-medium">2 ore fa</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 