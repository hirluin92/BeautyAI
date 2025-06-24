import { requireAuth } from '@/lib/supabase/requireAuth'
import Link from 'next/link'
import { ChevronRight, Shield, AlertTriangle } from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const { userData } = await requireAuth()

  // Verifica se l'utente ha i permessi di admin
  const isAuthorized = userData.role === 'owner' || userData.role === 'admin'

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Accesso Negato
          </h2>
          <p className="text-gray-600 mb-4">
            Non hai i permessi per accedere a questa sezione.
            Solo proprietari e amministratori possono accedere al pannello admin.
          </p>
          <Link 
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Torna alla Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link href="/dashboard" className="hover:text-gray-900 transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4" />
          <span className="font-medium text-gray-900">Admin Panel</span>
        </div>
      </nav>

      {/* Contenuto */}
      {children}
    </div>
  )
} 