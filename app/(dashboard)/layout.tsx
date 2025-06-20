import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <Sidebar />
      <main className="w-full md:ml-64 p-2 md:p-8 bg-white md:bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  )
}