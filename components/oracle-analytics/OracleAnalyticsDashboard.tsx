"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  PieChart,
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Eye,
  Target,
  Lightbulb,
  Calendar,
  DollarSign,
  Users,
  Zap,
  BarChart3,
  LineChart
} from 'lucide-react';

interface BusinessForecast {
  organization_id: string;
  forecast_period: string;
  revenue_prediction: {
    predicted_revenue: number;
    revenue_range: { min: number; max: number };
    growth_rate: number;
    confidence: number;
    key_drivers: string[];
  };
  booking_prediction: {
    predicted_bookings: number;
    booking_range: { min: number; max: number };
    capacity_utilization: number;
    optimization_potential: number;
  };
  client_prediction: {
    new_clients_predicted: number;
    churn_predicted: number;
    retention_rate: number;
    lifetime_value_trend: number;
  };
  opportunities: Array<{
    opportunity_type: string;
    title: string;
    description: string;
    potential_impact: number;
    probability: number;
    timeline: string;
  }>;
  risks: Array<{
    risk_type: string;
    title: string;
    description: string;
    potential_impact: number;
    probability: number;
    severity: string;
  }>;
  recommendations: Array<{
    category: string;
    priority: string;
    title: string;
    description: string;
    expected_impact: number;
    timeline: string;
  }>;
  confidence_score: number;
  generated_at: string;
}

