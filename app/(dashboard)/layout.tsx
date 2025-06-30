// app/(dashboard)/layout.tsx - Design Moderno
import ModernSidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-pink-500/5 to-violet-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Layout Container */}
      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <ModernSidebar />
        
        {/* Main Content */}
        <main className="flex-1 ml-0 md:ml-64 transition-all duration-300">
          {/* Content Area */}
          <div className="p-4 md:p-8">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 min-h-[calc(100vh-4rem)] p-6 md:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}