'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Calendar, Users, Package, MessageSquare, Settings, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'

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
  const [open, setOpen] = useState(false)
  // TODO: recupera nome organizzazione via API o context se vuoi
  const organizationName = 'Nome Organizzazione'

  // Ascolta evento custom per apertura sidebar mobile
  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('openSidebar', handler)
    return () => window.removeEventListener('openSidebar', handler)
  }, [])

  // Sidebar vera solo su desktop
  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:h-full md:w-64 md:bg-white md:shadow-lg md:flex md:flex-col z-40">
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
            <nav className="mt-4 flex-1">
              {menu.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 transition
                      ${isActive ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-700 font-semibold' : ''}`}
                    onClick={() => setOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {label}
                  </Link>
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