const OracleAnalyticsDashboard = () => {
  const [forecast, setForecast] = useState<BusinessForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('12-months');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadOracleAnalytics();
  }, [selectedPeriod]);

  const loadOracleAnalytics = async () => {
    setLoading(true);
    try {
      // Simula chiamata API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data realistici
      const mockForecast: BusinessForecast = {
        organization_id: 'org_1',
        forecast_period: selectedPeriod,
        revenue_prediction: {
          predicted_revenue: 85600,
          revenue_range: { min: 68500, max: 102800 },
          growth_rate: 18,
          confidence: 84,
          key_drivers: ['Crescita servizi premium', 'Aumento retention clienti', 'Ottimizzazione pricing']
        },
        booking_prediction: {
          predicted_bookings: 1240,
          booking_range: { min: 1050, max: 1430 },
          capacity_utilization: 72,
          optimization_potential: 23
        },
        client_prediction: {
          new_clients_predicted: 145,
          churn_predicted: 32,
          retention_rate: 78,
          lifetime_value_trend: 12
        },
        opportunities: [
          {
            opportunity_type: 'Service',
            title: 'Espandi Trattamenti Anti-Age',
            description: 'Trend crescente del 25% negli ultimi 6 mesi. Opportunità di espansione.',
            potential_impact: 12500,
            probability: 85,
            timeline: '2-4 mesi'
          },
          {
            opportunity_type: 'Pricing',
            title: 'Ottimizzazione Pricing Weekend',
            description: 'Weekend sottovalutati del 15%. Potenziale aumento prezzi.',
            potential_impact: 8400,
            probability: 75,
            timeline: '1-2 mesi'
          },
          {
            opportunity_type: 'Market',
            title: 'Promozioni Bassa Stagione',
            description: 'Gennaio-Febbraio: capacità sottoutilizzata del 40%.',
            potential_impact: 6200,
            probability: 90,
            timeline: 'Gennaio-Febbraio'
          }
        ],
        risks: [
          {
            risk_type: 'Seasonal',
            title: 'Volatilità Stagionale',
            description: 'Ricavi variano del 45% tra stagioni. Rischio cash flow.',
            potential_impact: 15000,
            probability: 80,
            severity: 'High'
          },
          {
            risk_type: 'Client',
            title: 'Concentrazione Clienti VIP',
            description: '35% dei ricavi dipende da 8 clienti VIP.',
            potential_impact: 25000,
            probability: 60,
            severity: 'Critical'
          }
        ],
        recommendations: [
          {
            category: 'Strategic',
            priority: 'Critical',
            title: 'Diversifica Base Clienti',
            description: 'Riduci dipendenza da clienti VIP con programmi acquisizione.',
            expected_impact: 18000,
            timeline: '6-12 mesi'
          },
          {
            category: 'Tactical',
            priority: 'High',
            title: 'Implementa Dynamic Pricing',
            description: 'Prezzi automatici basati su domanda per ottimizzare ricavi.',
            expected_impact: 12000,
            timeline: '3-6 mesi'
          },
          {
            category: 'Operational',
            priority: 'Medium',
            title: 'Servizi Counter-Stagionali',
            description: 'Sviluppa offerte specifiche per bassa stagione.',
            expected_impact: 8000,
            timeline: '1-3 mesi'
          }
        ],
        confidence_score: 87,
        generated_at: new Date().toISOString()
      };

      setForecast(mockForecast);
    } catch (error) {
      console.error('Errore loading oracle analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const runOracleAnalysis = async () => {
    setAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await loadOracleAnalytics();
    } finally {
      setAnalyzing(false);
    }
  };

  const getGrowthColor = (rate: number) => {
    if (rate > 15) return 'text-green-600';
    if (rate > 5) return 'text-blue-600';
    if (rate > 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-12">
          <div className="text-center space-y-4">
            <PieChart className="h-12 w-12 text-purple-500 animate-pulse mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">🔮 Oracle Analysis in corso...</h3>
              <p className="text-sm text-muted-foreground">
                L'AI sta analizzando il futuro del tuo business fino a 12 mesi
              </p>
              <div className="w-64 mx-auto">
                <Progress value={75} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!forecast) {
    return <div>Errore nel caricamento delle predizioni Oracle</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PieChart className="h-7 w-7 text-purple-500" />
            Oracle Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Visioni del futuro con AI che prevede trend e opportunità fino a 12 mesi
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="3-months">3 Mesi</option>
            <option value="6-months">6 Mesi</option>
            <option value="12-months">12 Mesi</option>
            <option value="24-months">24 Mesi</option>
          </select>
          <Button 
            onClick={runOracleAnalysis}
            disabled={analyzing}
            className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
          >
            {analyzing ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-spin" />
                Consultando Oracle...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Vedi il Futuro
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Confidence Score */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Oracle Confidence Score</h3>
              <p className="text-sm text-muted-foreground">Accuratezza predizioni basata su quantità e qualità dati</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-purple-600">{forecast.confidence_score}%</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-32 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full"
                    style={{ width: `${forecast.confidence_score}%` }}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground">Accuracy</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Prediction */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-green-500" />
              Ricavi Predetti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold">€{forecast.revenue_prediction.predicted_revenue.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">
                  Range: €{forecast.revenue_prediction.revenue_range.min.toLocaleString()} - €{forecast.revenue_prediction.revenue_range.max.toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className={`h-4 w-4 ${getGrowthColor(forecast.revenue_prediction.growth_rate)}`} />
                <span className={`font-medium ${getGrowthColor(forecast.revenue_prediction.growth_rate)}`}>
                  +{forecast.revenue_prediction.growth_rate}% crescita
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Confidence: {forecast.revenue_prediction.confidence}%</div>
                <Progress value={forecast.revenue_prediction.confidence} className="h-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Prediction */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-blue-500" />
              Prenotazioni Previste
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold">{forecast.booking_prediction.predicted_bookings.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">
                  Range: {forecast.booking_prediction.booking_range.min.toLocaleString()} - {forecast.booking_prediction.booking_range.max.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Utilizzo Capacità</div>
                <div className="flex items-center gap-2">
                  <Progress value={forecast.booking_prediction.capacity_utilization} className="flex-1 h-2" />
                  <span className="text-sm font-medium">{forecast.booking_prediction.capacity_utilization}%</span>
                </div>
              </div>
              <div className="text-xs text-green-600">
                +{forecast.booking_prediction.optimization_potential}% potenziale ottimizzazione
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clients Prediction */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-purple-500" />
              Evoluzione Clienti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-green-50 p-2 rounded">
                  <div className="text-lg font-bold text-green-600">+{forecast.client_prediction.new_clients_predicted}</div>
                  <div className="text-xs text-muted-foreground">Nuovi Clienti</div>
                </div>
                <div className="bg-red-50 p-2 rounded">
                  <div className="text-lg font-bold text-red-600">-{forecast.client_prediction.churn_predicted}</div>
                  <div className="text-xs text-muted-foreground">Churn Previsto</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Retention Rate</div>
                <div className="flex items-center gap-2">
                  <Progress value={forecast.client_prediction.retention_rate} className="flex-1 h-2" />
                  <span className="text-sm font-medium">{forecast.client_prediction.retention_rate}%</span>
                </div>
              </div>
              <div className="text-xs text-blue-600">
                LTV Trend: +{forecast.client_prediction.lifetime_value_trend}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunità</TabsTrigger>
          <TabsTrigger value="risks">Rischi</TabsTrigger>
          <TabsTrigger value="recommendations">Raccomandazioni</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Drivers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Driver Chiave della Crescita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {forecast.revenue_prediction.key_drivers.map((driver, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{driver}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          {forecast.opportunities.map((opportunity, index) => (
            <Card key={index} className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      {opportunity.title}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {opportunity.opportunity_type}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      €{opportunity.potential_impact.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {opportunity.probability}% probabilità
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{opportunity.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Timeline: {opportunity.timeline}</span>
                  <Progress value={opportunity.probability} className="w-20 h-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          {forecast.risks.map((risk, index) => (
            <Card key={index} className={`border-l-4 ${
              risk.severity === 'Critical' ? 'border-l-red-500' : 
              risk.severity === 'High' ? 'border-l-orange-500' : 'border-l-yellow-500'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <h4 className="font-semibold flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 ${
                        risk.severity === 'Critical' ? 'text-red-500' : 
                        risk.severity === 'High' ? 'text-orange-500' : 'text-yellow-500'
                      }`} />
                      {risk.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {risk.risk_type}
                      </Badge>
                      <Badge className={`text-xs text-white ${
                        risk.severity === 'Critical' ? 'bg-red-500' : 
                        risk.severity === 'High' ? 'bg-orange-500' : 'bg-yellow-500'
                      }`}>
                        {risk.severity}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      risk.severity === 'Critical' ? 'text-red-600' : 
                      risk.severity === 'High' ? 'text-orange-600' : 'text-yellow-600'
                    }`}>
                      €{risk.potential_impact.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {risk.probability}% probabilità
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{risk.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Impatto potenziale</span>
                  <Progress value={risk.probability} className="w-20 h-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {forecast.recommendations.map((rec, index) => (
            <Card key={index} className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-blue-500" />
                      {rec.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {rec.category}
                      </Badge>
                      <Badge className={`text-xs text-white ${getPriorityColor(rec.priority)}`}>
                        {rec.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      €{rec.expected_impact.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Impatto previsto
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Timeline: {rec.timeline}</span>
                  <Button size="sm" variant="outline" className="text-xs">
                    Implementa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Azioni Oracle Raccomandate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Opportunità Top:</strong> Espandi servizi anti-age per +€12.5k ricavi
              </AlertDescription>
            </Alert>
            
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Rischio Critico:</strong> Diversifica base clienti per ridurre dipendenza VIP
              </AlertDescription>
            </Alert>
            
            <Alert className="border-blue-200 bg-blue-50">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Azione Immediata:</strong> Implementa dynamic pricing per +€8k
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Oracle Insights Summary */}
      <Card className="bg-gradient-to-r from-purple-900 to-blue-900 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <PieChart className="h-6 w-6" />
                Oracle Insight del Giorno
              </h3>
              <p className="text-purple-100">
                "Il tuo business ha un potenziale di crescita del {forecast.revenue_prediction.growth_rate}% nei prossimi {selectedPeriod}. 
                Le opportunità identificate potrebbero generare €{forecast.opportunities.reduce((sum, opp) => sum + opp.potential_impact, 0).toLocaleString()} 
                di ricavi aggiuntivi."
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">🔮</div>
              <div className="text-sm text-purple-200">
                Generato il {new Date(forecast.generated_at).toLocaleDateString('it-IT')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OracleAnalyticsDashboard; 