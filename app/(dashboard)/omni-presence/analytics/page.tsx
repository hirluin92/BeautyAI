"use client"

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Target,
  Users,
  MessageCircle,
  Mail,
  Phone,
  Instagram,
  Facebook,
  Chrome,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  MousePointer,
  DollarSign,
  Percent,
  Clock,
  Zap,
  Star,
  ChevronDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalSent: number
    totalDelivered: number
    totalOpened: number
    totalClicked: number
    totalConversions: number
    totalRevenue: number
    avgOpenRate: number
    avgClickRate: number
    avgConversionRate: number
  }
  channelPerformance: Array<{
    channel: string
    icon: React.ComponentType
    color: string
    sent: number
    delivered: number
    opened: number
    clicked: number
    conversions: number
    revenue: number
    trends: {
      sentTrend: number
      openRateTrend: number
      conversionTrend: number
    }
  }>
  timeSeriesData: Array<{
    date: string
    sent: number
    opened: number
    clicked: number
    conversions: number
  }>
  topCampaigns: Array<{
    id: string
    name: string
    type: string
    sent: number
    openRate: number
    conversionRate: number
    revenue: number
  }>
  audienceInsights: {
    totalReach: number
    uniqueUsers: number
    avgEngagementTime: number
    topSegments: Array<{
      name: string
      count: number
      engagementRate: number
    }>
  }
}

