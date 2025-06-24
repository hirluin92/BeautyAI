// app/(auth)/complete-setup/page.tsx - NUOVA PAGINA
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CompleteSetupPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [organizationName, setOrganizationName] = useState('')
  const [fullName, setFullName] = useState('')
  const [completing, setCompleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const checkUser = useCallback(async () => {
    try {
      console.log('🔍 Complete Setup - Checking user...')
      
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.log('❌ No user found, redirecting to login')
        router.push('/login')
        return
      }

      console.log('✅ User found:', user.id)
      setFullName(user.user_metadata?.full_name || user.email || '')

      // Verifica se l'utente esiste già nel database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*, organization:organizations(*)')
        .eq('id', user.id)
        .single()

      if (!userError && userData) {
        // Utente già completo, redirect al dashboard
        console.log('✅ User already complete, redirecting to dashboard')
        router.push('/dashboard/dashboard')
        return
      }

      console.log('ℹ️ User needs setup, showing form')
      setLoading(false)

    } catch (error) {
      console.error('❌ Error checking user:', error)
      setError('Errore durante la verifica utente')
      setLoading(false)
    }
  }, [router, supabase])

  useEffect(() => {
    checkUser()
  }, [checkUser])

  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setCompleting(true)
    setError(null)

    try {
      console.log('🚀 Starting setup completion...')

      const response = await fetch('/api/auth/complete-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          organizationName
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante il completamento setup')
      }

      console.log('✅ Setup completed successfully')
      router.push('/dashboard/dashboard')

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Errore durante il completamento setup'
      console.error('❌ Setup error:', error)
      setError(errorMessage)
    } finally {
      setCompleting(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">Verificando il tuo account...</h2>
            <p className="mt-2 text-gray-600">Un momento per favore</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
            <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Completa il Setup</h1>
          <p className="text-gray-600 mt-2">
            Ultimi dettagli per iniziare ad usare Beauty AI
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleCompleteSetup} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo *
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Il tuo nome completo"
              disabled={completing}
            />
          </div>

          <div>
            <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-1">
              Nome del Salone *
            </label>
            <input
              id="organizationName"
              name="organizationName"
              type="text"
              required
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Nome del tuo salone di bellezza"
              disabled={completing}
            />
            <p className="mt-1 text-xs text-gray-500">
              Es: &quot;Salone Maria&quot;, &quot;Beauty Center Milano&quot;, ecc.
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={completing || !fullName.trim() || !organizationName.trim()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {completing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Completamento in corso...
                </div>
              ) : (
                'Completa Setup'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
            disabled={completing}
          >
            Esci e riprova con un altro account
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Hai bisogno di aiuto? Contatta il supporto
          </p>
        </div>
      </div>
    </div>
  )
}