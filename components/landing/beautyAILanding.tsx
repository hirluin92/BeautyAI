// components/landing/BeautyAILanding.tsx
'use client'

import React, { useState } from 'react';
import { ChevronRight, CheckCircle, Users, Calendar, Brain, Sparkles, Shield, Zap, ArrowRight, Star, Building, UserPlus } from 'lucide-react';

export default function BeautyAILanding() {
  const [currentStep, setCurrentStep] = useState('presentation');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    organizationName: '',
    organizationDetails: {
      address: '',
      phone: '',
      workingDays: [] as string[],
      openingTime: '09:00',
      closingTime: '18:00',
      description: ''
    },
    staffCode: '',
    userType: ''
  });

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-purple-600" />,
      title: "AI Assistant",
      description: "Assistente intelligente per gestire prenotazioni via WhatsApp automaticamente"
    },
    {
      icon: <Calendar className="w-8 h-8 text-blue-600" />,
      title: "Calendario Avanzato",
      description: "Gestione completa delle prenotazioni con vista calendario e notifiche automatiche"
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Gestione Staff",
      description: "Organizza il tuo team con ruoli e permessi personalizzati"
    },
    {
      icon: <Sparkles className="w-8 h-8 text-pink-600" />,
      title: "Experience Completa",
      description: "Dalla prenotazione al pagamento, tutto in un'unica piattaforma"
    }
  ];

  const workingDays = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleWorkingDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      organizationDetails: {
        ...prev.organizationDetails,
        workingDays: prev.organizationDetails.workingDays.includes(day)
          ? prev.organizationDetails.workingDays.filter(d => d !== day)
          : [...prev.organizationDetails.workingDays, day]
      }
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      if (response.ok) {
        window.location.href = '/dashboard';
      } else {
        const data = await response.json();
        setError(data.error || 'Errore durante il login');
      }
    } catch (error) {
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validazione base
    if (formData.password !== formData.confirmPassword) {
      setError('Le password non coincidono');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('La password deve essere di almeno 8 caratteri');
      return;
    }
    
    setCurrentStep('setupType');
  };

  const handleOwnerSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const registrationData = {
        userData: {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        },
        organizationData: {
          name: formData.organizationName,
          address: formData.organizationDetails.address,
          phone: formData.organizationDetails.phone,
          workingDays: formData.organizationDetails.workingDays,
          openingTime: formData.organizationDetails.openingTime,
          closingTime: formData.organizationDetails.closingTime,
          description: formData.organizationDetails.description
        }
      };
      
      const response = await fetch('/api/auth/register-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentStep('success');
      } else {
        setError(data.error || 'Errore durante la registrazione');
      }
    } catch (error) {
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const staffData = {
        userData: {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        },
        staffCode: formData.staffCode
      };
      
      const response = await fetch('/api/auth/register-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffData)
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentStep('success');
      } else {
        setError(data.error || 'Errore durante la registrazione');
      }
    } catch (error) {
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  const renderPresentation = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-500/10 to-violet-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="p-6">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Beauty AI</span>
            </div>
            <button
              onClick={() => setCurrentStep('login')}
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              Hai già un account? Accedi
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col justify-center items-center text-center px-6 pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-white/90 text-sm font-medium">Powered by Advanced AI</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
                Il Futuro della
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Bellezza</span>
              </h1>
              
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                Trasforma il tuo salone con l'intelligenza artificiale. Gestione automatica delle prenotazioni, 
                assistente AI via WhatsApp e molto altro.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={() => setCurrentStep('register')}
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <span>Inizia Gratis Ora</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="px-8 py-4 bg-white/10 backdrop-blur-md rounded-2xl text-white font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300">
                Scopri di Più
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:transform hover:scale-105"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-white/70 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Social Proof */}
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-white/60 text-sm">
                Oltre 1000+ saloni si fidano di Beauty AI
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  const renderLogin = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-6">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Bentornato!</h2>
          <p className="text-white/70">Accedi al tuo account Beauty AI</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3 text-center">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}
          
          <div>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Accesso...
              </div>
            ) : (
              'Accedi'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setCurrentStep('presentation')}
            className="text-white/70 hover:text-white text-sm"
          >
            ← Torna alla presentazione
          </button>
        </div>
      </div>
    </div>
  );

  const renderRegister = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-6">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Crea Account</h2>
          <p className="text-white/70">Inizia la tua trasformazione digitale</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3 text-center">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}
          
          <div>
            <input
              type="text"
              placeholder="Nome Completo"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <input
              type="tel"
              placeholder="Telefono (opzionale)"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Password (min 8 caratteri)"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              minLength={8}
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Conferma Password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Continua
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setCurrentStep('login')}
            className="text-white/70 hover:text-white text-sm mr-4"
          >
            Hai già un account?
          </button>
          <button
            onClick={() => setCurrentStep('presentation')}
            className="text-white/70 hover:text-white text-sm"
          >
            ← Indietro
          </button>
        </div>
      </div>
    </div>
  );

  const renderSetupType = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-6">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 w-full max-w-2xl border border-white/20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Che tipo di utente sei?</h2>
          <p className="text-white/70">Seleziona il tuo ruolo per continuare</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Owner Card */}
          <div
            onClick={() => {
              handleInputChange('userType', 'owner');
              setCurrentStep('ownerSetup');
            }}
            className="group cursor-pointer bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-6 transition-all duration-300 hover:transform hover:scale-105"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Building className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sono il Proprietario</h3>
              <p className="text-white/70 text-sm mb-4">
                Possiedo o gestisco un salone di bellezza e voglio digitalizzarlo
              </p>
              <div className="space-y-2 text-left">
                <div className="flex items-center text-white/60 text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                  Crea la tua organizzazione
                </div>
                <div className="flex items-center text-white/60 text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                  Gestisci tutto il team
                </div>
                <div className="flex items-center text-white/60 text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                  Accesso amministratore completo
                </div>
              </div>
            </div>
          </div>

          {/* Staff Card */}
          <div
            onClick={() => {
              handleInputChange('userType', 'staff');
              setCurrentStep('staffSetup');
            }}
            className="group cursor-pointer bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-6 transition-all duration-300 hover:transform hover:scale-105"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sono un Collaboratore</h3>
              <p className="text-white/70 text-sm mb-4">
                Lavoro in un salone che usa Beauty AI e voglio accedere al sistema
              </p>
              <div className="space-y-2 text-left">
                <div className="flex items-center text-white/60 text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                  Unisciti al team esistente
                </div>
                <div className="flex items-center text-white/60 text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                  Gestisci le tue prenotazioni
                </div>
                <div className="flex items-center text-white/60 text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                  Approvazione del proprietario
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => setCurrentStep('register')}
            className="text-white/70 hover:text-white text-sm"
          >
            ← Indietro
          </button>
        </div>
      </div>
    </div>
  );

  const renderOwnerSetup = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-6 py-8">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 w-full max-w-2xl border border-white/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Configura il Tuo Salone</h2>
          <p className="text-white/70">Inserisci i dettagli della tua attività</p>
        </div>

        <form onSubmit={handleOwnerSetup} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3 text-center">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Nome del Salone *</label>
              <input
                type="text"
                placeholder="Es. Salone Maria"
                value={formData.organizationName}
                onChange={(e) => handleInputChange('organizationName', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Telefono del Salone</label>
              <input
                type="tel"
                placeholder="+39 123 456 7890"
                value={formData.organizationDetails.phone}
                onChange={(e) => handleInputChange('organizationDetails.phone', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Indirizzo</label>
            <input
              type="text"
              placeholder="Via Roma 123, Milano"
              value={formData.organizationDetails.address}
              onChange={(e) => handleInputChange('organizationDetails.address', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Giorni Lavorativi</label>
            <div className="grid grid-cols-4 gap-2">
              {workingDays.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleWorkingDayToggle(day)}
                  disabled={loading}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
                    formData.organizationDetails.workingDays.includes(day)
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Orario Apertura</label>
              <input
                type="time"
                value={formData.organizationDetails.openingTime}
                onChange={(e) => handleInputChange('organizationDetails.openingTime', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Orario Chiusura</label>
              <input
                type="time"
                value={formData.organizationDetails.closingTime}
                onChange={(e) => handleInputChange('organizationDetails.closingTime', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Descrizione (Opzionale)</label>
            <textarea
              placeholder="Descrivi il tuo salone, specializzazioni, atmosfera..."
              value={formData.organizationDetails.description}
              onChange={(e) => handleInputChange('organizationDetails.description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              disabled={loading}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep('setupType')}
              disabled={loading}
              className="flex-1 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all duration-300 disabled:opacity-50"
            >
              Indietro
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creazione...
                </div>
              ) : (
                'Crea Salone'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderStaffSetup = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-6">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Unisciti al Team</h2>
          <p className="text-white/70">Inserisci il codice fornito dal tuo datore di lavoro</p>
        </div>

        <form onSubmit={handleStaffSetup} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3 text-center">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Codice Salone</label>
            <input
              type="text"
              placeholder="Inserisci il codice (es. SALON123)"
              value={formData.staffCode}
              onChange={(e) => handleInputChange('staffCode', e.target.value.toUpperCase())}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-lg tracking-wider"
              required
              disabled={loading}
            />
          </div>

          <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-white font-medium text-sm mb-1">Come funziona?</h4>
                <p className="text-white/70 text-xs">
                  Dopo la registrazione, il proprietario del salone dovrà approvare il tuo accesso. 
                  Riceverai una notifica via email quando sarai stato approvato.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep('setupType')}
              disabled={loading}
              className="flex-1 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all duration-300 disabled:opacity-50"
            >
              Indietro
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Invio...
                </div>
              ) : (
                'Richiedi Accesso'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/60 text-xs">
            Non hai il codice? Contatta il proprietario del tuo salone
          </p>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-6">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 w-full max-w-md border border-white/20 text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">
          {formData.userType === 'owner' ? 'Salone Creato!' : 'Richiesta Inviata!'}
        </h2>
        
        {formData.userType === 'owner' ? (
          <div>
            <p className="text-white/70 mb-6">
              Il tuo salone <strong className="text-white">{formData.organizationName}</strong> è stato creato con successo. 
              Puoi iniziare subito a gestire prenotazioni e clienti.
            </p>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Accedi alla Dashboard
            </button>
          </div>
        ) : (
          <div>
            <p className="text-white/70 mb-6">
              La tua richiesta di accesso è stata inviata al proprietario. 
              Riceverai una email di conferma quando sarai approvato.
            </p>
            <button
              onClick={() => setCurrentStep('presentation')}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Torna alla Home
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Main render logic
  switch (currentStep) {
    case 'presentation':
      return renderPresentation();
    case 'login':
      return renderLogin();
    case 'register':
      return renderRegister();
    case 'setupType':
      return renderSetupType();
    case 'ownerSetup':
      return renderOwnerSetup();
    case 'staffSetup':
      return renderStaffSetup();
    case 'success':
      return renderSuccess();
    default:
      return renderPresentation();
  }
}