export default function OmniAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedChannel, setSelectedChannel] = useState('all')

  // Mock data - in produzione verrebbe da API
  useEffect(() => {
    const mockData: AnalyticsData = {
      overview: {
        totalSent: 15420,
        totalDelivered: 14856,
        totalOpened: 11234,
        totalClicked: 3456,
        totalConversions: 892,
        totalRevenue: 67340,
        avgOpenRate: 75.6,
        avgClickRate: 30.8,
        avgConversionRate: 25.8
      },
      channelPerformance: [
        {
          channel: 'WhatsApp',
          icon: MessageCircle,
          color: 'from-green-500 to-green-600',
          sent: 5240,
          delivered: 5156,
          opened: 4823,
          clicked: 1456,
          conversions: 378,
          revenue: 25670,
          trends: { sentTrend: 12.5, openRateTrend: 8.2, conversionTrend: 15.6 }
        },
        {
          channel: 'Email',
          icon: Mail,
          color: 'from-blue-500 to-blue-600',
          sent: 4320,
          delivered: 4156,
          opened: 2890,
          clicked: 867,
          conversions: 234,
          revenue: 18940,
          trends: { sentTrend: 8.7, openRateTrend: -2.1, conversionTrend: 5.3 }
        },
        {
          channel: 'SMS',
          icon: Phone,
          color: 'from-purple-500 to-purple-600',
          sent: 2890,
          delivered: 2834,
          opened: 2567,
          clicked: 534,
          conversions: 156,
          revenue: 8760,
          trends: { sentTrend: -3.2, openRateTrend: 12.8, conversionTrend: 8.9 }
        },
        {
          channel: 'Instagram',
          icon: Instagram,
          color: 'from-pink-500 to-pink-600',
          sent: 1890,
          delivered: 1823,
          opened: 1345,
          clicked: 445,
          conversions: 89,
          revenue: 9870,
          trends: { sentTrend: 25.4, openRateTrend: 18.7, conversionTrend: 22.1 }
        },
        {
          channel: 'Facebook',
          icon: Facebook,
          color: 'from-indigo-500 to-indigo-600',
          sent: 1080,
          delivered: 1034,
          opened: 789,
          clicked: 234,
          conversions: 35,
          revenue: 4100,
          trends: { sentTrend: 5.6, openRateTrend: -5.3, conversionTrend: -8.2 }
        }
      ],
      timeSeriesData: [
        { date: '2024-12-01', sent: 450, opened: 340, clicked: 105, conversions: 28 },
        { date: '2024-12-02', sent: 520, opened: 398, clicked: 123, conversions: 32 },
        { date: '2024-12-03', sent: 380, opened: 290, clicked: 89, conversions: 22 },
        { date: '2024-12-04', sent: 620, opened: 475, clicked: 147, conversions: 38 },
        { date: '2024-12-05', sent: 580, opened: 445, clicked: 138, conversions: 35 },
        { date: '2024-12-06', sent: 490, opened: 374, clicked: 116, conversions: 29 },
        { date: '2024-12-07', sent: 670, opened: 512, clicked: 159, conversions: 41 }
      ],
      topCampaigns: [
        {
          id: '1',
          name: 'Promozione Black Friday',
          type: 'promotional',
          sent: 2890,
          openRate: 82.4,
          conversionRate: 31.7,
          revenue: 18940
        },
        {
          id: '2',
          name: 'Benvenuto Nuovi Clienti',
          type: 'welcome',
          sent: 1560,
          openRate: 78.9,
          conversionRate: 28.3,
          revenue: 12340
        },
        {
          id: '3',
          name: 'Promemoria Appuntamenti',
          type: 'reminder',
          sent: 3450,
          openRate: 91.2,
          conversionRate: 15.6,
          revenue: 8760
        }
      ],
      audienceInsights: {
        totalReach: 47892,
        uniqueUsers: 12456,
        avgEngagementTime: 145,
        topSegments: [
          { name: 'VIP Clienti', count: 1234, engagementRate: 89.5 },
          { name: 'Nuovi Clienti', count: 2890, engagementRate: 76.3 },
          { name: 'Clienti Inattivi', count: 1567, engagementRate: 45.7 }
        ]
      }
    }
    
    setTimeout(() => {
      setData(mockData)
      setLoading(false)
    }, 1000)
  }, [timeRange, selectedChannel])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg font-medium text-gray-700">Caricamento Analytics...</span>
        </div>
      </div>
    )
  }

  if (!data) return null

  const getChannelIcon = (channelName: string) => {
    const channel = data.channelPerformance.find(c => c.channel === channelName)
    return channel ? channel.icon : MessageCircle
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Omni-Channel</h1>
              <p className="text-gray-600 mt-1">Analisi complete delle performance multi-canale</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Ultimi 7 giorni</option>
                <option value="30d">Ultimi 30 giorni</option>
                <option value="90d">Ultimi 3 mesi</option>
                <option value="1y">Ultimo anno</option>
              </select>
              
              <select 
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tutti i canali</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
              </select>
              
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Esporta
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* KPI Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="flex items-center text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                <ArrowUp className="w-3 h-3 mr-1" />
                +12%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Messaggi Inviati</h3>
            <p className="text-2xl font-bold text-gray-900">{data.overview.totalSent.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <span className="flex items-center text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                <ArrowUp className="w-3 h-3 mr-1" />
                +8%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Tasso Apertura</h3>
            <p className="text-2xl font-bold text-gray-900">{data.overview.avgOpenRate}%</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <MousePointer className="w-6 h-6 text-white" />
              </div>
              <span className="flex items-center text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                <ArrowUp className="w-3 h-3 mr-1" />
                +15%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Tasso Click</h3>
            <p className="text-2xl font-bold text-gray-900">{data.overview.avgClickRate}%</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="flex items-center text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                <ArrowUp className="w-3 h-3 mr-1" />
                +22%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Conversioni</h3>
            <p className="text-2xl font-bold text-gray-900">{data.overview.totalConversions}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="flex items-center text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                <ArrowUp className="w-3 h-3 mr-1" />
                +28%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Revenue</h3>
            <p className="text-2xl font-bold text-gray-900">€{data.overview.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Channel Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">Performance per Canale</h2>
            <button className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
              <RefreshCw className="w-4 h-4 mr-2" />
              Aggiorna
            </button>
          </div>

          <div className="space-y-6">
            {data.channelPerformance.map((channel) => {
              const IconComponent = channel.icon as React.ComponentType<{ className?: string }>
              const openRate = ((channel.opened / channel.delivered) * 100).toFixed(1)
              const clickRate = ((channel.clicked / channel.opened) * 100).toFixed(1)
              const conversionRate = ((channel.conversions / channel.clicked) * 100).toFixed(1)
              
              return (
                <div key={channel.channel} className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 bg-gradient-to-r ${channel.color} rounded-xl flex items-center justify-center mr-4`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{channel.channel}</h3>
                        <p className="text-sm text-gray-600">{channel.sent.toLocaleString()} messaggi inviati</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">€{channel.revenue.toLocaleString()}</p>
                      <div className="flex items-center text-sm text-green-600">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{channel.trends.conversionTrend}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{channel.sent.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Inviati</p>
                      <div className="flex items-center justify-center mt-1">
                        <span className="text-xs text-green-600 flex items-center">
                          <ArrowUp className="w-3 h-3 mr-1" />
                          {channel.trends.sentTrend}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{channel.delivered.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Consegnati</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {((channel.delivered / channel.sent) * 100).toFixed(1)}%
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{openRate}%</p>
                      <p className="text-sm text-gray-600">Aperti</p>
                      <div className="flex items-center justify-center mt-1">
                        <span className={`text-xs flex items-center ${
                          channel.trends.openRateTrend > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {channel.trends.openRateTrend > 0 ? 
                            <ArrowUp className="w-3 h-3 mr-1" /> : 
                            <ArrowDown className="w-3 h-3 mr-1" />
                          }
                          {Math.abs(channel.trends.openRateTrend)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{clickRate}%</p>
                      <p className="text-sm text-gray-600">Click</p>
                      <p className="text-xs text-gray-500 mt-1">{channel.clicked} click</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{conversionRate}%</p>
                      <p className="text-sm text-gray-600">Conversioni</p>
                      <p className="text-xs text-gray-500 mt-1">{channel.conversions} vendite</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">€{Math.round(channel.revenue / channel.conversions)}</p>
                      <p className="text-sm text-gray-600">Valore Medio</p>
                      <p className="text-xs text-gray-500 mt-1">per conversione</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Performance Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">Trend Performance</h2>
            <div className="flex space-x-4">
              {['Inviati', 'Aperti', 'Click', 'Conversioni'].map((metric) => (
                <label key={metric} className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm text-gray-600">{metric}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Grafico Timeline Performance</p>
              <p className="text-sm text-gray-500">Implementazione con Chart.js o Recharts</p>
            </div>
          </div>
        </div>

        {/* Campaign Performance & Audience Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Campaigns */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Campagne</h2>
            
            <div className="space-y-4">
              {data.topCampaigns.map((campaign, index) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">{campaign.sent.toLocaleString()} inviati</span>
                        <span className="text-sm text-blue-600">{campaign.openRate}% apertura</span>
                        <span className="text-sm text-green-600">{campaign.conversionRate}% conversione</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">€{campaign.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audience Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Audience Insights</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{data.audienceInsights.totalReach.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Reach Totale</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{data.audienceInsights.uniqueUsers.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Utenti Unici</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Segmenti Top Performance</h3>
                <div className="space-y-3">
                  {data.audienceInsights.topSegments.map((segment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{segment.name}</p>
                        <p className="text-sm text-gray-600">{segment.count.toLocaleString()} utenti</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{segment.engagementRate}%</p>
                        <p className="text-xs text-gray-600">engagement</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Metriche Avanzate</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900">{data.audienceInsights.avgEngagementTime}s</p>
              <p className="text-sm text-gray-600">Tempo Medio Engagement</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl">
              <Zap className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900">2.3min</p>
              <p className="text-sm text-gray-600">Tempo Risposta AI</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <Star className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900">4.8⭐</p>
              <p className="text-sm text-gray-600">Customer Satisfaction</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
              <Percent className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900">94.2%</p>
              <p className="text-sm text-gray-600">Delivery Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 