// app/(auth)/login/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Sparkles, ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccess('Registrazione completata! Controlla la tua email per confermare l\'account.')
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Errore durante il login')
        return
      }
      // Login ok: usa window.location per forzare un vero redirect HTTP
      const redirectTo = searchParams.get('redirectedFrom') || '/dashboard'
      window.location.href = redirectTo
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center px-6">
      {/* Background Effects - identici alla landing page */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-500/10 to-violet-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Back to Landing Link */}
      <div className="absolute top-6 left-6 z-20">
        <a
          href="/"
          className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors text-sm font-medium group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Torna alla Home</span>
        </a>
      </div>

      {/* Login Card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-3xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Bentornato!</h2>
          <p className="text-white/70">Accedi al tuo account Beauty AI</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Success Message */}
          {success && (
            <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 text-center">
              <p className="text-green-200 text-sm">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 text-center">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Email Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-white/50" />
            </div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
              disabled={loading}
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-white/50" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-white/50 hover:text-white/70 transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-white/50 hover:text-white/70 transition-colors" />
              )}
            </button>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 bg-white/10 border border-white/30 rounded focus:ring-purple-500 focus:ring-2 text-purple-600"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-white/70">
                Ricordami
              </label>
            </div>

            <div className="text-sm">
              <a 
                href="/forgot-password" 
                className="text-white/70 hover:text-white transition-colors underline"
              >
                Password dimenticata?
              </a>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Accesso in corso...
              </div>
            ) : (
              'Accedi'
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-white/60">oppure</span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-white/70 text-sm">
              Non hai ancora un account?{' '}
              <a 
                href="/" 
                className="text-white font-semibold hover:text-purple-300 transition-colors"
              >
                Registrati gratis
              </a>
            </p>
            <p className="text-white/50 text-xs mt-2">
              Setup in 2 minuti, nessuna carta di credito richiesta
            </p>
          </div>
        </form>
      </div>

      {/* Feature Highlights */}
      <div className="absolute bottom-6 left-6 right-6 z-10">
        <div className="flex justify-center space-x-8 text-white/60 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>AI Assistant</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>WhatsApp Integration</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
            <span>Calendario Smart</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white/70">Caricamento...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}