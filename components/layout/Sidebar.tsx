'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Calendar, Users, Package, MessageSquare, Settings, LogOut, Shield, UserCheck, Brain, Heart, PieChart, Satellite, ChevronDown, ChevronRight, Clock3, DollarSign } from 'lucide-react'
import { useState, useEffect } from 'react'

const navigation = [
  { href: '/dashboard', name: 'Dashboard', icon: BarChart3 },
  { href: '/calendar', name: 'Calendario', icon: Calendar },
  { href: '/clients', name: 'Clienti', icon: Users },
  { href: '/services', name: 'Servizi', icon: Package },
  { href: '/staff', name: 'Staff', icon: UserCheck },
  { href: '/conversations', name: 'Chat WhatsApp', icon: MessageSquare },
  { href: '/dashboard/quantum', name: 'Quantum AI', icon: Brain },
  { href: '/time-singularity', name: 'Time Singularity', icon: Clock3 },
  { href: '/neural-genesis', name: 'Neural Genesis', icon: Brain },
  { href: '/dashboard/client-dna', name: 'Client DNA', icon: Heart },
  { href: '/dashboard/oracle-analytics', name: 'Oracle Analytics', icon: PieChart },
  { href: '/dashboard/financial-analytics', name: 'Analytics Finanziarie', icon: DollarSign },
  {
    name: 'Omni Presence',
    href: '/omni-presence',
    icon: Satellite,
    children: [
      { name: 'Overview', href: '/omni-presence' },
      { name: 'Campagne', href: '/omni-presence/campaigns' },
      { name: 'AI Personas', href: '/omni-presence/ai-personas' },
      { name: 'Analytics', href: '/omni-presence/analytics' },
      { name: 'Configurazioni', href: '/omni-presence/settings' }
    ]
  },
  { href: '/admin', name: 'Admin Panel', icon: Shield },
  { href: '/settings', name: 'Impostazioni', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  
  // TODO: recupera nome organizzazione via API o context se vuoi
  const organizationName = 'Nome Organizzazione'

  // Ascolta evento custom per apertura sidebar mobile
  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('openSidebar', handler)
    return () => window.removeEventListener('openSidebar', handler)
  }, [])

  // Auto-expand menu se siamo in una pagina figlia
  useEffect(() => {
    const activeMenu = navigation.find(item => 
      item.children && item.children.some(child => pathname === child.href || pathname.startsWith(child.href))
    )
    if (activeMenu && !expandedMenus.includes(activeMenu.name)) {
      setExpandedMenus(prev => [...prev, activeMenu.name])
    }
  }, [pathname, expandedMenus])

  // Funzione per determinare se una voce è attiva
  const isActive = (href: string) => pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  // Toggle menu espandibile
  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    )
  }

  // Sidebar vera solo su desktop
  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:h-full md:w-64 md:bg-white md:shadow-lg md:flex md:flex-col z-40">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Beauty AI</h2>
          <p className="text-sm text-gray-600">{organizationName}</p>
        </div>
        <nav className="mt-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300">
          {navigation.map((item) => {
            if (!item.children) {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 transition
                    ${isActive(item.href) ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-700 font-semibold' : ''}`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            }
            // Se ha children (Omni Presence)
            const Icon = item.icon
            const isExpanded = expandedMenus.includes(item.name)
            const parentActive = item.children.some(child => isActive(child.href)) || isActive(item.href)
            
            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`flex items-center justify-between w-full px-6 py-3 text-gray-700 hover:bg-gray-50 transition
                    ${parentActive ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-700 font-semibold' : ''}`}
                >
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                {isExpanded && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map(child => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-3 py-2 rounded text-sm transition
                          ${isActive(child.href) ? 'bg-indigo-100 text-indigo-800 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
        <div className="p-6 mt-auto border-t border-gray-200">
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="flex items-center text-gray-700 hover:text-red-600 w-full">
              <LogOut className="w-5 h-5 mr-3" />
              Esci
            </button>
          </form>
        </div>
      </aside>
      {/* Hamburger per mobile */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-white rounded-full shadow-lg p-2 border border-gray-200"
        onClick={() => setOpen(true)}
        aria-label="Apri menu"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-200" onClick={() => setOpen(false)} tabIndex={0} aria-label="Chiudi menu" />
          <aside className="relative w-4/5 max-w-xs bg-white h-full shadow-lg flex flex-col animate-slide-in-left focus:outline-none" tabIndex={-1} aria-modal="true" role="dialog">
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="text-2xl font-bold text-gray-800">Beauty AI</h2>
              <button onClick={() => setOpen(false)} aria-label="Chiudi menu" className="p-2 rounded-full hover:bg-gray-100">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <nav className="mt-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300">
              {navigation.map((item) => {
                if (!item.children) {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 transition
                        ${isActive(item.href) ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-700 font-semibold' : ''}`}
                      onClick={() => setOpen(false)}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  )
                }
                const Icon = item.icon
                const isExpanded = expandedMenus.includes(item.name)
                const parentActive = item.children.some(child => isActive(child.href)) || isActive(item.href)
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`flex items-center justify-between w-full px-6 py-3 text-gray-700 hover:bg-gray-50 transition
                        ${parentActive ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-700 font-semibold' : ''}`}
                    >
                      <div className="flex items-center">
                        <Icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.children.map(child => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block px-3 py-2 rounded text-sm transition
                              ${isActive(child.href) ? 'bg-indigo-100 text-indigo-800 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                            onClick={() => setOpen(false)}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
            <div className="p-4 mt-auto border-t">
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="flex items-center text-gray-700 hover:text-red-600 w-full">
                  <LogOut className="w-5 h-5 mr-3" />
                  Esci
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </>
  )
} 