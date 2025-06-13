'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Calendar, Users, Package, MessageSquare, Settings, LogOut } from 'lucide-react'

const menu = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/calendar', label: 'Calendario', icon: Calendar },
  { href: '/clients', label: 'Clienti', icon: Users },
  { href: '/services', label: 'Servizi', icon: Package },
  { href: '/chat', label: 'Chat WhatsApp', icon: MessageSquare },
  { href: '/settings', label: 'Impostazioni', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  // TODO: recupera nome organizzazione via API o context se vuoi
  const organizationName = 'Nome Organizzazione'

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800">Beauty AI</h2>
        <p className="text-sm text-gray-600">{organizationName}</p>
      </div>
      <nav className="mt-8 flex-1">
        {menu.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 transition
                ${isActive ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-700 font-semibold' : ''}`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="p-6 mt-auto">
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="flex items-center text-gray-700 hover:text-red-600 w-full">
            <LogOut className="w-5 h-5 mr-3" />
            Esci
          </button>
        </form>
      </div>
    </aside>
  )
} 