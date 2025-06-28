'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  DollarSign, 
  Calendar, 
  Users, 
  CreditCard,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileText,
  Download,
  RefreshCw,
  PieChart,
  BarChart3
} from 'lucide-react'

interface DailyStats {
  date: string
  totalRevenue: number
  totalBookings: number
  averageTicket: number
  paymentMethods: {
    cash: { count: number; amount: number }
    card: { count: number; amount: number }
    transfer: { count: number; amount: number }
    mixed?: { count: number; amount: number }
  }
  fiscalDocuments: {
    receipt: { count: number; amount: number }
    invoice: { count: number; amount: number }
    none: { count: number; amount: number }
  }
  taxes: {
    vatToReserve: number
    irpefToReserve: number
    inpsToReserve: number
    netEffective: number
  }
  warnings: string[]
}

interface StaffPerformance {
  staffId: string
  staffName: string
  totalRevenue: number
  totalBookings: number
  averageTicket: number
  topServices: Array<{
    serviceName: string
    revenue: number
    count: number
  }>
}

export default function FinancialDashboard() {
  const [stats, setStats] = useState<DailyStats | null>(null)
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadFinancialData()
  }, [selectedDate, selectedPeriod])

  const loadFinancialData = async () => {
    setLoading(true)
    try {
      // Load daily stats
      const statsResponse = await fetch(`/api/financial/stats?date=${selectedDate}&period=${selectedPeriod}`)
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Load staff performance
      const staffResponse = await fetch(`/api/financial/staff-performance?date=${selectedDate}&period=${selectedPeriod}`)
      if (staffResponse.ok) {
        const staffData = await staffResponse.json()
        setStaffPerformance(staffData.performance || [])
      }
    } catch (error) {
      console.error('Errore caricamento dati finanziari:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadFinancialData()
    setRefreshing(false)
  }

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/financial/export?date=${selectedDate}&period=${selectedPeriod}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `financial-report-${selectedDate}-${selectedPeriod}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Errore export:', error)
      alert('Errore durante l\'export')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Errore nel caricamento dei dati</h3>
          <p className="text-muted-foreground">Riprova più tardi</p>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Riprova
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <PieChart className="h-8 w-8 text-blue-500" />
            Analytics Finanziarie
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoraggio performance, calcoli fiscali e insights business
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Period Selector */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setSelectedPeriod('day')}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                selectedPeriod === 'day' 
                  ? 'bg-white shadow-sm' 
                  : 'hover:bg-white/50'
              }`}
            >
              Giorno
            </button>
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                selectedPeriod === 'week' 
                  ? 'bg-white shadow-sm' 
                  : 'hover:bg-white/50'
              }`}
            >
              Settimana
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                selectedPeriod === 'month' 
                  ? 'bg-white shadow-sm' 
                  : 'hover:bg-white/50'
              }`}
            >
              Mese
            </button>
          </div>

          {/* Date Selector */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
          
          {/* Actions */}
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Aggiorna
          </Button>
          
          <Button onClick={handleExport} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Warnings */}
      {stats.warnings && stats.warnings.length > 0 && (
        <div className="space-y-2">
          {stats.warnings.map((warning, index) => (
            <Alert key={index} className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                {warning}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incassi Totali</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              €{stats.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalBookings} servizi completati
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Medio</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              €{stats.averageTicket.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per servizio erogato
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Netto Effettivo</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              €{stats.taxes.netEffective.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dopo tasse e contributi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Da Accantonare</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              €{(stats.taxes.vatToReserve + stats.taxes.irpefToReserve + stats.taxes.inpsToReserve).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              IVA, IRPEF e INPS
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">Metodi Pagamento</TabsTrigger>
          <TabsTrigger value="fiscal">Gestione Fiscale</TabsTrigger>
          <TabsTrigger value="staff">Performance Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Methods Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Metodi di Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.paymentMethods).map(([method, data]) => {
                  const percentage = stats.totalRevenue > 0 ? (data.amount / stats.totalRevenue) * 100 : 0
                  const icon = method === 'cash' ? '💸' : method === 'card' ? '💳' : method === 'transfer' ? '🏦' : '🔄'
                  const label = method === 'cash' ? 'Contanti' : method === 'card' ? 'Carte' : method === 'transfer' ? 'Bonifici' : 'Misto'
                  
                  return (
                    <div key={method} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-sm">
                          {icon} {label}
                        </span>
                        <div className="text-right">
                          <div className="font-medium">€{data.amount.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">{data.count} pagamenti</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            method === 'cash' ? 'bg-orange-500' : 
                            method === 'card' ? 'bg-blue-500' : 
                            method === 'transfer' ? 'bg-green-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        {percentage.toFixed(1)}% del totale
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Fiscal Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documenti Fiscali
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.fiscalDocuments).map(([doc, data]) => {
                  const percentage = stats.totalRevenue > 0 ? (data.amount / stats.totalRevenue) * 100 : 0
                  const icon = doc === 'receipt' ? '🧾' : doc === 'invoice' ? '📄' : '❌'
                  const label = doc === 'receipt' ? 'Scontrini' : doc === 'invoice' ? 'Fatture' : 'Nessun documento'
                  const isWarning = doc === 'none' && data.amount > 0
                  
                  return (
                    <div key={doc} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-sm">
                          {icon} {label}
                          {isWarning && (
                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                              Attenzione
                            </Badge>
                          )}
                        </span>
                        <div className="text-right">
                          <div className="font-medium">€{data.amount.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">{data.count} documenti</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            doc === 'receipt' ? 'bg-green-500' : 
                            doc === 'invoice' ? 'bg-blue-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        {percentage.toFixed(1)}% del totale
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analisi Dettagliata Pagamenti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Payment Methods Detailed */}
                <div>
                  <h4 className="font-medium mb-4">Distribuzione Metodi di Pagamento</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(stats.paymentMethods).map(([method, data]) => {
                      const percentage = stats.totalRevenue > 0 ? (data.amount / stats.totalRevenue) * 100 : 0
                      return (
                        <Card key={method} className="p-4">
                          <div className="text-center">
                            <div className="text-2xl mb-2">
                              {method === 'cash' ? '💸' : method === 'card' ? '💳' : method === 'transfer' ? '🏦' : '🔄'}
                            </div>
                            <div className="font-semibold">
                              {method === 'cash' ? 'Contanti' : method === 'card' ? 'Carte' : method === 'transfer' ? 'Bonifici' : 'Misto'}
                            </div>
                            <div className="text-2xl font-bold text-blue-600 mt-2">
                              {percentage.toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              €{data.amount.toFixed(2)} ({data.count} transazioni)
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>

                {/* Payment Insights */}
                <div>
                  <h4 className="font-medium mb-4">Insights Pagamenti</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h5 className="font-medium mb-2">📊 Statistiche</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Transazioni totali:</span>
                          <span className="font-medium">{stats.totalBookings}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Valore medio transazione:</span>
                          <span className="font-medium">€{stats.averageTicket.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Contanti vs Digitale:</span>
                          <span className="font-medium">
                            {((stats.paymentMethods.cash.amount / stats.totalRevenue) * 100).toFixed(1)}% vs{' '}
                            {(((stats.paymentMethods.card.amount + stats.paymentMethods.transfer.amount) / stats.totalRevenue) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h5 className="font-medium mb-2">💡 Raccomandazioni</h5>
                      <div className="space-y-2 text-sm">
                        {stats.paymentMethods.cash.amount / stats.totalRevenue > 0.6 && (
                          <div className="text-orange-600">
                            ⚠️ Alto volume contanti - considera incentivi per pagamenti digitali
                          </div>
                        )}
                        {stats.paymentMethods.card.amount / stats.totalRevenue > 0.7 && (
                          <div className="text-green-600">
                            ✅ Ottima adozione pagamenti digitali
                          </div>
                        )}
                        {stats.averageTicket < 30 && (
                          <div className="text-blue-600">
                            💡 Ticket medio basso - considera upselling
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fiscal" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tax Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Calcolo Tasse da Accantonare</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Fatturato Lordo:</span>
                    <span className="font-bold text-lg">€{stats.totalRevenue.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>IVA da versare:</span>
                      <span className="font-medium text-red-600">-€{stats.taxes.vatToReserve.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>IRPEF stimata (20%):</span>
                      <span className="font-medium text-red-600">-€{stats.taxes.irpefToReserve.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>INPS contributi (24.48%):</span>
                      <span className="font-medium text-red-600">-€{stats.taxes.inpsToReserve.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Netto Effettivo:</span>
                      <span className="font-bold text-lg text-green-600">€{stats.taxes.netEffective.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Quello che rimane realmente dopo tasse e contributi
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fiscal Warnings and Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Alert e Raccomandazioni Fiscali</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Document Warnings */}
                {stats.fiscalDocuments.none.amount > 0 && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription>
                      <div className="font-medium text-orange-800">Pagamenti senza documento</div>
                      <div className="text-sm text-orange-700 mt-1">
                        €{stats.fiscalDocuments.none.amount.toFixed(2)} incassati senza emettere documento fiscale
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Cash Volume Warning */}
                {stats.paymentMethods.cash.amount > 2000 && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription>
                      <div className="font-medium text-yellow-800">Alto volume contanti</div>
                      <div className="text-sm text-yellow-700 mt-1">
                        €{stats.paymentMethods.cash.amount.toFixed(2)} in contanti - considera pagamenti tracciabili
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Tax Reserve Reminder */}
                <Alert className="border-blue-200 bg-blue-50">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <AlertDescription>
                    <div className="font-medium text-blue-800">Promemoria Accantonamenti</div>
                    <div className="text-sm text-blue-700 mt-1">
                      Ricorda di accantonare €{(stats.taxes.vatToReserve + stats.taxes.irpefToReserve + stats.taxes.inpsToReserve).toFixed(2)} per le prossime scadenze fiscali
                    </div>
                  </AlertDescription>
                </Alert>

                {/* Positive Insights */}
                {stats.fiscalDocuments.none.amount === 0 && (
                  <Alert className="border-green-200 bg-green-50">
                    <div className="text-green-600">✅</div>
                    <AlertDescription>
                      <div className="font-medium text-green-800">Compliance Perfetta</div>
                      <div className="text-sm text-green-700 mt-1">
                        Tutti i pagamenti hanno documento fiscale associato
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Performance Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              {staffPerformance.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nessun dato performance staff disponibile per questo periodo</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {staffPerformance.map((staff, index) => (
                    <div key={staff.staffId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{staff.staffName}</h4>
                          <Badge variant="outline" className="mt-1">
                            #{index + 1} Performer
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            €{staff.totalRevenue.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {staff.totalBookings} servizi
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="font-semibold">Ticket Medio</div>
                          <div className="text-xl font-bold text-blue-600">
                            €{staff.averageTicket.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="font-semibold">Servizi Erogati</div>
                          <div className="text-xl font-bold text-purple-600">
                            {staff.totalBookings}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="font-semibold">Revenue Share</div>
                          <div className="text-xl font-bold text-orange-600">
                            {stats.totalRevenue > 0 ? ((staff.totalRevenue / stats.totalRevenue) * 100).toFixed(1) : '0'}%
                          </div>
                        </div>
                      </div>

                      {/* Top Services */}
                      {staff.topServices.length > 0 && (
                        <div>
                          <h5 className="font-medium mb-3">Top Servizi</h5>
                          <div className="space-y-2">
                            {staff.topServices.slice(0, 3).map((service, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <span>{service.serviceName}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">
                                    {service.count}x
                                  </span>
                                  <span className="font-medium">
                                    €{service.revenue.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}