'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Briefcase, 
  UserCheck, 
  Settings, 
  BarChart3, 
  MessageCircle, 
  Sparkles,
  Menu,
  X,
  LogOut,
  User,
  Building2
} from 'lucide-react'

const menuItems = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    href: '/calendar',
    icon: Calendar,
    label: 'Calendario',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    href: '/bookings',
    icon: Briefcase,
    label: 'Prenotazioni',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    href: '/clients',
    icon: Users,
    label: 'Clienti',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    href: '/services',
    icon: UserCheck,
    label: 'Servizi',
    gradient: 'from-violet-500 to-purple-500'
  },
  {
    href: '/staff',
    icon: UserCheck,
    label: 'Staff',
    gradient: 'from-indigo-500 to-blue-500'
  },
  {
    href: '/analytics',
    icon: BarChart3,
    label: 'Analytics',
    gradient: 'from-teal-500 to-green-500'
  },
  {
    href: '/ai-chat',
    icon: MessageCircle,
    label: 'AI Assistant',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    href: '/settings',
    icon: Settings,
    label: 'Impostazioni',
    gradient: 'from-gray-500 to-slate-500'
  }
]

export default function ModernSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white hover:bg-white/20 transition-all"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 
          bg-gradient-to-b from-purple-700 via-purple-600 to-violet-800
          backdrop-blur-xl border-r border-white/20
          transform transition-transform duration-300 z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Beauty AI</h1>
                <p className="text-white/60 text-sm">Dashboard</p>
              </div>
            </div>
          </div>

          {/* Time Display */}
          <div className="px-6 py-4 border-b border-white/10">
            <div className="text-center">
              <div className="text-white/90 font-mono text-lg">
                {currentTime.toLocaleTimeString('it-IT', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <div className="text-white/60 text-sm">
                {currentTime.toLocaleDateString('it-IT', { 
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short'
                })}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    group flex items-center space-x-3 px-4 py-3 rounded-xl
                    transition-all duration-300 relative overflow-hidden
                    ${isActive 
                      ? 'bg-white/20 text-white shadow-lg' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r opacity-20 rounded-xl"
                         style={{
                           backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                         }} 
                    />
                  )}
                  
                  {/* Icon with gradient */}
                  <div className={`
                    w-6 h-6 rounded-lg flex items-center justify-center
                    ${isActive ? `bg-gradient-to-r ${item.gradient}` : ''}
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <span className="font-medium">{item.label}</span>
                  
                  {/* Active glow effect */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl ring-1 ring-white/30" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="p-6 border-t border-white/10">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 space-y-3">
              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    Mimmo Ricci
                  </p>
                  <p className="text-white/60 text-xs">Owner</p>
                </div>
              </div>

              {/* Organization */}
              <div className="flex items-center space-x-2 text-white/60">
                <Building2 className="w-4 h-4" />
                <span className="text-xs truncate">Prinpi</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-white/10 hover:bg-red-500/20 text-white/70 hover:text-red-300 rounded-lg transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}