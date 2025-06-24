'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  Shield, 
  Clock, 
  AlertTriangle,
  TrendingDown,
  Settings,
  Trash2
} from 'lucide-react'

interface RateLimitStats {
  totalRequests: number
  totalViolations: number
  violationRate: number
  logs: Array<{
    id: string
    identifier: string
    service_name: string
    endpoint: string
    method: string
    status_code: number
    created_at: string
  }>
  violations: Array<{
    id: string
    identifier: string
    service_name: string
    endpoint: string
    violation_type: string
    request_count: number
    created_at: string
  }>
}

interface StorageStats {
  logsDeleted: number
  violationsDeleted: number
  storageSaved: string
}

interface RateLimitClientProps {
  stats: RateLimitStats
}

export default function RateLimitClient({ stats }: RateLimitClientProps) {
  const [cleanupResult, setCleanupResult] = useState<StorageStats | null>(null)
  const [isCleaning, setIsCleaning] = useState(false)

  const runCleanup = async () => {
    setIsCleaning(true)
    try {
      const response = await fetch('/api/admin/rate-limit/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daysToKeep: 7 })
      })
      
      if (response.ok) {
        const data = await response.json()
        setCleanupResult(data.storageStats)
        // In a real app, you might want to refetch the stats here
      }
    } catch {
      console.error('Cleanup failed')
    } finally {
      setIsCleaning(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rate Limiting Dashboard</h1>
          <p className="text-muted-foreground">
            Monitoraggio e gestione del sistema di rate limiting
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Admin Panel</span>
        </div>
      </div>

      {/* Statistiche Generali */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Richieste Totali</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              Ultimi 7 giorni
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violazioni</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViolations}</div>
            <p className="text-xs text-muted-foreground">
              {(stats.violationRate * 100).toFixed(2)}% del totale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasso Violazioni</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.violationRate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Percentuale violazioni
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cleanupResult?.storageSaved || '0 MB'}
            </div>
            <p className="text-xs text-muted-foreground">
              Spazio liberato
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs per Dettagli */}
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Log Richieste</TabsTrigger>
          <TabsTrigger value="violations">Violazioni</TabsTrigger>
          <TabsTrigger value="cleanup">Cleanup</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ultime Richieste</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.logs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{log.service_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {log.endpoint} - {log.method}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={log.status_code === 429 ? "destructive" : "default"}>
                        {log.status_code}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('it-IT')}
                      </span>
                    </div>
                  </div>
                ))}
                {stats.logs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nessun log disponibile
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Violazioni Rate Limit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.violations.slice(0, 10).map((violation) => (
                  <div key={violation.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{violation.service_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {violation.endpoint} - {violation.violation_type}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="destructive">
                        {violation.request_count} richieste
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(violation.created_at).toLocaleString('it-IT')}
                      </span>
                    </div>
                  </div>
                ))}
                {stats.violations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nessuna violazione registrata
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cleanup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pulizia Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Attenzione</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        La pulizia eliminerà tutti i log e le violazioni più vecchi di 7 giorni. 
                        Questa azione non può essere annullata.
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={runCleanup}
                  disabled={isCleaning}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  {isCleaning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Pulizia in corso...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Esegui Pulizia
                    </>
                  )}
                </Button>

                {cleanupResult && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Pulizia completata</p>
                        <p className="text-sm text-green-700 mt-1">
                          Eliminati {cleanupResult.logsDeleted} log e {cleanupResult.violationsDeleted} violazioni. 
                          Spazio liberato: {cleanupResult.storageSaved}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 