'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Heart,
  Crown,
  Target,
  Sparkles,
  Zap,
  Eye
} from 'lucide-react';

interface ClientDNAProfile {
  client_id: string;
  client_name: string;
  dna_score: number;
  personality_type: 'Explorer' | 'Loyal' | 'Trendsetter' | 'Value-Seeker' | 'Premium';
  beauty_archetype: 'Natural' | 'Glamorous' | 'Sporty' | 'Classic' | 'Avant-garde';
  spending_tier: 'Budget' | 'Mid-Range' | 'Premium' | 'Luxury';
  lifetime_value: number;
  churn_risk: number;
  predicted_needs: Array<{
    service_type: string;
    probability: number;
    optimal_timing: string;
  }>;
  next_best_actions: string[];
  last_analyzed: string;
}

interface DNASegmentBreakdown {
  personality_types: { [key: string]: number };
  beauty_archetypes: { [key: string]: number };
  spending_tiers: { [key: string]: number };
  churn_risk_distribution: { [key: string]: number };
}

const ClientDNADashboard = () => {
  const [profiles, setProfiles] = useState<ClientDNAProfile[]>([]);
  const [segmentBreakdown, setSegmentBreakdown] = useState<DNASegmentBreakdown | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<ClientDNAProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadClientDNAData();
  }, []);

  const loadClientDNAData = async () => {
    setLoading(true);
    try {
      // Simula chiamata API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data realistici
      const mockProfiles: ClientDNAProfile[] = [
        {
          client_id: '1',
          client_name: 'Maria Rossi',
          dna_score: 92,
          personality_type: 'Premium',
          beauty_archetype: 'Glamorous',
          spending_tier: 'Luxury',
          lifetime_value: 2800,
          churn_risk: 15,
          predicted_needs: [
            { service_type: 'Trattamento Anti-Age', probability: 85, optimal_timing: 'next 7 days' },
            { service_type: 'Manicure Premium', probability: 72, optimal_timing: 'in 2 weeks' }
          ],
          next_best_actions: [
            '👑 Offri pacchetto VIP personalizzato',
            '💎 Invita a evento esclusivo',
            '📞 Chiamata personale dal titolare'
          ],
          last_analyzed: new Date().toISOString()
        },
        {
          client_id: '2',
          client_name: 'Giulia Bianchi',
          dna_score: 76,
          personality_type: 'Loyal',
          beauty_archetype: 'Natural',
          spending_tier: 'Mid-Range',
          lifetime_value: 850,
          churn_risk: 25,
          predicted_needs: [
            { service_type: 'Trattamento Viso', probability: 78, optimal_timing: 'next 10 days' }
          ],
          next_best_actions: [
            '🎁 Loyalty reward speciale',
            '📅 Pre-booking prossimi 3 appuntamenti'
          ],
          last_analyzed: new Date().toISOString()
        },
        {
          client_id: '3',
          client_name: 'Anna Verdi',
          dna_score: 45,
          personality_type: 'Explorer',
          beauty_archetype: 'Avant-garde',
          spending_tier: 'Budget',
          lifetime_value: 280,
          churn_risk: 78,
          predicted_needs: [
            { service_type: 'Servizio Base', probability: 45, optimal_timing: 'in 3-4 weeks' }
          ],
          next_best_actions: [
            '🚨 URGENTE: Chiamata di ricontatto entro 24h',
            '💸 Offri sconto personalizzato del 30%',
            '✨ Proponi nuovo servizio innovativo'
          ],
          last_analyzed: new Date().toISOString()
        }
      ];

      const mockSegmentBreakdown: DNASegmentBreakdown = {
        personality_types: {
          'Premium': 12,
          'Loyal': 28,
          'Explorer': 18,
          'Trendsetter': 15,
          'Value-Seeker': 27
        },
        beauty_archetypes: {
          'Glamorous': 22,
          'Natural': 35,
          'Classic': 20,
          'Sporty': 15,
          'Avant-garde': 8
        },
        spending_tiers: {
          'Luxury': 8,
          'Premium': 18,
          'Mid-Range': 45,
          'Budget': 29
        },
        churn_risk_distribution: {
          'Low (0-30%)': 65,
          'Medium (31-60%)': 25,
          'High (61-80%)': 8,
          'Critical (81-100%)': 2
        }
      };

      setProfiles(mockProfiles);
      setSegmentBreakdown(mockSegmentBreakdown);
    } catch (error) {
      console.error('Errore loading DNA data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runBatchAnalysis = async () => {
    setAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await loadClientDNAData();
    } finally {
      setAnalyzing(false);
    }
  };

  const getPersonalityIcon = (type: string) => {
    const icons = {
      'Premium': '👑',
      'Loyal': '💎',
      'Explorer': '🚀',
      'Trendsetter': '✨',
      'Value-Seeker': '🎯'
    };
    return icons[type as keyof typeof icons] || '👤';
  };

  const getArchetypeIcon = (archetype: string) => {
    const icons = {
      'Glamorous': '💄',
      'Natural': '🌿',
      'Classic': '🌹',
      'Sporty': '💪',
      'Avant-garde': '🎨'
    };
    return icons[archetype as keyof typeof icons] || '✨';
  };

  const getSpendingColor = (tier: string) => {
    const colors = {
      'Luxury': 'bg-purple-500',
      'Premium': 'bg-blue-500',
      'Mid-Range': 'bg-green-500',
      'Budget': 'bg-gray-500'
    };
    return colors[tier as keyof typeof colors] || 'bg-gray-500';
  };

  const getChurnRiskColor = (risk: number) => {
    if (risk <= 30) return 'text-green-600';
    if (risk <= 60) return 'text-yellow-600';
    if (risk <= 80) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-12">
          <div className="text-center space-y-4">
            <Brain className="h-12 w-12 text-purple-500 animate-pulse mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">🧬 DNA Analysis in corso...</h3>
              <p className="text-sm text-muted-foreground">
                L'AI sta decodificando il DNA comportamentale dei tuoi clienti
              </p>
              <div className="w-64 mx-auto">
                <Progress value={85} className="h-2" />
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
            <Brain className="h-7 w-7 text-purple-500" />
            Client DNA System
          </h1>
          <p className="text-sm text-muted-foreground">
            Decodifica il DNA comportamentale e anticipa ogni desiderio beauty
          </p>
        </div>
        <Button 
          onClick={runBatchAnalysis}
          disabled={analyzing}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
        >
          {analyzing ? (
            <>
              <Zap className="h-4 w-4 mr-2 animate-spin" />
              Sequenziando DNA...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Scopri DNA Clienti
            </>
          )}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profili Analizzati</p>
                <p className="text-2xl font-bold">{profiles.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">DNA Score Medio</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(profiles.reduce((sum, p) => sum + p.dna_score, 0) / profiles.length)}
                </p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clienti Premium</p>
                <p className="text-2xl font-bold text-blue-600">
                  {profiles.filter(p => p.spending_tier === 'Premium' || p.spending_tier === 'Luxury').length}
                </p>
              </div>
              <Crown className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">A Rischio Churn</p>
                <p className="text-2xl font-bold text-red-600">
                  {profiles.filter(p => p.churn_risk > 70).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">DNA Overview</TabsTrigger>
          <TabsTrigger value="profiles">Profili Clienti</TabsTrigger>
          <TabsTrigger value="segments">Segmentazione</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* DNA Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Archetipi Beauty Dominanti
                </CardTitle>
              </CardHeader>
              <CardContent>
                {segmentBreakdown && Object.entries(segmentBreakdown.beauty_archetypes).map(([archetype, count]) => (
                  <div key={archetype} className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span>{getArchetypeIcon(archetype)}</span>
                      <span className="text-sm font-medium">{archetype}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${(count / 100) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground">{count}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Distribuzione Valore
                </CardTitle>
              </CardHeader>
              <CardContent>
                {segmentBreakdown && Object.entries(segmentBreakdown.spending_tiers).map(([tier, count]) => (
                  <div key={tier} className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getSpendingColor(tier)}`}></div>
                      <span className="text-sm font-medium">{tier}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getSpendingColor(tier)}`}
                          style={{ width: `${(count / 100) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground">{count}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          {profiles.map((profile) => (
            <Card 
              key={profile.client_id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedProfile(profile)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {profile.client_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{profile.client_name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{getPersonalityIcon(profile.personality_type)} {profile.personality_type}</span>
                        <span>•</span>
                        <span>{getArchetypeIcon(profile.beauty_archetype)} {profile.beauty_archetype}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">{profile.dna_score}</div>
                    <div className="text-sm text-muted-foreground">DNA Score</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Lifetime Value</p>
                    <p className="font-semibold">€{profile.lifetime_value.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Spending Tier</p>
                    <Badge className={`${getSpendingColor(profile.spending_tier)} text-white`}>
                      {profile.spending_tier}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Churn Risk</p>
                    <p className={`font-semibold ${getChurnRiskColor(profile.churn_risk)}`}>
                      {profile.churn_risk}%
                    </p>
                  </div>
                </div>

                {profile.predicted_needs.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">🔮 Bisogni Predetti:</p>
                    <div className="space-y-1">
                      {profile.predicted_needs.slice(0, 2).map((need, index) => (
                        <div key={index} className="flex items-center justify-between text-sm bg-purple-50 p-2 rounded">
                          <span>{need.service_type}</span>
                          <span className="text-purple-600 font-medium">{need.probability}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium mb-2">💡 Azioni Raccomandate:</p>
                  <div className="space-y-1">
                    {profile.next_best_actions.slice(0, 2).map((action, index) => (
                      <p key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {action}
                      </p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="segments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personalità Dominanti</CardTitle>
              </CardHeader>
              <CardContent>
                {segmentBreakdown && Object.entries(segmentBreakdown.personality_types).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <span>{getPersonalityIcon(type)}</span>
                      <span>{type}</span>
                    </div>
                    <span className="font-semibold">{count}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rischio Churn</CardTitle>
              </CardHeader>
              <CardContent>
                {segmentBreakdown && Object.entries(segmentBreakdown.churn_risk_distribution).map(([risk, count]) => (
                  <div key={risk} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 ${
                        risk.includes('Critical') ? 'text-red-500' :
                        risk.includes('High') ? 'text-orange-500' :
                        risk.includes('Medium') ? 'text-yellow-500' : 'text-green-500'
                      }`} />
                      <span>{risk}</span>
                    </div>
                    <span className="font-semibold">{count}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detailed Profile Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  DNA Completo: {selectedProfile.client_name}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedProfile(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* DNA Score Ring */}
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-32 h-32">
                  <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
                  <div 
                    className="absolute inset-0 rounded-full border-8 border-purple-500 transform -rotate-90"
                    style={{
                      background: `conic-gradient(from 0deg, #8b5cf6 ${selectedProfile.dna_score * 3.6}deg, transparent ${selectedProfile.dna_score * 3.6}deg)`
                    }}
                  ></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{selectedProfile.dna_score}</div>
                    <div className="text-sm text-muted-foreground">DNA Score</div>
                  </div>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">{getPersonalityIcon(selectedProfile.personality_type)}</div>
                  <div className="font-semibold">{selectedProfile.personality_type}</div>
                  <div className="text-sm text-muted-foreground">Personalità</div>
                </div>
                
                <div className="bg-pink-50 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">{getArchetypeIcon(selectedProfile.beauty_archetype)}</div>
                  <div className="font-semibold">{selectedProfile.beauty_archetype}</div>
                  <div className="text-sm text-muted-foreground">Archetipo Beauty</div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">💰</div>
                  <div className="font-semibold">€{selectedProfile.lifetime_value.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Lifetime Value</div>
                </div>
                
                <div className={`p-4 rounded-lg text-center ${
                  selectedProfile.churn_risk > 70 ? 'bg-red-50' :
                  selectedProfile.churn_risk > 40 ? 'bg-yellow-50' : 'bg-green-50'
                }`}>
                  <div className="text-2xl mb-2">⚠️</div>
                  <div className={`font-semibold ${getChurnRiskColor(selectedProfile.churn_risk)}`}>
                    {selectedProfile.churn_risk}%
                  </div>
                  <div className="text-sm text-muted-foreground">Churn Risk</div>
                </div>
              </div>

              {/* Predicted Needs */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Bisogni Predetti
                </h4>
                <div className="space-y-3">
                  {selectedProfile.predicted_needs.map((need, index) => (
                    <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{need.service_type}</h5>
                        <Badge variant="outline" className="bg-white">
                          {need.probability}% probabilità
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>⏰ Timing ottimale: {need.optimal_timing}</span>
                      </div>
                      <div className="mt-2">
                        <Progress value={need.probability} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Best Actions */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Azioni Raccomandate
                </h4>
                <div className="space-y-2">
                  {selectedProfile.next_best_actions.map((action, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Zap className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm">{action}</p>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs">
                        Esegui
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button className="flex-1" variant="default">
                  📱 Contatta Cliente
                </Button>
                <Button className="flex-1" variant="outline">
                  📅 Prenota Automatico
                </Button>
                <Button className="flex-1" variant="outline">
                  🔄 Re-analizza DNA
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClientDNADashboard; 