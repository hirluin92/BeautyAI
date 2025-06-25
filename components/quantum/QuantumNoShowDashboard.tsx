'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Zap,
  Target,
  Settings
} from 'lucide-react';

interface NoShowPrediction {
  booking_id: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  factors: string[];
  recommendations: string[];
}

interface PredictionSummary {
  total: number;
  high_risk: number;
  avg_risk: number;
}

interface BookingDetails {
  id: string;
  client_name: string;
  service_name: string;
  start_at: string;
  price: number;
}

const QuantumNoShowDashboard = () => {
  const [predictions, setPredictions] = useState<NoShowPrediction[]>([]);
  const [summary, setSummary] = useState<PredictionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<NoShowPrediction | null>(null);

  // Simulated booking details (normalmente verrebbero dall'API)
  const mockBookingDetails: Record<string, BookingDetails> = {
    '1': { id: '1', client_name: 'Maria Rossi', service_name: 'Manicure', start_at: '2024-01-15T14:00:00', price: 35 },
    '2': { id: '2', client_name: 'Giulia Bianchi', service_name: 'Taglio + Piega', start_at: '2024-01-15T16:30:00', price: 65 },
    '3': { id: '3', client_name: 'Anna Verdi', service_name: 'Trattamento Viso', start_at: '2024-01-16T10:00:00', price: 85 }
  };

  useEffect(() => {
    loadQuantumAnalysis();
  }, []);

  const loadQuantumAnalysis = async () => {
    setLoading(true);
    try {
      // Simula chiamata API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data realistici
      const mockPredictions: NoShowPrediction[] = [
        {
          booking_id: '1',
          risk_score: 78,
          risk_level: 'HIGH',
          confidence: 85,
          factors: ['Cliente nuovo/inaffidabile', 'Prenotazione last-minute'],
          recommendations: ['🚨 INVIO REMINDER MULTIPLI', '📞 CHIAMATA CONFERMA 24H PRIMA']
        },
        {
          booking_id: '2',
          risk_score: 45,
          risk_level: 'MEDIUM',
          confidence: 72,
          factors: ['Giorno problematico', 'Orario sfavorevole'],
          recommendations: ['📱 WhatsApp reminder personalizzato', '⏰ Reminder 2 ore prima']
        },
        {
          booking_id: '3',
          risk_score: 12,
          risk_level: 'LOW',
          confidence: 90,
          factors: [],
          recommendations: ['✅ Reminder standard', '📊 Monitora per migliorare modello']
        }
      ];

      setPredictions(mockPredictions);
      setSummary({
        total: mockPredictions.length,
        high_risk: mockPredictions.filter(p => p.risk_level === 'HIGH' || p.risk_level === 'CRITICAL').length,
        avg_risk: Math.round(mockPredictions.reduce((sum, p) => sum + p.risk_score, 0) / mockPredictions.length)
      });
    } catch (error) {
      console.error('Errore loading quantum analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const runQuantumAnalysis = async () => {
    setAnalyzing(true);
    try {
      // Simula re-analisi
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadQuantumAnalysis();
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'CRITICAL': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'HIGH': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'MEDIUM': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'LOW': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-12">
          <div className="text-center space-y-4">
            <Brain className="h-12 w-12 text-blue-500 animate-pulse mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">🔮 Quantum Analysis in corso...</h3>
              <p className="text-sm text-muted-foreground">
                L'AI sta analizzando le prenotazioni e calcolando i risk score
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-7 w-7 text-blue-500" />
            Quantum Booking Intelligence
          </h1>
          <p className="text-sm text-muted-foreground">
            AI predittivo per eliminare no-show e ottimizzare ogni prenotazione
          </p>
        </div>
        <Button 
          onClick={runQuantumAnalysis}
          disabled={analyzing}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          {analyzing ? (
            <>
              <Zap className="h-4 w-4 mr-2 animate-spin" />
              Analizzando...
            </>
          ) : (
            <>
              <Target className="h-4 w-4 mr-2" />
              Attiva Quantum AI
            </>
          )}
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Prenotazioni Analizzate</p>
                  <p className="text-2xl font-bold">{summary.total}</p>
                </div>
                <Brain className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alto Rischio</p>
                  <p className="text-2xl font-bold text-orange-500">{summary.high_risk}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Risk Score Medio</p>
                  <p className="text-2xl font-bold">{summary.avg_risk}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Efficienza AI</p>
                  <p className="text-2xl font-bold text-purple-500">94%</p>
                </div>
                <Zap className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Predictions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Predizioni Quantum
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictions.map((prediction) => {
              const booking = mockBookingDetails[prediction.booking_id];
              if (!booking) return null;

              return (
                <div 
                  key={prediction.booking_id}
                  className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedPrediction(prediction)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getRiskIcon(prediction.risk_level)}
                      <div>
                        <h4 className="font-medium">{booking.client_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {booking.service_name} • {new Date(booking.start_at).toLocaleDateString('it-IT')} {new Date(booking.start_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={prediction.risk_level === 'HIGH' || prediction.risk_level === 'CRITICAL' ? 'destructive' : 
                                   prediction.risk_level === 'MEDIUM' ? 'default' : 'secondary'}>
                        {prediction.risk_level}
                      </Badge>
                      <div className="text-right">
                        <p className="text-lg font-bold">{prediction.risk_score}%</p>
                        <p className="text-xs text-muted-foreground">Risk Score</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Probabilità No-Show</span>
                      <span>{prediction.confidence}% confidence</span>
                    </div>
                    <Progress value={prediction.risk_score} className="h-2" />
                  </div>

                  {prediction.factors.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-2">🎯 Fattori di Rischio:</p>
                      <div className="flex flex-wrap gap-1">
                        {prediction.factors.map((factor, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {prediction.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">💡 Raccomandazioni AI:</p>
                      <div className="space-y-1">
                        {prediction.recommendations.slice(0, 2).map((rec, index) => (
                          <p key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                            {rec}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quantum Optimization Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Ottimizzazioni Suggerite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                <strong>Overbooking Intelligente:</strong> Prenota +2 slot aggiuntivi oggi per compensare i no-show previsti
              </AlertDescription>
            </Alert>
            
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertDescription>
                <strong>Dynamic Pricing:</strong> Aumenta del 15% i prezzi degli slot ad alto rischio per ridurre le cancellazioni
              </AlertDescription>
            </Alert>

            <Alert>
              <Target className="h-4 w-4" />
              <AlertDescription>
                <strong>Smart Reminders:</strong> 3 clienti necessitano di reminder anticipati e personalizzati
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Impatto Business
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Ricavi Protetti</span>
                <span className="font-medium">€185</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Slot Recuperabili</span>
                <span className="font-medium">2 slot</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Efficienza +</span>
                <span className="font-medium text-green-600">+23%</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">94%</p>
                <p className="text-sm text-muted-foreground">Accuracy Score del Modello</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed View Modal */}
      {selectedPrediction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Analisi Quantum Dettagliata
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedPrediction(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Booking Info */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">📅 Dettagli Prenotazione</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Cliente:</strong> {mockBookingDetails[selectedPrediction.booking_id]?.client_name}</p>
                  <p><strong>Servizio:</strong> {mockBookingDetails[selectedPrediction.booking_id]?.service_name}</p>
                  <p><strong>Data/Ora:</strong> {new Date(mockBookingDetails[selectedPrediction.booking_id]?.start_at || '').toLocaleString('it-IT')}</p>
                  <p><strong>Prezzo:</strong> €{mockBookingDetails[selectedPrediction.booking_id]?.price}</p>
                </div>
              </div>

              {/* Risk Analysis */}
              <div>
                <h4 className="font-medium mb-3">🎯 Analisi del Rischio</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Risk Score</span>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedPrediction.risk_score} className="w-32 h-2" />
                      <span className="font-bold">{selectedPrediction.risk_score}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Livello di Rischio</span>
                    <Badge variant={selectedPrediction.risk_level === 'HIGH' || selectedPrediction.risk_level === 'CRITICAL' ? 'destructive' : 
                                  selectedPrediction.risk_level === 'MEDIUM' ? 'default' : 'secondary'}>
                      {selectedPrediction.risk_level}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Confidence AI</span>
                    <span className="font-medium">{selectedPrediction.confidence}%</span>
                  </div>
                </div>
              </div>

              {/* Factors */}
              <div>
                <h4 className="font-medium mb-3">⚠️ Fattori Contribuenti</h4>
                {selectedPrediction.factors.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPrediction.factors.map((factor, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        {factor}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-green-600 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Nessun fattore di rischio significativo rilevato
                  </p>
                )}
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="font-medium mb-3">💡 Raccomandazioni Quantum</h4>
                <div className="space-y-2">
                  {selectedPrediction.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm bg-blue-50 p-3 rounded">
                      <Zap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      {rec}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button className="flex-1" variant="default">
                  📱 Invia Reminder
                </Button>
                <Button className="flex-1" variant="outline">
                  📞 Chiama Cliente
                </Button>
                <Button className="flex-1" variant="outline">
                  ⚙️ Applica Ottimizzazioni
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default QuantumNoShowDashboard; 