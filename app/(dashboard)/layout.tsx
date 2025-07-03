'use client'

import { usePathname } from 'next/navigation'
import ModernSidebar from '@/components/layout/Sidebar'
import { useEffect } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Il calendario ha uno stile speciale ma mantiene la sidebar
  const isCalendarPage = pathname === '/calendar'
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects - Solo per pagine non-calendario */}
      {!isCalendarPage && (
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-pink-500/5 to-violet-500/5 rounded-full blur-3xl"></div>
        </div>
      )}
      
      {/* Layout Container */}
      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar - SEMPRE PRESENTE */}
        <ModernSidebar />
        
        {/* Main Content */}
        <main className="flex-1 ml-0 md:ml-64 transition-all duration-300">
          {isCalendarPage ? (
            // CALENDAR FIX: Rimuovo h-screen e overflow-hidden, aggiungo overflow-auto
            <div className="min-h-screen p-2">
              <div className="min-h-full rounded-2xl overflow-auto calendar-container-wrapper">
                {children}
              </div>
            </div>
          ) : (
            // Altre pagine con wrapper normale
            <div className="p-4 md:p-8">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 min-h-[calc(100vh-4rem)] p-6 md:p-8">
                {children}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Calendar-specific styles */}
      {isCalendarPage && (
        <style jsx global>{`
          .calendar-container-wrapper {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            /* Stili scroll migliorati */
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
          }
          
          .calendar-container-wrapper::-webkit-scrollbar {
            width: 8px;
          }
          
          .calendar-container-wrapper::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 4px;
          }
          
          .calendar-container-wrapper::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .calendar-container-wrapper::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
          
          /* Migliore leggibilità per il calendario */
          .calendar-container-wrapper .text-white\/70 {
            color: rgba(255, 255, 255, 0.9) !important;
          }
          
          .calendar-container-wrapper .text-white\/80 {
            color: rgba(255, 255, 255, 0.95) !important;
          }
        `}</style>
      )}
    </div>
  )
}